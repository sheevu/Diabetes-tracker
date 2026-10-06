'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Dumbbell,
  User,
  Sun,
  Moon,
  ShieldAlert,
  FileSpreadsheet,
  Download,
  Plus,
  CheckCircle,
  AlertCircle,
  Utensils,
  Bot,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react'
import { backendReady, supabase } from '@/lib/supabaseClient'
import EmergencyAlert from '@/components/EmergencyAlert'
import ClinicalMetricCards from '@/components/ClinicalMetricCards'
import AgpTrendChart from '@/components/AgpTrendChart'
import QuickLogCard from '@/components/QuickLogCard'
import LogHistoryTable from '@/components/LogHistoryTable'
import ExerciseLogger from '@/components/ExerciseLogger'
import ProfileSettings from '@/components/ProfileSettings'
import DoctorReportView from '@/components/DoctorReportView'
import IndianFoodExplorer from '@/components/IndianFoodExplorer'
import LocalAiFaqAssistant from '@/components/LocalAiFaqAssistant'
import AuthView from '@/components/AuthView'
import { DEFAULT_TARGETS } from '@/lib/clinicalMetrics'
import { generateSampleData } from '@/lib/sampleData'

const makeId = () => (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now()) + Math.random())
const nowIso = () => new Date().toISOString()

export default function Page() {
  const [lang, setLang] = useState('en')
  const [tab, setTab] = useState('home') // 'home' | 'trends' | 'foods' | 'ai' | 'logbook' | 'exercise' | 'profile'
  const [unit, setUnit] = useState('mg/dL')
  const [darkMode, setDarkMode] = useState(false)
  const [targets, setTargets] = useState(DEFAULT_TARGETS)

  // Auth state: user (from Supabase) or isGuest (guest session active)
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [showAuthScreen, setShowAuthScreen] = useState(false)

  // Logs & Workouts
  const [logs, setLogs] = useState([])
  const [exercise, setExercise] = useState([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [viewDoctorReport, setViewDoctorReport] = useState(false)

  // Pre-fill state when selecting a food from the 63 Indian foods database
  const [selectedFoodCarbs, setSelectedFoodCarbs] = useState(null)
  const [selectedFoodNote, setSelectedFoodNote] = useState('')

  const sheetId = process.env.NEXT_PUBLIC_GSHEET_ID || '19bbtQprtEFeshiCh-X_eAQf2V8LNWupxebdIwQSkoW0'

  // Initialize preferences, auth, and logs from local storage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('glucopulse-dark')
      if (savedTheme === 'true') {
        setDarkMode(true)
        document.documentElement.classList.add('dark')
      }

      const savedLang = localStorage.getItem('glucopulse-lang')
      if (savedLang) setLang(savedLang)

      const savedUnit = localStorage.getItem('glucopulse-unit')
      if (savedUnit) setUnit(savedUnit)

      const savedTargets = localStorage.getItem('glucopulse-targets')
      if (savedTargets) setTargets(JSON.parse(savedTargets))

      const savedGuest = localStorage.getItem('glucopulse-guest')
      if (savedGuest === 'true') setIsGuest(true)

      const savedLogs = localStorage.getItem('glucopulse-logs')
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs)
        setLogs(parsed)
      } else {
        // First-time load: populate realistic 14-day sample data automatically
        const sample = generateSampleData()
        setLogs(sample.glucoseLogs)
        setExercise(sample.exerciseLogs)
        localStorage.setItem('glucopulse-logs', JSON.stringify(sample.glucoseLogs))
        localStorage.setItem('glucopulse-exercise', JSON.stringify(sample.exerciseLogs))
      }

      const savedExercise = localStorage.getItem('glucopulse-exercise')
      if (savedExercise) setExercise(JSON.parse(savedExercise))
    } catch (e) {
      console.error('Failed to load local storage cache:', e)
    }

    if (!supabase) return

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        setIsGuest(false)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setIsGuest(false)
        setShowAuthScreen(false)
      } else {
        setUser(null)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // Sync with Supabase on user sign in
  useEffect(() => {
    if (user) {
      refreshCloud()
    }
  }, [user])

  // Toggle Dark Mode
  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('glucopulse-dark', String(next))
      return next
    })
  }

  function updateLang(newLang) {
    setLang(newLang)
    localStorage.setItem('glucopulse-lang', newLang)
  }

  function updateUnit(newUnit) {
    setUnit(newUnit)
    localStorage.setItem('glucopulse-unit', newUnit)
  }

  function updateTargets(newTargets) {
    setTargets(newTargets)
    localStorage.setItem('glucopulse-targets', JSON.stringify(newTargets))
  }

  // Local storage helpers
  function persistLocalLogs(nextLogs) {
    setLogs(nextLogs)
    localStorage.setItem('glucopulse-logs', JSON.stringify(nextLogs))
  }

  function persistLocalExercise(nextExercise) {
    setExercise(nextExercise)
    localStorage.setItem('glucopulse-exercise', JSON.stringify(nextExercise))
  }

  // Cloud Sync
  async function refreshCloud() {
    if (!supabase || !user) return

    try {
      const [{ data: glucoseData }, { data: exData }] = await Promise.all([
        supabase
          .from('glucose_logs')
          .select('*')
          .order('measured_at', { ascending: false })
          .limit(300),
        supabase
          .from('exercise_logs')
          .select('*')
          .order('performed_at', { ascending: false })
          .limit(100)
      ])

      if (glucoseData) {
        persistLocalLogs(
          glucoseData.map(x => ({
            ...x,
            type: x.reading_type,
            created_at: x.measured_at
          }))
        )
      }
      if (exData) {
        persistLocalExercise(exData)
      }
    } catch (e) {
      console.error('Cloud refresh error:', e)
    }
  }

  // Guest Login Action
  function handleGuestLogin() {
    setIsGuest(true)
    setShowAuthScreen(false)
    localStorage.setItem('glucopulse-guest', 'true')
    setMessage(lang === 'hi' ? 'अतिथि मोड में लॉग इन किया गया' : 'Logged in as Guest (Offline Mode)')
    setTimeout(() => setMessage(''), 3000)
  }

  // Load Demo Clinical Data Action
  function handleLoadDemoData() {
    const sample = generateSampleData()
    persistLocalLogs(sample.glucoseLogs)
    persistLocalExercise(sample.exerciseLogs)
    setIsGuest(true)
    setShowAuthScreen(false)
    localStorage.setItem('glucopulse-guest', 'true')
    setMessage(lang === 'hi' ? '14 दिन का क्लिनिकल डेटा लोड हुआ!' : 'Loaded 14 days of sample clinical data!')
    setTimeout(() => setMessage(''), 3500)
  }

  // Save new reading
  async function handleSaveReading(entry) {
    setBusy(true)
    setMessage('')

    const localRow = {
      id: makeId(),
      glucose_value: entry.glucose_value,
      reading_type: entry.reading_type,
      type: entry.reading_type,
      carbs: entry.carbs,
      insulin: entry.insulin,
      notes: entry.notes,
      measured_at: nowIso(),
      created_at: nowIso()
    }

    if (supabase && user) {
      const { error } = await supabase.from('glucose_logs').insert({
        user_id: user.id,
        glucose_value: entry.glucose_value,
        reading_type: entry.reading_type,
        carbs: entry.carbs || null,
        insulin: entry.insulin || null,
        notes: entry.notes || null
      })

      if (error) {
        setMessage(error.message)
        setBusy(false)
        return
      }

      await refreshCloud()
      setMessage(lang === 'hi' ? 'रीडिंग क्लाउड में सहेजी गई' : 'Reading synced to Supabase')
    } else {
      persistLocalLogs([localRow, ...logs].slice(0, 300))
      setMessage(lang === 'hi' ? 'रीडिंग डिवाइस पर सहेजी गई' : 'Reading saved locally')
    }

    // Reset prefilled food carbs
    setSelectedFoodCarbs(null)
    setSelectedFoodNote('')

    setBusy(false)
    setTimeout(() => setMessage(''), 4000)
  }

  // Handle selecting food from 63 Indian foods database
  function handleSelectFoodCarbs(food) {
    setSelectedFoodCarbs(food.carbs)
    setSelectedFoodNote(`${food.en} (${food.portion})`)
    setTab('home')
    setMessage(
      lang === 'hi'
        ? `${food.hi} (${food.carbs}g कार्ब्स) लॉग में जोड़ा गया`
        : `Selected ${food.en} (${food.carbs}g carbs). Now enter reading.`
    )
    setTimeout(() => setMessage(''), 3500)
  }

  // Update existing reading
  async function handleUpdateReading(id, updatedFields) {
    if (supabase && user) {
      const { error } = await supabase
        .from('glucose_logs')
        .update({
          glucose_value: updatedFields.glucose_value,
          reading_type: updatedFields.reading_type,
          carbs: updatedFields.carbs,
          insulin: updatedFields.insulin,
          notes: updatedFields.notes,
          updated_at: nowIso()
        })
        .eq('id', id)

      if (error) {
        setMessage(error.message)
        return
      }
      await refreshCloud()
    } else {
      const updated = logs.map(l => (l.id === id ? { ...l, ...updatedFields } : l))
      persistLocalLogs(updated)
    }
    setMessage(lang === 'hi' ? 'रीडिंग अपडेट की गई' : 'Reading updated')
    setTimeout(() => setMessage(''), 3000)
  }

  // Delete reading
  async function handleDeleteReading(id) {
    if (supabase && user) {
      const { error } = await supabase.from('glucose_logs').delete().eq('id', id)
      if (error) {
        setMessage(error.message)
        return
      }
      await refreshCloud()
    } else {
      const filtered = logs.filter(l => l.id !== id)
      persistLocalLogs(filtered)
    }
    setMessage(lang === 'hi' ? 'रीडिंग हटा दी गई' : 'Reading deleted')
    setTimeout(() => setMessage(''), 3000)
  }

  // Log Exercise
  async function handleLogExercise(exEntry) {
    setBusy(true)
    setMessage('')

    const localRow = {
      id: makeId(),
      activity: exEntry.activity,
      duration_minutes: exEntry.duration_minutes,
      notes: exEntry.notes,
      performed_at: nowIso(),
      created_at: nowIso()
    }

    if (supabase && user) {
      const { error } = await supabase.from('exercise_logs').insert({
        user_id: user.id,
        activity: exEntry.activity,
        duration_minutes: exEntry.duration_minutes,
        notes: exEntry.notes || null
      })

      if (error) {
        setMessage(error.message)
        setBusy(false)
        return
      }

      await refreshCloud()
      setMessage(lang === 'hi' ? 'व्यायाम क्लाउड में सहेजा गया' : 'Exercise synced to Supabase')
    } else {
      persistLocalExercise([localRow, ...exercise].slice(0, 100))
      setMessage(lang === 'hi' ? 'व्यायाम डिवाइस पर सहेजा गया' : 'Exercise saved locally')
    }

    setBusy(false)
    setTimeout(() => setMessage(''), 4000)
  }

  // Delete Exercise
  async function handleDeleteExercise(id) {
    if (supabase && user) {
      await supabase.from('exercise_logs').delete().eq('id', id)
      await refreshCloud()
    } else {
      const filtered = exercise.filter(e => e.id !== id)
      persistLocalExercise(filtered)
    }
  }

  // Authentication Magic Link
  async function handleSignIn(emailInput) {
    if (!supabase) {
      setMessage('Supabase client not configured')
      return
    }
    if (!emailInput || !emailInput.includes('@')) {
      setMessage('Enter a valid email address')
      return
    }

    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: emailInput,
      options: { emailRedirectTo: window.location.origin }
    })
    setBusy(false)
    setMessage(error ? error.message : 'Magic link dispatched! Check your email inbox.')
  }

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setIsGuest(false)
    localStorage.removeItem('glucopulse-guest')
    setShowAuthScreen(true)
    setMessage('Signed out')
  }

  // Export CSV
  function handleExportCsv() {
    const rows = [
      'Timestamp,ReadingType,GlucoseValue,Unit,CarbsGrams,InsulinUnits,Notes',
      ...logs.map(l => [
        new Date(l.measured_at || l.created_at).toISOString(),
        `"${l.reading_type || l.type || ''}"`,
        l.glucose_value,
        unit,
        l.carbs || '',
        l.insulin || '',
        `"${(l.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ]

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `glucopulse-readings-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Latest reading for hypoglycemia detection
  const latestLog = logs[0] || null

  const navItems = [
    { key: 'home', label: lang === 'hi' ? 'होम' : 'Dashboard', icon: LayoutDashboard },
    { key: 'foods', label: lang === 'hi' ? 'भोजन' : 'Foods (63)', icon: Utensils },
    { key: 'ai', label: lang === 'hi' ? 'AI व FAQ' : 'AI & FAQ', icon: Bot },
    { key: 'trends', label: lang === 'hi' ? 'AGP ट्रेंड' : 'Trends', icon: TrendingUp },
    { key: 'logbook', label: lang === 'hi' ? 'डायरी' : 'Logbook', icon: BookOpen },
    { key: 'exercise', label: lang === 'hi' ? 'व्यायाम' : 'Workout', icon: Dumbbell },
    { key: 'profile', label: lang === 'hi' ? 'सेटिंग्स' : 'Settings', icon: User }
  ]

  // If user explicitly requests auth screen
  if (showAuthScreen && !user && !isGuest) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 transition-colors">
        <AuthView
          onGuestLogin={handleGuestLogin}
          onEmailLogin={handleSignIn}
          onLoadDemoData={handleLoadDemoData}
          busy={busy}
          message={message}
          lang={lang}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen safe-bottom text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header - Mobile Priority & Sticky */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#080D1A]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto h-16 px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <button
            onClick={() => {
              setTab('home')
              setViewDoctorReport(false)
            }}
            className="flex items-center gap-2 text-left shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white grid place-items-center font-black shadow-md shadow-teal-500/20 text-sm sm:text-base">
              G
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight">GlucoPulse</span>
                <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-lime-400/20 text-lime-600 dark:text-lime-400 border border-lime-400/30">
                  PRO
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-semibold hidden sm:block">
                Precision Diabetes Suite
              </p>
            </div>
          </button>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Unit Indicator */}
            <button
              onClick={() => updateUnit(unit === 'mg/dL' ? 'mmol/L' : 'mg/dL')}
              className="px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-black bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 transition"
              title="Switch glucose unit"
            >
              {unit}
            </button>

            {/* Language Switcher */}
            <div className="flex rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => updateLang('en')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition ${
                  lang === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-300' : 'text-slate-400'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => updateLang('hi')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition ${
                  lang === 'hi' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-600 dark:text-teal-300' : 'text-slate-400'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-teal-500 transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />}
            </button>

            {/* Auth Indicator / Switch Account */}
            <button
              onClick={() => setShowAuthScreen(true)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 hover:border-teal-400 transition"
              title="Account / Login status"
            >
              <User className="w-3 h-3 text-teal-500" />
              <span className="hidden sm:inline">
                {user ? user.email.split('@')[0] : 'Guest'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-7">
        {/* Toast / Notification Banner */}
        {message && (
          <div className="mb-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-xs sm:text-sm font-bold flex justify-between items-center shadow-lg animate-pop">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="p-1 opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Emergency Hypo Alert (Rule of 15) */}
        <EmergencyAlert
          latestReading={latestLog}
          lang={lang}
          onDismiss={() => {}}
        />

        {/* Doctor AGP Summary Screen (Overlay View) */}
        {viewDoctorReport ? (
          <DoctorReportView
            logs={logs}
            userEmail={user?.email || 'Guest User'}
            onClose={() => setViewDoctorReport(false)}
            lang={lang}
            unit={unit}
            targets={targets}
          />
        ) : (
          <>
            {/* Tab: Dashboard / Home */}
            {tab === 'home' && (
              <div className="space-y-5 sm:space-y-6">
                <ClinicalMetricCards
                  logs={logs}
                  lang={lang}
                  unit={unit}
                  targets={targets}
                />

                <div className="grid lg:grid-cols-[390px_1fr] gap-5 sm:gap-6 items-start">
                  <QuickLogCard
                    onSave={handleSaveReading}
                    busy={busy}
                    lang={lang}
                    unit={unit}
                    targets={targets}
                    prefilledCarbs={selectedFoodCarbs}
                    prefilledNote={selectedFoodNote}
                  />

                  <div className="space-y-5 sm:space-y-6">
                    <AgpTrendChart
                      logs={logs}
                      lang={lang}
                      unit={unit}
                      targets={targets}
                    />

                    {/* Quick Access to 63 Foods & Doctor Report */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="card p-4 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-amber-500" />
                            <span>{lang === 'hi' ? '63 भारतीय खाद्य गाइड' : '63 Indian Foods Guide'}</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {lang === 'hi' ? 'रोटी, चावल, दाल के कार्ब्स और GI देखें' : 'View carbs, GI & diabetic tips'}
                          </p>
                        </div>
                        <button
                          onClick={() => setTab('foods')}
                          className="btn-teal px-3 py-1.5 text-xs shrink-0"
                        >
                          {lang === 'hi' ? 'खोजें' : 'Browse'}
                        </button>
                      </div>

                      <div className="card p-4 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-500" />
                            <span>{lang === 'hi' ? 'डॉक्टर AGP रिपोर्ट' : 'Doctor AGP Report'}</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {lang === 'hi' ? '1-क्लिक प्रिंट या PDF बनाएं' : '1-Click print or PDF export'}
                          </p>
                        </div>
                        <button
                          onClick={() => setViewDoctorReport(true)}
                          className="btn-lime px-3 py-1.5 text-xs shrink-0 font-extrabold"
                        >
                          {lang === 'hi' ? 'देखें' : 'View'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: 63 Indian Foods Explorer */}
            {tab === 'foods' && (
              <IndianFoodExplorer
                onSelectFoodCarbs={handleSelectFoodCarbs}
                lang={lang}
              />
            )}

            {/* Tab: Local AI Rules & Bilingual FAQ Assistant */}
            {tab === 'ai' && (
              <LocalAiFaqAssistant
                logs={logs}
                lang={lang}
              />
            )}

            {/* Tab: AGP Trends */}
            {tab === 'trends' && (
              <div className="space-y-6">
                <ClinicalMetricCards
                  logs={logs}
                  lang={lang}
                  unit={unit}
                  targets={targets}
                />

                <AgpTrendChart
                  logs={logs}
                  lang={lang}
                  unit={unit}
                  targets={targets}
                />
              </div>
            )}

            {/* Tab: Logbook History */}
            {tab === 'logbook' && (
              <LogHistoryTable
                logs={logs}
                onUpdateLog={handleUpdateReading}
                onDeleteLog={handleDeleteReading}
                onExportCsv={handleExportCsv}
                lang={lang}
                unit={unit}
                targets={targets}
              />
            )}

            {/* Tab: Workout / Exercise */}
            {tab === 'exercise' && (
              <ExerciseLogger
                exercises={exercise}
                onLogExercise={handleLogExercise}
                onDeleteExercise={handleDeleteExercise}
                busy={busy}
                lang={lang}
              />
            )}

            {/* Tab: Settings / Profile */}
            {tab === 'profile' && (
              <ProfileSettings
                user={user}
                backendReady={backendReady}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
                targets={targets}
                onUpdateTargets={updateTargets}
                unit={unit}
                onUpdateUnit={updateUnit}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                lang={lang}
                onUpdateLang={updateLang}
                sheetId={sheetId}
                busy={busy}
                message={message}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Bottom Navigation Bar - Optimized for Mobile Screen Priorities */}
      <nav className="fixed bottom-2.5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-20px)] max-w-xl rounded-[28px] bg-white/95 dark:bg-[#0B1224]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-1.5 grid grid-cols-7 gap-1 no-print">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = tab === item.key && !viewDoctorReport
          return (
            <button
              key={item.key}
              onClick={() => {
                setTab(item.key)
                setViewDoctorReport(false)
              }}
              className={`min-h-[48px] rounded-2xl flex flex-col items-center justify-center gap-0.5 text-[9px] sm:text-[10px] font-black transition-all ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-300 shadow-sm scale-[1.03]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate max-w-full px-0.5">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
