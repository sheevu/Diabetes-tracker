'use client'

import { useEffect, useMemo, useState } from 'react'
import { backendReady, supabase } from '@/lib/supabaseClient'
import LiveGlucoseCard from '@/components/LiveGlucoseCard'

const TYPES = ['Fasting', 'Before Meal', 'After Meal', 'Bedtime', 'Exercise', 'Custom']
const LABELS = {
  en: {
    home:'Home', activity:'Activity', exercise:'Exercise', profile:'Profile',
    save:'Save reading', logout:'Logout', email:'Email address', send:'Send magic link',
    value:'Glucose', notes:'Notes', history:'Recent readings', empty:'No readings yet',
    avg:'Average', range:'In range', high:'High', low:'Low', backup:'Backup',
    export:'Download CSV', sheet:'Open Google Sheet', local:'Local mode',
    cloud:'Supabase connected', duration:'Duration (min)', activityName:'Activity',
    logExercise:'Log exercise'
  },
  hi: {
    home:'होम', activity:'गतिविधि', exercise:'व्यायाम', profile:'प्रोफ़ाइल',
    save:'रीडिंग सहेजें', logout:'लॉगआउट', email:'ईमेल पता', send:'मैजिक लिंक भेजें',
    value:'ग्लूकोज', notes:'नोट्स', history:'हाल की रीडिंग', empty:'अभी कोई रीडिंग नहीं',
    avg:'औसत', range:'रेंज में', high:'उच्च', low:'कम', backup:'बैकअप',
    export:'CSV डाउनलोड', sheet:'Google Sheet खोलें', local:'लोकल मोड',
    cloud:'Supabase जुड़ा है', duration:'अवधि (मिनट)', activityName:'गतिविधि',
    logExercise:'व्यायाम दर्ज करें'
  }
}

const makeId = () => globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()) + Math.random()
const nowIso = () => new Date().toISOString()

export default function Page() {
  const [lang, setLang] = useState('en')
  const [tab, setTab] = useState('home')
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [value, setValue] = useState(118)
  const [type, setType] = useState('After Meal')
  const [notes, setNotes] = useState('')
  const [logs, setLogs] = useState([])
  const [exercise, setExercise] = useState([])
  const [exerciseName, setExerciseName] = useState('Walking')
  const [duration, setDuration] = useState(20)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const t = LABELS[lang]
  const sheetId = process.env.NEXT_PUBLIC_GSHEET_ID || '19bbtQprtEFeshiCh-X_eAQf2V8LNWupxebdIwQSkoW0'

  useEffect(() => {
    try {
      setLogs(JSON.parse(localStorage.getItem('glucopulse-logs') || '[]'))
      setExercise(JSON.parse(localStorage.getItem('glucopulse-exercise') || '[]'))
    } catch {}

    if (!supabase) return

    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) refreshCloud()
  }, [user])

  const persistLocal = (next) => {
    setLogs(next)
    localStorage.setItem('glucopulse-logs', JSON.stringify(next))
  }

  const persistExerciseLocal = (next) => {
    setExercise(next)
    localStorage.setItem('glucopulse-exercise', JSON.stringify(next))
  }

  async function refreshCloud() {
    if (!supabase || !user) return

    const [{ data: glucose }, { data: ex }] = await Promise.all([
      supabase.from('glucose_logs').select('*').order('measured_at', { ascending: false }).limit(200),
      supabase.from('exercise_logs').select('*').order('performed_at', { ascending: false }).limit(100)
    ])

    if (glucose) persistLocal(glucose.map(x => ({ ...x, type: x.reading_type, created_at: x.measured_at })))
    if (ex) persistExerciseLocal(ex)
  }

  async function saveReading() {
    const n = Number(value)
    if (!Number.isFinite(n) || n < 20 || n > 600) {
      setMessage('Enter a glucose value between 20 and 600 mg/dL')
      return
    }

    setBusy(true)
    setMessage('')

    const localRow = {
      id: makeId(),
      glucose_value: n,
      type,
      reading_type: type,
      notes,
      created_at: nowIso(),
      measured_at: nowIso()
    }

    if (supabase && user) {
      const { error } = await supabase.from('glucose_logs').insert({
        user_id: user.id,
        glucose_value: n,
        reading_type: type,
        notes: notes || null
      })

      if (error) {
        setMessage(error.message)
        setBusy(false)
        return
      }

      await refreshCloud()
      setMessage(lang === 'hi' ? 'क्लाउड में सहेजा गया' : 'Saved to Supabase')
    } else {
      persistLocal([localRow, ...logs].slice(0, 200))
      setMessage(lang === 'hi' ? 'डिवाइस पर सहेजा गया' : 'Saved on this device')
    }

    setNotes('')
    setBusy(false)
  }

  async function logExercise() {
    const d = Number(duration)
    if (!exerciseName.trim() || d < 1) {
      setMessage('Add activity and duration')
      return
    }

    setBusy(true)
    setMessage('')

    const localRow = {
      id: makeId(),
      activity: exerciseName.trim(),
      duration_minutes: d,
      performed_at: nowIso()
    }

    if (supabase && user) {
      const { error } = await supabase.from('exercise_logs').insert({
        user_id: user.id,
        activity: exerciseName.trim(),
        duration_minutes: d
      })

      if (error) {
        setMessage(error.message)
        setBusy(false)
        return
      }

      await refreshCloud()
      setMessage(lang === 'hi' ? 'व्यायाम सहेजा गया' : 'Exercise saved')
    } else {
      persistExerciseLocal([localRow, ...exercise].slice(0, 100))
      setMessage(lang === 'hi' ? 'डिवाइस पर सहेजा गया' : 'Saved on this device')
    }

    setBusy(false)
  }

  async function signIn() {
    if (!supabase) {
      setMessage('Supabase is not configured')
      return
    }

    if (!email.includes('@')) {
      setMessage('Enter a valid email')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setBusy(false)
    setMessage(error ? error.message : 'Magic link sent. Check your email.')
  }

  function exportCsv() {
    const rows = [
      'date,type,glucose_mg_dl,notes',
      ...logs.map(l => [
        new Date(l.measured_at || l.created_at).toISOString(),
        l.reading_type || l.type,
        l.glucose_value,
        JSON.stringify(l.notes || '')
      ].join(','))
    ]

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'glucopulse-readings.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const stats = useMemo(() => {
    const vals = logs.map(l => Number(l.glucose_value)).filter(Number.isFinite)
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
    const low = vals.filter(v => v < 70).length
    const high = vals.filter(v => v > 180).length
    const inRange = vals.length - low - high
    return {
      avg,
      low,
      high,
      pct: vals.length ? Math.round((inRange / vals.length) * 100) : 0
    }
  }, [logs])

  const nav = [
    ['home', '⌂', t.home],
    ['activity', '▥', t.activity],
    ['exercise', '◉', t.exercise],
    ['profile', '◎', t.profile]
  ]

  return (
    <div className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#E6ECEA]">
        <div className="max-w-6xl mx-auto h-16 px-3 sm:px-5 flex items-center justify-between gap-2">
          <button onClick={() => setTab('home')} className="flex items-center gap-2 min-w-0">
            <span className="w-9 h-9 shrink-0 rounded-2xl bg-[#219EBC] text-white grid place-items-center font-black">G</span>
            <span className="font-black truncate">GlucoPulse</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-[#F4F7F5] p-1 border border-[#E6ECEA]">
              <button onClick={() => setLang('en')} className={`px-2.5 py-1 rounded-full text-xs font-bold ${lang === 'en' ? 'bg-white shadow' : ''}`}>EN</button>
              <button onClick={() => setLang('hi')} className={`px-2.5 py-1 rounded-full text-xs font-bold ${lang === 'hi' ? 'bg-[#219EBC] text-white' : ''}`}>हिंदी</button>
            </div>
            <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${backendReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {backendReady ? t.cloud : t.local}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-5 py-5 sm:py-7">
        {message && (
          <div className="mb-4 rounded-2xl bg-[#0F172A] text-white px-4 py-3 text-sm flex justify-between gap-3">
            <span>{message}</span>
            <button onClick={() => setMessage('')}>×</button>
          </div>
        )}

        {tab === 'home' && (
          <div className="grid lg:grid-cols-[390px_1fr] gap-5">
            <section className="card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#6B7A8F] font-bold">{t.value}</div>
                  <div className="text-sm font-bold mt-1">
                    {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday:'short', day:'numeric', month:'short' })}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E0F2F7] text-[#219EBC] text-xs font-bold">mg/dL</span>
              </div>

              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                inputMode="numeric"
                type="number"
                min="20"
                max="600"
                className="w-full text-center text-6xl font-black bg-transparent outline-none py-3"
              />

              <div className="grid grid-cols-3 gap-2 my-4">
                {TYPES.map(x => (
                  <button
                    key={x}
                    onClick={() => setType(x)}
                    className={`min-h-11 px-2 rounded-2xl border text-xs font-bold ${type === x ? 'bg-[#219EBC] text-white border-[#219EBC]' : 'bg-white border-[#E6ECEA]'}`}
                  >
                    {x}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[80,100,118,140,160,180,200,220].map(v => (
                  <button
                    key={v}
                    onClick={() => setValue(v)}
                    className={`h-11 rounded-xl font-bold border ${Number(value) === v ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white border-[#E6ECEA]'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                maxLength={1000}
                placeholder={t.notes}
                className="mt-4 w-full min-h-20 rounded-2xl border border-[#E6ECEA] bg-[#F8FAF9] p-3 outline-none focus:border-[#219EBC]"
              />

              <button disabled={busy} onClick={saveReading} className="btn-lime w-full min-h-14 mt-4">
                {busy ? '...' : t.save}
              </button>
            </section>

            <div className="space-y-5">
              <LiveGlucoseCard logs={logs} lang={lang} />
              <section className="grid sm:grid-cols-3 gap-3">
                <Metric label={t.avg} value={stats.avg ? stats.avg + ' mg/dL' : '—'} />
                <Metric label={t.range} value={stats.pct + '%'} />
                <Metric label={t.history} value={logs.length} />
              </section>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <section className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric label={t.avg} value={stats.avg || '—'} />
              <Metric label={t.range} value={stats.pct + '%'} />
              <Metric label={t.low} value={stats.low} />
              <Metric label={t.high} value={stats.high} />
            </div>

            <div className="card p-4 sm:p-5">
              <div className="flex justify-between items-center gap-3 mb-4">
                <h2 className="font-black">{t.history}</h2>
                <button onClick={exportCsv} className="btn-teal px-3 py-2 text-xs">{t.export}</button>
              </div>

              <div className="space-y-2">
                {logs.length === 0 && <div className="text-sm text-[#6B7A8F] py-8 text-center">{t.empty}</div>}
                {logs.map(l => (
                  <div key={l.id} className="grid grid-cols-[1fr_auto] gap-3 items-center p-3 rounded-2xl border border-[#E6ECEA]">
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{l.reading_type || l.type}</div>
                      <div className="text-xs text-[#6B7A8F]">{new Date(l.measured_at || l.created_at).toLocaleString()}</div>
                    </div>
                    <div className="font-black text-lg">
                      {l.glucose_value}<span className="text-[10px] ml-1 text-[#6B7A8F]">mg/dL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'exercise' && (
          <div className="grid md:grid-cols-[360px_1fr] gap-5">
            <section className="card p-5">
              <h2 className="font-black text-lg mb-4">{t.exercise}</h2>
              <label className="text-xs font-bold text-[#6B7A8F]">{t.activityName}</label>
              <input value={exerciseName} onChange={e => setExerciseName(e.target.value)} className="mt-1 mb-4 w-full h-12 rounded-2xl border border-[#E6ECEA] px-4 outline-none focus:border-[#219EBC]" />
              <label className="text-xs font-bold text-[#6B7A8F]">{t.duration}</label>
              <input value={duration} onChange={e => setDuration(e.target.value)} type="number" min="1" className="mt-1 w-full h-12 rounded-2xl border border-[#E6ECEA] px-4 outline-none focus:border-[#219EBC]" />
              <button disabled={busy} onClick={logExercise} className="btn-lime w-full min-h-14 mt-5">{t.logExercise}</button>
            </section>

            <section className="card p-5">
              <h2 className="font-black mb-4">{t.history}</h2>
              <div className="space-y-2">
                {!exercise.length && <div className="text-sm text-[#6B7A8F] py-8 text-center">{t.empty}</div>}
                {exercise.map(x => (
                  <div key={x.id} className="flex justify-between gap-3 p-3 rounded-2xl border border-[#E6ECEA]">
                    <div>
                      <div className="font-bold">{x.activity}</div>
                      <div className="text-xs text-[#6B7A8F]">{new Date(x.performed_at).toLocaleString()}</div>
                    </div>
                    <strong>{x.duration_minutes} min</strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-5">
            <section className="card p-5">
              <h2 className="font-black text-lg mb-4">{t.profile}</h2>
              {user ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-[#F4F7F5] p-4">
                    <div className="text-xs text-[#6B7A8F]">Signed in as</div>
                    <div className="font-bold break-all mt-1">{user.email}</div>
                  </div>
                  <button onClick={() => supabase?.auth.signOut()} className="btn-teal w-full h-12">{t.logout}</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder={t.email} className="w-full h-12 rounded-2xl border border-[#E6ECEA] px-4 outline-none focus:border-[#219EBC]" />
                  <button disabled={busy || !backendReady} onClick={signIn} className="btn-teal w-full h-12">{t.send}</button>
                  <p className="text-xs text-[#6B7A8F]">Use locally without signing in, or sign in to sync securely with Supabase.</p>
                </div>
              )}
            </section>

            <section className="card p-5">
              <h2 className="font-black text-lg mb-4">{t.backup}</h2>
              <div className="rounded-2xl bg-[#F4F7F5] p-4 mb-3">
                <div className="text-xs text-[#6B7A8F]">Google Sheet ID</div>
                <div className="font-mono text-xs break-all mt-1">{sheetId}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <button onClick={exportCsv} className="btn-teal h-12">{t.export}</button>
                <a target="_blank" rel="noreferrer" href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`} className="h-12 rounded-2xl border border-[#E6ECEA] grid place-items-center font-bold">
                  {t.sheet}
                </a>
              </div>
            </section>
          </div>
        )}
      </main>

      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-24px)] max-w-md rounded-[26px] bg-white/95 backdrop-blur border border-[#E6ECEA] shadow-[0_12px_40px_rgba(0,0,0,.14)] p-2 grid grid-cols-4 gap-1">
        {nav.map(([key, icon, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`min-h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold ${tab === key ? 'bg-[#E0F2F7] text-[#167C91]' : 'text-[#6B7A8F]'}`}>
            <span className="text-lg leading-none">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="card p-4">
      <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#6B7A8F] font-bold">{label}</div>
      <div className="text-xl sm:text-2xl font-black mt-1">{value}</div>
    </div>
  )
}
