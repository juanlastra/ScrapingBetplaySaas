"use client"

import { useEffect, useRef, useState } from "react"
import { FileSpreadsheet, FileText, Braces } from "lucide-react"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

type ExportRow = Record<string, string | number | null>
type CuotaItem = { equipo: string; cuota: number }

async function fetchSafeJSON(url: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    return JSON.parse(text)
  } catch {
    return null
  }
}

export default function DescargarDatosPanel() {
  const dataRef = useRef<ExportRow[]>([])
  const [rowsCount, setRowsCount] = useState(0)

  useEffect(() => {
    const collect = async () => {
      const [marcadorRes, resultadoRes, cornersRes] =
        await Promise.all([
          fetchSafeJSON(`${API_URL}/api/marcador`),
          fetchSafeJSON(`${API_URL}/api/resultado-tiempo`),
          fetchSafeJSON(`${API_URL}/api/tiros-esquina`),
        ])

      if (!marcadorRes?.datos?.Marcador) return

      const m = marcadorRes.datos.Marcador
      const local = m.local
      const visitante = m.visitante

      const ultimoResultado: CuotaItem[] | null =
        Array.isArray(resultadoRes) && resultadoRes.length
          ? resultadoRes.at(-1)
          : null

      const corners = cornersRes?.slice?.(-1)?.[0] ?? null

      const row: ExportRow = {
        "Tiempo partido": `${m.periodo} ${m.tiempo}`,

        [`Goles ${local.equipo}`]: local.stats.goles,
        [`Goles ${visitante.equipo}`]: visitante.stats.goles,

        "Tarjetas amarillas":
          local.stats.tarjeta_amarilla +
          visitante.stats.tarjeta_amarilla,

        "Tarjetas rojas":
          local.stats.tarjeta_roja + visitante.stats.tarjeta_roja,

        Corners: local.stats.corner + visitante.stats.corner,

        [`Cuota victoria ${local.equipo}`]:
          ultimoResultado?.find(x => x.equipo === local.equipo)?.cuota ?? null,

        "Cuota empate":
          ultimoResultado?.find(x => x.equipo === "Empate")?.cuota ?? null,

        [`Cuota victoria ${visitante.equipo}`]:
          ultimoResultado?.find(x => x.equipo === visitante.equipo)?.cuota ??
          null,

        [`Cuota más corners ${local.equipo}`]:
          corners?.local?.cuota ?? null,

        "Cuota empate corners":
          corners?.empate?.cuota ?? null,

        [`Cuota más corners ${visitante.equipo}`]:
          corners?.visitante?.cuota ?? null,
      }

      dataRef.current.push(row)
      setRowsCount(dataRef.current.length)
    }

    collect()
    const id = setInterval(collect, 60_000)

    return () => clearInterval(id)
  }, [])

  const download = async (format: "json" | "csv" | "excel") => {
    const data = dataRef.current
    if (!data.length) return

    if (format === "json") {
      save(new Blob([JSON.stringify(data, null, 2)]), "datos.json")
    }

    if (format === "csv") {
      const headers = Object.keys(data[0])
      const csv = [
        headers.join(","),
        ...data.map(r =>
          headers.map(h => `"${r[h] ?? ""}"`).join(",")
        ),
      ].join("\n")
      save(new Blob([csv]), "datos.csv")
    }

    if (format === "excel") {
      const XLSX = await import("xlsx")
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Datos")
      XLSX.writeFile(wb, "datos.xlsx")
    }
  }

  const save = (blob: Blob, name: string) => {
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
  }

  const disabled = rowsCount === 0

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold mb-2">Descargar datos</h2>

      <p className="text-sm mb-4">
        Registros acumulados: <strong>{rowsCount}</strong>
      </p>

      <div className="flex gap-4">
        {[
          { f: "json", icon: <Braces size={18} />, label: "JSON" },
          { f: "csv", icon: <FileText size={18} />, label: "CSV" },
          { f: "excel", icon: <FileSpreadsheet size={18} />, label: "Excel" },
        ].map(b => (
          <button
            key={b.f}
            disabled={disabled}
            onClick={() => download(b.f as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition
              ${
                disabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            {b.icon}
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
