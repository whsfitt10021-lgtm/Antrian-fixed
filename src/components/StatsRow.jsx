const CARDS = [
  { key: 'total', label: 'Total Kendaraan', head: 'bg-[#eef2f6] text-[#0d1420]' },
  { key: 'waiting', label: 'Menunggu Antrian', head: 'bg-gold text-[#241a06]' },
  { key: 'called', label: 'Proses Muat', head: 'bg-cyan text-white' },
  { key: 'closed', label: 'Selesai', head: 'bg-green text-white' }
]

export default function StatsRow({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {CARDS.map((c) => (
        <div key={c.key} className="flex flex-col overflow-hidden rounded-md border border-[#1f4d80] bg-[#0a2140] shadow-panel">
          <div className={`border-b border-black/15 px-3.5 py-2 text-center font-stencil text-[11.5px] font-extrabold uppercase tracking-[1.2px] ${c.head}`}>
            {c.label}
          </div>
          <div className="flex items-center justify-center px-4 py-3">
            <div className="font-mono text-[38px] font-extrabold leading-none tabular-nums text-ink-primary">
              {stats[c.key] || 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
