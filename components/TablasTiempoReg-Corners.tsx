"use client"

import { useEffect, useState } from "react"

/* ─────────────────── TIPOS ─────────────────── */

type CuotaItem = {
  equipo: string
  cuota: number
}

type ResultadoRow = {
  index: number
  local: number
  empate: number
  visitante: number
}

type TiroEsquinaItem = {
  local: CuotaItem
  empate: CuotaItem
  visitante: CuotaItem
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/* ─────────────────── COMPONENTE ─────────────────── */

export default function MercadosPrincipalesPanel() {
  /* -------- Tiempo reglamentario -------- */
  const [resultadoRows, setResultadoRows] = useState<ResultadoRow[]>([])
  const [headers, setHeaders] = useState<{
    local: string
    visitante: string
  } | null>(null)

  /* -------- Tiros de esquina -------- */
  const [cornersRows, setCornersRows] = useState<TiroEsquinaItem[]>([])

  /* ─────────────────── FETCHERS ─────────────────── */

  const fetchResultadoTiempo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/resultado-tiempo`)
      const data: CuotaItem[][] = await res.json()

      if (!Array.isArray(data)) return

      const validSnapshots = data.filter(
        snap => Array.isArray(snap) && snap.length === 3
      )

      if (validSnapshots.length === 0) return

      if (!headers) {
        setHeaders({
          local: validSnapshots[0][0].equipo,
          visitante: validSnapshots[0][2].equipo,
        })
      }

      const parsed: ResultadoRow[] = validSnapshots.map(
        (snap, index) => ({
          index,
          local: snap[0].cuota,
          empate: snap[1].cuota,
          visitante: snap[2].cuota,
        })
      )

      setResultadoRows(parsed)
    } catch (err) {
      console.error("Error resultado tiempo reglamentario:", err)
    }
  }

  const fetchTirosEsquina = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tiros-esquina`)
      const json = await res.json()

      if (Array.isArray(json)) {
        setCornersRows(json)
      }
    } catch (err) {
      console.error("Error tiros de esquina:", err)
    }
  }

  /* ─────────────────── INTERVALO ─────────────────── */

  useEffect(() => {
    fetchResultadoTiempo()
    fetchTirosEsquina()

    const interval = setInterval(() => {
      fetchResultadoTiempo()
      fetchTirosEsquina()
    }, 30_000)

    return () => clearInterval(interval)
  }, [])

  /* ─────────────────── HELPERS ─────────────────── */

  const resultadoVisible = resultadoRows.slice(-5)
  const cornersVisible = cornersRows.slice(-5)

  const format = (n: number) => n.toFixed(1)

  /* ─────────────────── UI ─────────────────── */

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* ─────────── TIEMPO REGLAMENTARIO ─────────── */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3 text-black">
          🏆 Ganador en Tiempo Reglamentario
        </h2>

        <div className="overflow-y-auto">
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-slate-200">
              <tr className="text-black">
                <th className="p-2 w-1/3">
                  {headers?.local ?? "Local"}
                </th>
                <th className="p-2 w-1/3">Empate</th>
                <th className="p-2 w-1/3">
                  {headers?.visitante ?? "Visitante"}
                </th>
              </tr>
            </thead>

            <tbody>
              {resultadoVisible.map((row, idx) => {
                const isLastTwo =
                  idx >= resultadoVisible.length - 2

                return (
                  <tr
                    key={row.index}
                    className={`border-b last:border-0 ${
                      isLastTwo
                        ? "bg-sky-200/60 font-semibold"
                        : ""
                    }`}
                  >
                    <td className="p-2 text-black">
                      {format(row.local)}
                    </td>
                    <td className="p-2 text-black">
                      {format(row.empate)}
                    </td>
                    <td className="p-2 text-black">
                      {format(row.visitante)}
                    </td>
                  </tr>
                )
              })}

              {resultadoVisible.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-center text-slate-500"
                  >
                    Sin datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────── TIROS DE ESQUINA ─────────── */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3 text-black">
          🚩 Dominio en Tiros de Esquina
        </h2>

        <div className="overflow-y-auto">
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-slate-200">
              <tr className="text-black">
                <th className="p-2 w-1/3">Local</th>
                <th className="p-2 w-1/3">Empate</th>
                <th className="p-2 w-1/3">Visitante</th>
              </tr>
            </thead>

            <tbody>
              {cornersVisible.map((row, idx) => {
                const isLastTwo =
                  idx >= cornersVisible.length - 2

                return (
                  <tr
                    key={idx}
                    className={`border-b last:border-0 ${
                      isLastTwo
                        ? "bg-sky-200/60 font-semibold"
                        : ""
                    }`}
                  >
                    <td className="p-2 text-black">
                      {format(row.local.cuota)}
                    </td>
                    <td className="p-2 text-black">
                      {format(row.empate.cuota)}
                    </td>
                    <td className="p-2 text-black">
                      {format(row.visitante.cuota)}
                    </td>
                  </tr>
                )
              })}

              {cornersVisible.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-center text-slate-500"
                  >
                    Sin datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

