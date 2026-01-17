"use client"

import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts"

/* ─────────────────── TIPOS ─────────────────── */

type CuotaItem = {
  equipo: string
  cuota: number
}

type SnapshotResultado = {
  tiempo: string
  local: number
  empate: number
  visitante: number
}

type SnapshotCorners = SnapshotResultado

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/* ─────────────────── COLORES ─────────────────── */

const COLORS = {
  local: "#2563eb",
  empate: "#6b7280",
  visitante: "#dc2626",
}

/* ─────────────────── TOOLTIP ─────────────────── */

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white border rounded-lg shadow px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((item: any) => (
        <p key={item.dataKey} style={{ color: item.stroke }}>
          {item.name}: {item.value.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

/* ─────────────────── FORMATEO DEL EJE X ─────────────────── */

const formatTimeForXAxis = (tiempo: string) => {
  const match = tiempo.match(/(\d+):(\d+)/)
  if (match) return parseInt(match[1], 10) // solo minutos
  return tiempo
}

/* ─────────────────── COMPONENTE ─────────────────── */

export default function SeriesCuotasLive() {
  const [resultadoSeries, setResultadoSeries] = useState<SnapshotResultado[]>([])
  const [cornersSeries, setCornersSeries] = useState<SnapshotCorners[]>([])

  const fetchData = async () => {
    try {
      const marcadorRes = await fetch(`${API_URL}/api/marcador`)
      const marcador = await marcadorRes.json()
      if (!marcador?.tiempo) return

      const tiempo = `${marcador.periodo} ${marcador.tiempo}`

      const resultadoRes = await fetch(`${API_URL}/api/resultado-tiempo`)
      const resultadoJson: CuotaItem[][] = await resultadoRes.json()
      const lastResultado = resultadoJson?.at(-1)

      if (Array.isArray(lastResultado) && lastResultado.length === 3) {
        setResultadoSeries(prev => [
          ...prev,
          {
            tiempo,
            local: lastResultado[0].cuota,
            empate: lastResultado[1].cuota,
            visitante: lastResultado[2].cuota,
          },
        ])
      }

      const cornersRes = await fetch(`${API_URL}/api/tiros-esquina`)
      const cornersJson = await cornersRes.json()
      const lastCorners = cornersJson?.at(-1)

      if (lastCorners?.local && lastCorners?.empate) {
        setCornersSeries(prev => [
          ...prev,
          {
            tiempo,
            local: lastCorners.local.cuota,
            empate: lastCorners.empate.cuota,
            visitante: lastCorners.visitante.cuota,
          },
        ])
      }
    } catch (err) {
      console.error("Error obteniendo series de cuotas:", err)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30_000)
    return () => clearInterval(interval)
  }, [])

  /* ─────────────────── RENDER DE CADA GRÁFICO ─────────────────── */

  const renderChart = (data: SnapshotResultado[]) => (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis
          dataKey="tiempo"
          tick={{ fontSize: 12 }}
          tickFormatter={formatTimeForXAxis}
          height={40}
          interval="preserveStartEnd"
        />

        <YAxis tick={{ fontSize: 12 }} />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          verticalAlign="top"
          height={32}
          wrapperStyle={{ fontSize: 12 }}
        />

        <Line
          name="Local"
          type="monotone"
          dataKey="local"
          stroke={COLORS.local}
          strokeWidth={2}
          dot={false}
        />
        <Line
          name="Empate"
          type="monotone"
          dataKey="empate"
          stroke={COLORS.empate}
          strokeWidth={2}
          dot={false}
        />
        <Line
          name="Visitante"
          type="monotone"
          dataKey="visitante"
          stroke={COLORS.visitante}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          📈 Evolución de Cuotas – Tiempo Reglamentario
        </h2>
        {renderChart(resultadoSeries)}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          📊 Evolución de Cuotas – Mayoría de Corners
        </h2>
        {renderChart(cornersSeries)}
      </div>
    </div>
  )
}
