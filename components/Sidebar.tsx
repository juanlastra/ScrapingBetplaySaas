export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Scraper Betplay</h2>

      <nav className="space-y-3">
        <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-800">
          Inicio
        </button>
        <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-800">
          Configuración
        </button>
        <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-800">
          Historial
        </button>
      </nav>
    </aside>
  )
}
