
export default function LiveGlucoseCard({logs, lang}){
  const t = lang==='hi' ? {live:'लाइव ग्लूकोज', target:'लक्ष्य 70-180', low:'कम', in:'सामान्य में', high:'अधिक'} : {live:'Live Glucose', target:'Target 70-180', low:'Low', in:'In Range', high:'High'}
  const today = logs.slice(0,5).reverse()
  const low = logs.filter(l=>l.glucose_value<70).length
  const high = logs.filter(l=>l.glucose_value>180).length
  const total = logs.length || 1
  const inR = total - low - high
  const pct = (n)=> Math.round((n/total)*100)
  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[#219EBC] rounded-full animate-pulse"/><span className="font-extrabold text-[15px] text-[#0F172A]">{t.live}</span></div>
        <span className="text-[11px] font-semibold text-[#6B7A8F] uppercase tracking-wider">{t.target}</span>
      </div>
      <svg viewBox="0 0 400 160" className="w-full h-[160px]">
        <rect x="60" y="40" width="280" height="80" rx="12" fill="#E0F2F7" opacity="0.7"/>
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#219EBC" stopOpacity="0.25"/><stop offset="100%" stopColor="#219EBC" stopOpacity="0"/></linearGradient></defs>
        {today.length>1 && <>
          <path d={`M ${today.map((l,i)=>`${60 + i*(280/(today.length-1||1))} ${120 - ((l.glucose_value-40)/200)*80}`).join(' L ')} L ${60 + 280} 120 L 60 120 Z`} fill="url(#g)"/>
          <path d={`M ${today.map((l,i)=>`${60 + i*(280/(today.length-1||1))} ${120 - ((l.glucose_value-40)/200)*80}`).join(' L ')}`} fill="none" stroke="#219EBC" strokeWidth="3" strokeLinecap="round"/>
          {today.map((l,i)=>{const x=60+i*(280/(today.length-1||1)); const y=120-((l.glucose_value-40)/200)*80; const c=l.glucose_value<70?'#EF4444':l.glucose_value>180?'#F59E0B':'#10B981'; return <g key={i}><circle cx={x} cy={y} r="7" fill="white" stroke={c} strokeWidth="2.5"/><circle cx={x} cy={y} r="3" fill={c}/></g>})}
        </>}
      </svg>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="h-14 rounded-2xl border-[1.5px] border-[#E6ECEA] flex flex-col items-center justify-center"><span className="text-[10px] font-semibold text-[#6B7A8F] uppercase">{t.low}</span><span className="font-extrabold text-[#EF4444]">{pct(low)}%</span></div>
        <div className="h-14 rounded-2xl border-[1.5px] border-[#219EBC]/40 bg-[#219EBC]/10 flex flex-col items-center justify-center"><span className="text-[10px] font-semibold text-[#219EBC] uppercase">{t.in}</span><span className="font-extrabold text-[#1F8FA3]">{pct(inR)}%</span></div>
        <div className="h-14 rounded-2xl border-[1.5px] border-[#E6ECEA] flex flex-col items-center justify-center"><span className="text-[10px] font-semibold text-[#6B7A8F] uppercase">{t.high}</span><span className="font-extrabold text-[#F59E0B]">{pct(high)}%</span></div>
      </div>
    </div>
  )
}
