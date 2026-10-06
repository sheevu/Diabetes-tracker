
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import LiveGlucoseCard from '@/components/LiveGlucoseCard'

const i18n = {
  en: { fasting:'Fasting', before:'Before Meal', after:'After Meal', bedtime:'Bedtime', exercise:'Exercise', custom:'Custom', save:'Save', mgdl:'mg/dL', today:'Today', auto:'Auto', thisWeek:'This Week', lastWeek:'Last Week', calories:'Calories', steps:'Steps', score:'Score', activity:'Activity', daily:'Daily', weekly:'Weekly', monthly:'Monthly', allTime:'All Time', login:'Sign in to save', exportGSheet:'Export to Google Sheet' },
  hi: { fasting:'उपवास', before:'भोजन से पहले', after:'भोजन के बाद', bedtime:'सोने से पहले', exercise:'व्यायाम', custom:'कस्टम', save:'सहेजें', mgdl:'mg/dL', today:'आज', auto:'स्वत', thisWeek:'इस सप्ताह', lastWeek:'पिछला सप्ताह', calories:'कैलोरी', steps:'कदम', score:'स्कोर', activity:'गतिविधि', daily:'दैनिक', weekly:'साप्ताहिक', monthly:'मासिक', allTime:'सभी समय', login:'सहेजने के लिए लॉगिन करें', exportGSheet:'गूगल शीट में एक्सपोर्ट' }
}

export default function Page(){
  const [lang, setLang] = useState('en')
  const [value, setValue] = useState(118)
  const [type, setType] = useState('After Meal')
  const [logs, setLogs] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const t = i18n[lang]

  useEffect(()=>{
    supabase.auth.getUser().then(({data})=> setUser(data.user))
    const {data: {subscription}} = supabase.auth.onAuthStateChange((_, session)=> setUser(session?.user||null))
    return ()=> subscription.unsubscribe()
  },[])

  const fetchLogs = async()=>{
    if(!user) return
    const {data} = await supabase.from('glucose_logs').select('*').order('created_at',{ascending:false}).limit(100)
    if(data) setLogs(data)
  }
  useEffect(()=>{ fetchLogs() },[user])

  const addLog = async()=>{
    if(!user){ alert(t.login); return }
    setLoading(true)
    const {error} = await supabase.from('glucose_logs').insert({ user_id: user.id, glucose_value: value, type, notes: '' })
    if(!error){ setValue(118); fetchLogs() }
    setLoading(false)
  }

  const signInAnon = async()=>{
    // Quick demo: magic link. For real app use email OTP
    const email = prompt('Enter email for OTP login:')
    if(!email) return
    await supabase.auth.signInWithOtp({email})
    alert('Check email for login link')
  }

  const exportToSheet = async()=>{
    const url = process.env.NEXT_PUBLIC_GSHEET_WEBAPP_URL
    if(!url) return alert('Set GSHEET_WEBAPP_URL in .env.local')
    await fetch(url, { method:'POST', headers:{'Content-Type':'text/plain'}, body: JSON.stringify(logs.slice(0,20)) })
    alert('Exported to your Sheet!')
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b-[1.5px] border-[#E6ECEA] px-5 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-2xl bg-[#219EBC] flex items-center justify-center text-white font-extrabold">G</div><span className="font-extrabold text-[#0F172A] tracking-tight">GlucoPulse</span></div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F4F7F5] rounded-full p-1 border-[1.5px] border-[#E6ECEA]"><button onClick={()=>setLang('en')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${lang==='en'?'bg-white shadow text-[#0F172A]':'text-[#6B7A8F]'}`}>EN</button><button onClick={()=>setLang('hi')} className={`px-3 py-1.5 rounded-full text-xs font-bold ${lang==='hi'?'bg-[#219EBC] text-white shadow':'text-[#6B7A8F]'}`}>हिंदी</button></div>
          {!user ? <button onClick={signInAnon} className="btn-teal px-4 py-2 text-xs">Login</button> : <button onClick={()=>supabase.auth.signOut()} className="text-xs font-bold text-[#6B7A8F]">Logout</button>}
        </div>
      </header>

      <main className="px-5 max-w-[1200px] mx-auto mt-6 grid lg:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex justify-between mb-3"><span className="font-bold text-[#0F172A]">{t.today} • {t.auto}: {new Date().toLocaleDateString(lang==='hi'?'hi-IN':'en-US')}</span><span className="text-[11px] font-semibold text-[#6B7A8F]">70% {lang==='hi'?'पूर्ण':'Done'}</span></div>
            <div className="flex gap-2 mb-4">{['Fasting','Before Meal','After Meal'].map(k=>{const label=t[k==='Fasting'?'fasting':k==='Before Meal'?'before':'after']; const active=type===k; return <button key={k} onClick={()=>setType(k)} className={`flex-1 h-12 rounded-2xl border-[1.5px] font-bold text-xs ${active?'bg-[#219EBC] text-white border-[#219EBC]':'bg-white text-[#0F172A] border-[#E6ECEA]'}`}>{label}</button>})}</div>
            <div className="text-center py-2"><span className="text-6xl font-extrabold text-[#0F172A] tracking-tight">{value}</span><span className="ml-2 px-2.5 py-1 rounded-full bg-[#E0F2F7] text-[#219EBC] text-xs font-bold border border-[#219EBC]/20">{t.mgdl}</span></div>
            <div className="grid grid-cols-4 gap-2 mt-4">{[80,100,118,140,160,180,200,220].map(v=><button key={v} onClick={()=>setValue(v)} className={`h-12 rounded-2xl border-[1.5px] font-bold ${value===v?'bg-[#0F172A] text-white border-[#0F172A]':'bg-white border-[#E6ECEA] text-[#0F172A]'}`}>{v}</button>)}</div>
            <button onClick={addLog} disabled={loading} className="btn-lime w-full h-14 mt-5 text-[15px]">{loading?'...':t.save}</button>
          </div>
          <button onClick={exportToSheet} className="card w-full h-12 font-bold text-xs text-[#0F172A]">{t.exportGSheet} → Sheet ID 19bbtQprt...</button>
        </div>

        <div className="space-y-6">
          <LiveGlucoseCard logs={logs} lang={lang}/>
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4"><span className="font-extrabold text-[#0F172A]">{t.activity}</span><div className="flex bg-[#F4F7F5] rounded-full p-1 border border-[#E6ECEA]"><span className="px-3 py-1 rounded-full bg-[#C6E423] text-black text-[11px] font-bold">{t.weekly}</span></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[20px] bg-[#F8FAF9] border-[1.5px] border-[#E6ECEA] p-4"><div className="text-[11px] font-semibold text-[#6B7A8F] uppercase">Avg Glucose</div><div className="text-2xl font-extrabold text-[#0F172A] mt-1">{logs.length?Math.round(logs.reduce((a,b)=>a+b.glucose_value,0)/logs.length):0} mg/dL</div></div>
              <div className="rounded-[20px] bg-[#F8FAF9] border-[1.5px] border-[#E6ECEA] p-4"><div className="text-[11px] font-semibold text-[#6B7A8F] uppercase">Time in Range</div><div className="text-2xl font-extrabold text-[#219EBC] mt-1">{logs.length?Math.round((logs.filter(l=>l.glucose_value>=70&&l.glucose_value<=180).length/logs.length)*100):0}%</div></div>
            </div>
            <div className="mt-4 space-y-2">{logs.slice(0,8).map(l=><div key={l.id} className="flex justify-between items-center h-12 px-4 rounded-2xl border-[1.5px] border-[#E6ECEA] bg-white"><span className="text-xs font-bold text-[#0F172A]">{l.type} • {l.glucose_value} mg/dL</span><span className="text-[11px] text-[#6B7A8F]">{new Date(l.created_at).toLocaleTimeString()}</span></div>)}</div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] h-[72px] bg-white rounded-[28px] border-[1.5px] border-[#E6ECEA] shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex items-center justify-around px-2 z-30">
        <button className="flex flex-col items-center gap-1"><div className="w-6 h-6 rounded-lg bg-[#F4F7F5]"/><span className="text-[10px] font-bold text-[#6B7A8F]">Home</span></button>
        <button className="flex flex-col items-center gap-1 text-[#219EBC]"><div className="w-6 h-6 rounded-lg bg-[#E0F2F7]"/><span className="text-[10px] font-bold">Activity</span></button>
        <button onClick={addLog} className="w-14 h-14 rounded-full bg-[#C6E423] shadow-[0_8px_20px_rgba(198,228,35,0.5)] flex items-center justify-center -mt-6 border-[3px] border-white"><span className="text-2xl font-extrabold">+</span></button>
        <button className="flex flex-col items-center gap-1"><div className="w-6 h-6 rounded-lg bg-[#F4F7F5]"/><span className="text-[10px] font-bold text-[#6B7A8F]">Exercise</span></button>
        <button className="flex flex-col items-center gap-1"><div className="w-6 h-6 rounded-lg bg-[#F4F7F5]"/><span className="text-[10px] font-bold text-[#6B7A8F]">Profile</span></button>
      </nav>
    </div>
  )
}
