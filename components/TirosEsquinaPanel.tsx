"use client"

import { useEffect, useState } from "react"

type Cuota = {
  equipo: string
  cuota: number
}

type TiroEsquinaItem = {
  local: Cuota
  empate: Cuota
  visitante: Cuota
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export default function TirosEsquinaPanel() {
  const [data, setData] = useState<TiroEsquinaItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTirosEsquina = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tiros-esquina`)
      const json = await res.json()

      if (Array.isArray(json)) {
        setData(json)
      }
    } catch (err) {
      console.error("Error obteniendo tiros de esquina:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTirosEsquina()
    const interval = setInterval(fetchTirosEsquina, 10_000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm text-gray-500">Cargando tiros de esquina…</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm text-gray-500">
          No hay datos de tiros de esquina
        </p>
      </div>
    )
  }

  // mostramos solo los últimos 10
  const visible = data.slice(-10)

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        🚩 Tiros de esquina
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="text-left py-2">Local</th>
              <th className="text-center py-2">Empate</th>
              <th className="text-right py-2">Visitante</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((row, idx) => {
              const isLatest = idx >= visible.length - 3

              return (
                <tr
                  key={idx}
                  className={`border-b last:border-0 ${
                    isLatest
                      ? "bg-green-50/70 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  <td className="py-2">
                    {row.local.cuota.toFixed(2)}
                  </td>

                  <td className="py-2 text-center">
                    {row.empate.cuota.toFixed(2)}
                  </td>

                  <td className="py-2 text-right">
                    {row.visitante.cuota.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
