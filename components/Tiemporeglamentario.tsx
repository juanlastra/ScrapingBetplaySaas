"use client"

import { useEffect, useState, useRef } from "react"

type CuotaItem = {
  equipo: string
  cuota: number
}

type TableRow = {
  index: number
  local: number
  empate: number
  visitante: number
}

type ResultadosPanelProps = {
  intervalMinutes: number
  scrapingStarted: boolean
}

export default function ResultadosPanel({
  intervalMinutes,
  scrapingStarted,
}: ResultadosPanelProps) {
  const [rows, setRows] = useState<TableRow[]>([])
  const [headers, setHeaders] = useState<{
    local: string
    visitante: string
  } | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = () => {
    fetch("http://localhost:8080/api/resultado-tiempo")
      .then(res => res.json())
      .then((data: CuotaItem[][]) => {
        if (!Array.isArray(data)) return

        // 🔴 IGNORAR snapshots vacíos
        const validSnapshots = data.filter(
          snapshot => Array.isArray(snapshot) && snapshot.length === 3
        )

        if (validSnapshots.length === 0) return

        // Headers (una sola vez)
        if (!headers) {
          const first = validSnapshots[0]
          setHeaders({
            local: first[0].equipo,
            visitante: first[2].equipo,
          })
        }

        const parsedRows: TableRow[] = validSnapshots.map(
          (snapshot, index) => ({
            index,
            local: snapshot[0].cuota,
            empate: snapshot[1].cuota,
            visitante: snapshot[2].cuota,
          })
        )

        setRows(parsedRows)
      })
      .catch(err =>
        console.error("Error obteniendo tiempo reglamentario:", err)
      )
  }

  useEffect(() => {
    if (!scrapingStarted) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    timeoutRef.current = setTimeout(() => {
      fetchData()
      intervalRef.current = setInterval(
        fetchData,
        intervalMinutes * 60 * 1000
      )
    }, intervalMinutes * 60 * 1000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [scrapingStarted, intervalMinutes])

  const visibleRows = rows.slice(-15)
  const formatNumber = (value: number) => value.toFixed(1)

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white rounded shadow p-4 w-full">
        <h2 className="text-lg font-semibold mb-3 text-black">
          Tiempo reglamentario
        </h2>

        {rows.length === 0 && scrapingStarted && (
          <p className="text-sm text-slate-500 mb-3">
            Esperando primer resultado...
          </p>
        )}

        <div className="max-h-[420px] overflow-y-auto w-full">
          <table className="w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-slate-200">
              <tr className="text-left text-black">
                <th className="p-2 w-1/3">{headers?.local ?? "Local"}</th>
                <th className="p-2 w-1/3">Empate</th>
                <th className="p-2 w-1/3">
                  {headers?.visitante ?? "Visitante"}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => {
                const isLastThree = index >= visibleRows.length - 3

                return (
                  <tr
                    key={row.index}
                    className={`border-b last:border-none ${
                      isLastThree
                        ? "bg-emerald-200/50 font-medium"
                        : ""
                    }`}
                  >
                    <td className="p-2 text-black">
                      {formatNumber(row.local)}
                    </td>
                    <td className="p-2 text-black">
                      {formatNumber(row.empate)}
                    </td>
                    <td className="p-2 text-black">
                      {formatNumber(row.visitante)}
                    </td>
                  </tr>
                )
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-500">
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
