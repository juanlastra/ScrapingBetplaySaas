"use client"

import { useState } from "react"

type Props = {
  scrapingStarted: boolean
  onStart: (interval: number) => void
  onStop: () => void
}

export default function LinkUploader({
  scrapingStarted,
  onStart,
  onStop,
}: Props) {
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState("")

  // Intervalo fijo: 30 segundos = 0.5 minutos
  const interval = 30

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const startScraping = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("https://betplayscrapergoservice.onrender.com/api/start-scraping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link, interval }),
      })

      if (!res.ok) throw new Error()

      onStart(interval)

      const data = await res.json()
      setMessage(data.status || "Scraping iniciado")
    } catch {
      setMessage("No se pudo iniciar el scraping")
    } finally {
      setLoading(false)
    }
  }

  const stopScraping = async () => {
    try {
      await fetch("https://betplayscrapergoservice.onrender.com/api/stop-scraping", {
        method: "POST",
      })
      onStop()
      setMessage("Scraping detenido")
    } catch {
      setMessage("No se pudo detener el scraping")
    }
  }

  return (
    <div className="border border-slate-300 rounded-lg p-4 bg-white shadow space-y-4">
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {open ? "Cerrar" : "Subir link del evento"}
      </button>

      {open && (
        <div>
          <label className="block text-sm font-medium mb-2 text-black">
            Link del evento
          </label>
          <input
            type="text"
            value={link}
            disabled={scrapingStarted}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border rounded px-3 py-2 text-black disabled:opacity-50"
          />
        </div>
      )}

      {!scrapingStarted ? (
        <button
          onClick={startScraping}
          disabled={loading || !link}
          className="w-full bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Iniciando..." : "Iniciar scraping"}
        </button>
      ) : (
        <button
          onClick={stopScraping}
          className="w-full bg-red-600 text-white px-4 py-2 rounded"
        >
          Detener scraping
        </button>
      )}

      {message && <p className="text-sm text-black">{message}</p>}
    </div>
  )
}
