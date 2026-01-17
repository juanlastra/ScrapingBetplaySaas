// components/Controls.tsx
"use client"

type Props = {
  url: string
  interval: number
  onUrlChange: (v: string) => void
  onIntervalChange: (v: number) => void
}

export default function Controls({
  url,
  interval,
  onUrlChange,
  onIntervalChange
}: Props) {
  return (
    <div className="flex gap-4 mb-6">
      <input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Link del evento"
        className="
          flex-1
          border border-black
          px-3 py-2
          rounded
          text-black
          bg-white
          placeholder:text-black/60
          focus:outline-none
          focus:ring-0
        "
      />

      <select
        value={interval}
        onChange={(e) => onIntervalChange(Number(e.target.value))}
        className="
          border border-black
          px-3 py-2
          rounded
          text-black
          bg-white
          focus:outline-none
          focus:ring-0
        "
      >
        <option value={60} className="text-black">
          Cada 1 min
        </option>
        <option value={300} className="text-black">
          Cada 5 min
        </option>
        <option value={600} className="text-black">
          Cada 10 min
        </option>
      </select>
    </div>
  )
}
