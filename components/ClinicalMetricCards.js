'use client'

import { useMemo } from 'react'
import { Activity, Target, Zap, ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { calculateAGPMetrics, formatGlucose, toMmol } from '@/lib/clinicalMetrics'

export default function ClinicalMetricCards({ logs = [], lang = 'en', unit = 'mg/dL', targets }) {
  const metrics = useMemo(() => {
    return calculateAGPMetrics(logs, targets)
  }, [logs, targets])

  const t = lang === 'hi' ? {
    tir: 'टाइम इन रेंज (TIR)',
    tirGoal: 'लक्ष्य >70%',
    ea1c: 'अनुमानित HbA1c',
    ea1cGoal: 'लक्ष्य <7.0%',
    avg: 'औसत ग्लूकोज',
    cv: 'परिवर्तनशीलता (CV%)',
    cvGoal: 'स्थिरता लक्ष्य ≤36%',
    lows: 'हाइपो (<70)',
    highs: 'हाइपर (>180)',
    readings: 'कुल रीडिंग',
    gmi: 'ग्लूकोज प्रबंधन (GMI)'
  } : {
    tir: 'Time In Range (TIR)',
    tirGoal: 'ADA Target >70%',
    ea1c: 'Estimated HbA1c',
    ea1cGoal: 'Clinical Target <7.0%',
    avg: 'Average Glucose',
    cv: 'Variability (CV%)',
    cvGoal: 'Stability Target ≤36%',
    lows: 'Low (<70)',
    highs: 'High (>180)',
    readings: 'Readings Logged',
    gmi: 'GMI Indicator'
  }

  const tirColor = metrics.tir >= 70
    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    : metrics.tir >= 50
    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
    : 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'

  const cvColor = metrics.cv > 0 && metrics.cv <= 36
    ? 'text-emerald-500'
    : 'text-amber-500'

  const displayAvg = unit === 'mmol/L' ? toMmol(metrics.mean) : metrics.mean

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Time In Range */}
      <div className="card p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.tir}
          </span>
          <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {metrics.count ? `${metrics.tir}%` : '—'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2 flex">
            <div style={{ width: `${metrics.tbr}%` }} className="bg-red-500 h-full" title={`Low: ${metrics.tbr}%`} />
            <div style={{ width: `${metrics.tir}%` }} className="bg-emerald-500 h-full" title={`In Range: ${metrics.tir}%`} />
            <div style={{ width: `${metrics.tar}%` }} className="bg-amber-500 h-full" title={`High: ${metrics.tar}%`} />
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border self-start ${tirColor}`}>
          {t.tirGoal}
        </span>
      </div>

      {/* 2. Estimated HbA1c */}
      <div className="card p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.ea1c}
          </span>
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {metrics.count ? `${metrics.eA1c}%` : '—'}
            </span>
            {metrics.count ? (
              <span className="text-xs font-semibold text-slate-400">GMI {metrics.gmi}%</span>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {metrics.count ? `Min ${metrics.min} • Max ${metrics.max}` : 'Calculated over logged readings'}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start">
          {t.ea1cGoal}
        </span>
      </div>

      {/* 3. Average Glucose */}
      <div className="card p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.avg}
          </span>
          <div className="w-7 h-7 rounded-xl bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {metrics.count ? displayAvg : '—'}
            </span>
            <span className="text-xs font-bold text-slate-400">{unit}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            SD: ±{metrics.sd} {unit}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start">
          {metrics.count} {t.readings}
        </span>
      </div>

      {/* 4. Glucose Variability (CV%) */}
      <div className="card p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.cv}
          </span>
          <div className="w-7 h-7 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-black ${cvColor}`}>
              {metrics.count ? `${metrics.cv}%` : '—'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {metrics.variabilityStatus === 'stable' ? '✓ Clinically Stable Curve' : 'High Fluctuation Risk'}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start">
          {t.cvGoal}
        </span>
      </div>
    </section>
  )
}
