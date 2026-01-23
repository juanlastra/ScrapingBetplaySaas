"use client"

import { useEffect, useState } from "react"
import {
  Clock,
  Goal,
  CornerUpLeft,
  RectangleVertical,
} from "lucide-react"

type Stats = {
  tarjeta_roja: number
  tarjeta_amarilla: number
  corner: number
  goles: number
}

type Equipo = {
  equipo: string
  stats: Stats
}

type Marcador = {
  periodo: string
  tiempo: string
  local: Equipo
  visitante: Equipo
}

type Props = {
  sessionKey: number
}

export default function MarcadorLive({ sessionKey }: Props) {
  const [marcador, setMarcador] = useState<Marcador | null>(null)

  const fetchMarcador = () => {
    fetch("https://betplayscrapergoservice.onrender.com/api/marcador")
      .then(res => res.json())
      .then(data => {
        if (!data || !data.local || !data.visitante) return
        setMarcador(data)
      })
      .catch(err =>
        console.error("Error obteniendo marcador:", err)
      )
  }

  useEffect(() => {
    // Nueva sesión de scraping → limpiar y mostrar "Cargando..."
    setMarcador(null)

    fetchMarcador()
    const interval = setInterval(fetchMarcador, 30_000)

    return () => clearInterval(interval)
  }, [sessionKey])

  if (!marcador) {
    return (
      <div className="bg-white rounded-xl shadow p-6 h-full flex items-center justify-center text-slate-500">
        Cargando marcador…
      </div>
    )
  }

  const { local, visitante, periodo, tiempo } = marcador

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500 flex items-center gap-2">
          <Clock size={16} />
          {periodo} · {tiempo}
        </span>

        <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 font-medium">
          EN JUEGO
        </span>
      </div>

      <div className="grid grid-cols-3 items-center mb-6">
        <div className="text-right pr-4">
          <p className="font-semibold text-lg text-black">
            {local.equipo}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <span className="text-4xl font-bold text-black">
            {local.stats.goles}
          </span>
          <span className="text-xl text-slate-400">:</span>
          <span className="text-4xl font-bold text-black">
            {visitante.stats.goles}
          </span>
        </div>

        <div className="text-left pl-4">
          <p className="font-semibold text-lg text-black">
            {visitante.equipo}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm mt-auto">
        <StatRow icon={<Goal size={16} />} local={local.stats.goles} label="Goles" visitante={visitante.stats.goles} />
        <StatRow icon={<CornerUpLeft size={16} />} local={local.stats.corner} label="Corners" visitante={visitante.stats.corner} />
        <StatRow icon={<RectangleVertical size={14} className="text-yellow-500" />} local={local.stats.tarjeta_amarilla} label="Amarillas" visitante={visitante.stats.tarjeta_amarilla} />
        <StatRow icon={<RectangleVertical size={14} className="text-red-500" />} local={local.stats.tarjeta_roja} label="Rojas" visitante={visitante.stats.tarjeta_roja} />
      </div>
    </div>
  )
}

function StatRow({
  icon,
  label,
  local,
  visitante,
}: {
  icon: React.ReactNode
  label: string
  local: number
  visitante: number
}) {
  return (
    <>
      <div className="flex justify-end items-center gap-2 text-black">
        <span className="font-medium">{local}</span>
      </div>

      <div className="flex justify-center items-center gap-2 text-slate-500">
        {icon}
        <span>{label}</span>
      </div>

      <div className="flex justify-start items-center gap-2 text-black">
        <span className="font-medium">{visitante}</span>
      </div>
    </>
  )
}
