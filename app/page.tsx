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
  const [selectedMatch, setSelectedMatch] = useState(1)

  const stopTimerRef = useRef<NodeJS.Timeout | null>(null)

  const stopScraping = async () => {
    await fetch("https://betplayscrapergoservice.onrender.com/api/stop-scraping", {
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
      navigator.sendBeacon("https://betplayscrapergoservice.onrender.com/api/stop-scraping")
    }
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-slate-100 p-8">

        {/* Selector de partido */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-black mb-3">
            Seleccione el partido
          </h1>

          <div className="flex gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setSelectedMatch(num)}
                className={`px-4 py-2 rounded text-sm font-medium transition
                  ${
                    selectedMatch === num
                      ? "bg-blue-600 text-white"
                      : "bg-slate-300 text-slate-700 hover:bg-slate-400"
                  }
                `}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4 items-stretch">
<div className="flex flex-col h-full gap-2">

  {/* 40% */}
  <div className="flex-[6.35]">
    <MarcadorLive sessionKey={sessionKey} />
  </div>

  {/* 30% */}
  <div className="flex-[2.5]">
    <LinkUploader
      scrapingStarted={scrapingStarted}
      onStart={(interval) => {
        setSessionKey(prev => prev + 1)
        setIntervalMinutes(interval)
        setScrapingStarted(true)
      }}
      onStop={stopScraping}
    />
  </div>

  {/* 30% */}
  <div className="flex-[2.5]">
    <DescargarDatosPanel />
  </div>

</div>



          <div className="flex flex-col h-full gap-2">
            <MercadosPrincipalesPanel sessionKey={sessionKey} />
            <SeriesCuotasLive />
          </div>

        </div>
      </main>
    </div>
  )
}
