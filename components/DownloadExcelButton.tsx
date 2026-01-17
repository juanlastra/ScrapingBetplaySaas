// components/DownloadExcelButton.tsx
"use client"

import * as XLSX from "xlsx"

type Props = {
  sheets: {
    name: string
    data: any[]
  }[]
}

export default function DownloadExcelButton({ sheets }: Props) {
  const handleDownload = () => {
    const workbook = XLSX.utils.book_new()

    sheets.forEach(({ name, data }) => {
      const worksheet = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, name)
    })

    XLSX.writeFile(workbook, "resultados.xlsx")
  }

  return (
    <button
      onClick={handleDownload}
      className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
    >
      Descargar resultados
    </button>
  )
}
