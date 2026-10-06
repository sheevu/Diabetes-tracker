'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, RefreshCw, X, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function EmergencyAlert({ latestReading, lang = 'en', onDismiss }) {
  const [timerSeconds, setTimerSeconds] = useState(15 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const [completed, setCompleted] = useState(false)

  const value = Number(latestReading?.glucose_value)
  const isHypo = Number.isFinite(value) && value > 0 && value < 70
  const isSevere = value < 54

  useEffect(() => {
    let interval = null
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1)
      }, 1000)
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false)
      setCompleted(true)
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(lang === 'hi' ? 'समय समाप्त! पुनः ग्लूकोज जांचें' : 'Time to Re-test Glucose!', {
          body: lang === 'hi' ? '15 मिनट हो गए हैं। कृपया अपना ब्लड शुगर स्तर जांचें।' : '15 minutes have passed. Please check your blood sugar level now.'
        })
      }
    }
    return () => clearInterval(interval)
  }, [timerRunning, timerSeconds, lang])

  if (!isHypo) return null

  const minutes = Math.floor(timerSeconds / 60)
  const seconds = timerSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const t = lang === 'hi' ? {
    title: isSevere ? 'गंभीर हाइपोग्लाइसीमिया चेतावनी (<54 mg/dL)' : 'हाइपोग्लाइसीमिया चेतावनी (<70 mg/dL)',
    subtitle: 'कम ब्लड शुगर सुरक्षा प्रोटोकॉल — तुरंत कार्रवाई करें',
    rule15Title: '15 का नियम (Rule of 15):',
    step1: '15 ग्राम तेज असर करने वाले कार्ब्स लें (1/2 कप फलों का जूस, 3-4 ग्लूकोज टैबलेट, या 1 चम्मच शहद/चीनी)।',
    step2: '15 मिनट आराम करें और प्रतीक्षा करें।',
    step3: 'पुनः जांच करें — यदि अभी भी 70 से कम है, तो दोहराएं।',
    startTimer: '15-मिनट टाइमर शुरू करें',
    pauseTimer: 'टाइमर रोकें',
    resetTimer: 'रीसेट',
    timerRunning: 'पुनः जांच का समय बाकी:',
    timeUp: '15 मिनट पूरे! कृपया तुरंत ग्लूकोज पुनः मापें।'
  } : {
    title: isSevere ? 'Critical Hypoglycemia Alert (<54 mg/dL)' : 'Hypoglycemia Warning (<70 mg/dL)',
    subtitle: 'Low Blood Sugar Safety Protocol — Take Action Immediately',
    rule15Title: 'Clinical Rule of 15:',
    step1: 'Consume 15g of fast-acting carbohydrates (1/2 cup fruit juice, 3–4 glucose tablets, or 1 tbsp honey/sugar).',
    step2: 'Rest and wait for 15 minutes without over-treating.',
    step3: 'Re-test glucose — if still under 70 mg/dL, repeat with another 15g.',
    startTimer: 'Start 15-Min Timer',
    pauseTimer: 'Pause Timer',
    resetTimer: 'Reset',
    timerRunning: 'Time until re-check:',
    timeUp: '15 minutes elapsed! Please re-test your glucose now.'
  }

  return (
    <div className={`mb-5 rounded-[26px] p-4 sm:p-5 border-2 shadow-lg transition-all animate-pop ${
      isSevere 
        ? 'bg-red-50/90 dark:bg-red-950/40 border-red-500/80 text-red-900 dark:text-red-100'
        : 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-400 dark:border-rose-500/60 text-rose-950 dark:text-rose-100'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base leading-tight">{t.title}</h3>
            <p className="text-xs opacity-80 mt-0.5">{t.subtitle}</p>
          </div>
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss} 
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
            aria-label="Dismiss warning"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3.5 bg-white/80 dark:bg-slate-900/80 rounded-2xl p-3.5 border border-red-200 dark:border-red-900/60 text-xs sm:text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">
        <p className="font-extrabold text-red-600 dark:text-red-400 mb-1">{t.rule15Title}</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Step 1:</strong> {t.step1}</li>
          <li><strong>Step 2:</strong> {t.step2}</li>
          <li><strong>Step 3:</strong> {t.step3}</li>
        </ul>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 font-mono font-black text-base sm:text-lg">
          <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span>{formattedTime}</span>
          {completed && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t.timeUp}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-red-600 text-white hover:bg-red-700 shadow-sm transition active:scale-95"
          >
            {timerRunning ? t.pauseTimer : t.startTimer}
          </button>
          <button
            onClick={() => {
              setTimerRunning(false)
              setTimerSeconds(15 * 60)
              setCompleted(false)
            }}
            className="p-2 rounded-xl text-xs font-bold border border-current opacity-70 hover:opacity-100 transition"
            title={t.resetTimer}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
