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
    <div className="bg-white border border-slate-200 rounded-lg shadow px-3 py-2 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((item: any) => (
        <p key={item.dataKey} style={{ color: item.stroke }}>
          {item.name}: {item.value.toFixed(2)}
        </p>
      ))}
    </div>
  )
}

/* ─────────────────── FORMATO EJE X ─────────────────── */

const formatTimeForXAxis = (value: any): string => {
  if (typeof value !== "string") return ""

  const match = value.match(/(\d+):(\d+)/)
  if (match) {
    return match[1]
  }

  return value
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

  /* ─────────────────── RENDER DE GRÁFICO ─────────────────── */

  const renderChart = (data: SnapshotResultado[]) => (
    <ResponsiveContainer width="100%" height={330}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 24, left: 10, bottom: 40 }}
      >
        <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />

        <XAxis
          dataKey="tiempo"
          tick={{ fontSize: 12, fill: "#475569" }}
          tickFormatter={formatTimeForXAxis}
          axisLine={{ stroke: "#cbd5f5" }}
          tickLine={{ stroke: "#cbd5f5" }}
          label={{
            value: "Minuto de juego",
            position: "insideBottom",
            offset: -25,
            fill: "#475569",
            fontSize: 12,
          }}
        />

        <YAxis
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={{ stroke: "#cbd5f5" }}
          tickLine={{ stroke: "#cbd5f5" }}
          label={{
            value: "Cuota",
            angle: -90,
            position: "insideLeft",
            offset: -5,
            fill: "#475569",
            fontSize: 12,
          }}
        />

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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 w-full">
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-slate-800">
          Evolución de Cuotas – Tiempo Reglamentario
        </h2>
        {renderChart(resultadoSeries)}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-slate-800">
          Evolución de Cuotas – Mayoría de Corners
        </h2>
        {renderChart(cornersSeries)}
      </div>
    </div>
  )
}
