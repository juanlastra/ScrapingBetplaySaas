"use client"

import { useEffect, useState } from "react"

/* ─────────────────── TIPOS ─────────────────── */

type CuotaItem = {
  equipo: string
  cuota: number
}

type ResultadoRow = {
  local: number | null
  empate: number | null
  visitante: number | null
  tiempo: string | null
  goles: string | null
}

type TiroEsquinaItem = {
  local: CuotaItem | null
  empate: CuotaItem | null
  visitante: CuotaItem | null
}

type MarcadorAPI = {
  tiempo: string
  local: { stats: { goles: number } }
  visitante: { stats: { goles: number } }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://betplayscrapergoservice.onrender.com"

type Props = {
  sessionKey: number
}

/* ─────────────────── COMPONENTE ─────────────────── */

export default function MercadosPrincipalesPanel({ sessionKey }: Props) {
  const MAX_ROWS = 7

  const [resultadoRows, setResultadoRows] = useState<ResultadoRow[]>([])
  const [cornersRows, setCornersRows] = useState<TiroEsquinaItem[]>([])
  const [hasData, setHasData] = useState(false)

  /* ─────────────────── FETCHERS ─────────────────── */

  const fetchResultadoTiempo = async () => {
    try {
      const [resCuotas, resMarcador] = await Promise.all([
        fetch(`${API_URL}/api/resultado-tiempo`),
        fetch(`${API_URL}/api/marcador`),
      ])

      const cuotas: CuotaItem[][] = await resCuotas.json()
      const marcador: MarcadorAPI | null = await resMarcador.json()

      if (!Array.isArray(cuotas) || cuotas.length === 0 || !marcador) return

      const snap = cuotas[cuotas.length - 1]
      if (!Array.isArray(snap) || snap.length !== 3) return

      const nuevaFila: ResultadoRow = {
        local: snap[0].cuota,
        empate: snap[1].cuota,
        visitante: snap[2].cuota,
        tiempo: marcador.tiempo,
        goles: `${marcador.local.stats.goles}-${marcador.visitante.stats.goles}`,
      }

      setResultadoRows(prev =>
        [...prev, nuevaFila].slice(-MAX_ROWS)
      )

      setHasData(true)
    } catch {
      setHasData(false)
    }
  }

  const fetchTirosEsquina = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tiros-esquina`)
      const json = await res.json()

      if (!Array.isArray(json)) return

      setCornersRows(prev =>
        [...prev, json[json.length - 1]].slice(-MAX_ROWS)
      )

      setHasData(true)
    } catch {
      setHasData(false)
    }
  }

  /* ─────────────────── INTERVALO ─────────────────── */

  useEffect(() => {
    setResultadoRows([])
    setCornersRows([])
    setHasData(false)

    fetchResultadoTiempo()
    fetchTirosEsquina()

    const interval = setInterval(() => {
      fetchResultadoTiempo()
      fetchTirosEsquina()
    }, 60_000)

    return () => clearInterval(interval)
  }, [sessionKey])

  /* ─────────────────── HELPERS ─────────────────── */

  const fillResultado = [...resultadoRows]
  while (fillResultado.length < MAX_ROWS) {
    fillResultado.unshift({
      local: null,
      empate: null,
      visitante: null,
      tiempo: null,
      goles: null,
    })
  }

  const fillCorners = [...cornersRows]
  while (fillCorners.length < MAX_ROWS) {
    fillCorners.unshift({
      local: null,
      empate: null,
      visitante: null,
    })
  }

  const format = (n: number | null) =>
    n === null ? "" : n.toFixed(2)

  /* ─────────────────── UI ─────────────────── */

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full min-h-[360px]">
      {/* ───────── TIEMPO REGLAMENTARIO ───────── */}
      <div className="bg-white rounded shadow p-4 flex flex-col">

        <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
  <span className="h-4 w-1 bg-blue-700 rounded-sm"></span>
  Ganador en Tiempo Reglamentario
</h2>


        <div className="h-[280px] flex items-center justify-center relative top-[-10px]">
          {!hasData ? (
            <div className="text-slate-500">Sin datos disponibles</div>
          ) : (
            <table className="w-full table-fixed text-black">
              <thead className="bg-slate-200">
                <tr>
                  <th className="text-center">Tiempo</th>
                  <th className="text-center">Local</th>
                  <th className="text-center">Empate</th>
                  <th className="text-center">Visitante</th>
                  <th className="text-center">Goles</th>
                </tr>
              </thead>
              <tbody>
                {fillResultado.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="text-center">{r.tiempo ?? ""}</td>
                    <td className="text-center">{format(r.local)}</td>
                    <td className="text-center">{format(r.empate)}</td>
                    <td className="text-center">{format(r.visitante)}</td>
                    <td className="text-center">{r.goles ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ───────── TIROS DE ESQUINA ───────── */}
      <div className="bg-white rounded shadow p-4 flex flex-col">
<h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
  <span className="h-4 w-1 bg-blue-700 rounded-sm"></span>
  Dominio en Tiros de Esquina
</h2>



        <div className="h-[280px] flex items-center justify-center relative top-[-10px]">
          {!hasData ? (
            <div className="text-slate-500">Sin datos disponibles</div>
          ) : (
            <table className="w-full table-fixed text-black">
              <thead className="bg-slate-200">
                <tr>
                  <th className="text-center">Local</th>
                  <th className="text-center">Empate</th>
                  <th className="text-center">Visitante</th>
                </tr>
              </thead>
              <tbody>
                {fillCorners.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="text-center">
                      {r.local?.cuota?.toFixed(2) ?? ""}
                    </td>
                    <td className="text-center">
                      {r.empate?.cuota?.toFixed(2) ?? ""}
                    </td>
                    <td className="text-center">
                      {r.visitante?.cuota?.toFixed(2) ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
