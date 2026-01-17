// components/ResultsTable.tsx
import { Resultado } from "@/types"

type Props = {
  resultados: Resultado[]
}

export default function ResultsTable({ resultados }: Props) {
  if (!resultados.length) {
    return <p className="text-gray-500">Sin datos aún</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Equipo</th>
            <th className="border px-3 py-2">Cuota</th>
            <th className="border px-3 py-2">Tiempo partido</th>
            <th className="border px-3 py-2">Extraído en</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((r, i) => (
            <tr key={i}>
              <td className="border px-3 py-2">{r.equipo}</td>
              <td className="border px-3 py-2">{r.cuota}</td>
              <td className="border px-3 py-2">{r.tiempo_partido}</td>
              <td className="border px-3 py-2">
                {new Date(r.extraido_en).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
