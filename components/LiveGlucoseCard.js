export default function LiveGlucoseCard({ logs = [], lang = 'en' }) {
  const text = lang === 'hi'
    ? { title:'ग्लूकोज ट्रेंड', target:'लक्ष्य 70–180', empty:'ट्रेंड देखने के लिए रीडिंग जोड़ें', low:'कम', range:'रेंज में', high:'उच्च' }
    : { title:'Glucose Trend', target:'Target 70–180', empty:'Add readings to see your trend', low:'Low', range:'In range', high:'High' }

  const points = logs.slice(0, 7).reverse().map((l, i, a) => {
    const value = Number(l.glucose_value)
    const x = 32 + i * (336 / Math.max(a.length - 1, 1))
    const y = 132 - ((Math.max(40, Math.min(240, value)) - 40) / 200) * 96
    return { x, y, value }
  })

  const vals = logs.map(l => Number(l.glucose_value)).filter(Number.isFinite)
  const low = vals.filter(v => v < 70).length
  const high = vals.filter(v => v > 180).length
  const range = vals.length - low - high
  const pct = n => vals.length ? Math.round((n / vals.length) * 100) : 0

  return (
    <section className="card p-4 sm:p-5 overflow-hidden">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h2 className="font-black">{text.title}</h2>
        <span className="text-[11px] font-bold text-[#6B7A8F]">{text.target}</span>
      </div>
      <svg viewBox="0 0 400 160" className="w-full h-auto min-h-[150px]" role="img" aria-label={text.title}>
        <rect x="28" y="36" width="344" height="96" rx="14" fill="#E0F2F7" />
        <line x1="28" y1="65" x2="372" y2="65" stroke="#F59E0B" strokeDasharray="5 5" opacity=".6" />
        <line x1="28" y1="117" x2="372" y2="117" stroke="#EF4444" strokeDasharray="5 5" opacity=".5" />
        {points.length > 1 && (
          <path d={'M ' + points.map(p => p.x + ' ' + p.y).join(' L ')} fill="none" stroke="#219EBC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {points.map((p, i) => {
          const c = p.value < 70 ? '#EF4444' : p.value > 180 ? '#F59E0B' : '#10B981'
          return <g key={i}><circle cx={p.x} cy={p.y} r="7" fill="white" stroke={c} strokeWidth="2.5"/><circle cx={p.x} cy={p.y} r="3" fill={c}/></g>
        })}
        {!points.length && <text x="200" y="87" textAnchor="middle" fill="#6B7A8F" fontSize="13">{text.empty}</text>}
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {[[text.low, pct(low), '#EF4444'], [text.range, pct(range), '#219EBC'], [text.high, pct(high), '#F59E0B']].map(([label, value, color]) => (
          <div key={label} className="h-14 rounded-2xl border border-[#E6ECEA] flex flex-col items-center justify-center min-w-0 px-1">
            <span className="text-[9px] sm:text-[10px] text-[#6B7A8F] font-bold uppercase truncate max-w-full">{label}</span>
            <strong style={{ color }}>{value}%</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
