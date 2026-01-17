"use client"

import { useEffect, useRef, useState } from "react"
import Sidebar from "@/components/Sidebar"
import LinkUploader from "@/components/LinkUploader"
import MarcadorLive from "@/components/MarcadorLive"
import MercadosPrincipalesPanel from "@/components/TablasTiempoReg-Corners"
import SeriesCuotasLive from "@/components/Series Cuotas Live"
import DescargarDatosPanel from "@/components/DescargarDatosPanel"

export default function DashboardPage() {
  const [scrapingStarted, setScrapingStarted] = useState(false)
  const [intervalMinutes, setIntervalMinutes] = useState(1)
  const [sessionKey, setSessionKey] = useState(0)

  const stopTimerRef = useRef<NodeJS.Timeout | null>(null)

  const stopScraping = async () => {
    await fetch("http://localhost:8080/api/stop-scraping", {
      method: "POST",
    })
    setScrapingStarted(false)
  }

  useEffect(() => {
    if (scrapingStarted) {
      stopTimerRef.current = setTimeout(stopScraping, 100 * 60 * 1000)
    }
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    }
  }, [scrapingStarted])

  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon("http://localhost:8080/api/stop-scraping")
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-slate-100 p-8">
        <h1 className="text-2xl font-bold mb-6 text-black">
          Panel de control
        </h1>

        {/* GRID PRINCIPAL 30 / 70 */}
<div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6 items-stretch">

  {/* ⬅️ COLUMNA IZQUIERDA */}
  <div className="flex flex-col h-full gap-6">
    <div className="flex-1">
      <MarcadorLive />
    </div>

    <LinkUploader
      scrapingStarted={scrapingStarted}
      onStart={(interval) => {
        setSessionKey(prev => prev + 1)
        setIntervalMinutes(interval)
        setScrapingStarted(true)
      }}
      onStop={stopScraping}
    />

    <DescargarDatosPanel />
  </div>

  {/* ➡️ COLUMNA DERECHA */}
  <div className="flex flex-col h-full gap-6">
    <MercadosPrincipalesPanel />
    <SeriesCuotasLive />
  </div>

</div>

      </main>
    </div>
  )
}
