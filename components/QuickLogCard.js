'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Utensils, Syringe, Clock, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import { classifyGlucose } from '@/lib/clinicalMetrics'

const READING_TYPES = [
  { id: 'Fasting', en: 'Fasting', hi: 'खाली पेट (Fasting)' },
  { id: 'Before Meal', en: 'Before Meal', hi: 'खाने से पहले' },
  { id: 'After Meal', en: 'After Meal', hi: 'खाने के बाद' },
  { id: 'Bedtime', en: 'Bedtime', hi: 'सोने से पहले' },
  { id: 'Exercise', en: 'Post-Workout', hi: 'व्यायाम के बाद' },
  { id: 'Custom', en: 'Night / Other', hi: 'अन्य / रात' }
]

const QUICK_PRESETS = [80, 100, 118, 135, 155, 180, 210, 250]
const CARB_PRESETS = [15, 30, 45, 60]

export default function QuickLogCard({
  onSave,
  busy = false,
  lang = 'en',
  unit = 'mg/dL',
  targets = { low: 70, high: 180 },
  prefilledCarbs = null,
  prefilledNote = ''
}) {
  const [value, setValue] = useState(118)
  const [readingType, setReadingType] = useState('After Meal')
  const [carbs, setCarbs] = useState(prefilledCarbs ? String(prefilledCarbs) : '')
  const [insulin, setInsulin] = useState('')
  const [notes, setNotes] = useState(prefilledNote || '')
  const [showAdvanced, setShowAdvanced] = useState(Boolean(prefilledCarbs))

  // Update if prefilledCarbs or prefilledNote changes
  useEffect(() => {
    if (prefilledCarbs != null) {
      setCarbs(String(prefilledCarbs))
      setShowAdvanced(true)
    }
    if (prefilledNote) {
      setNotes(prefilledNote)
    }
  }, [prefilledCarbs, prefilledNote])

  const t = lang === 'hi' ? {
    title: 'नई ग्लूकोज रीडिंग दर्ज करें',
    quickPresets: 'त्वरित मान',
    saveBtn: 'रीडिंग सहेजें',
    saving: 'सहेजा जा रहा है...',
    carbsLabel: 'कार्बोहाइड्रेट (ग्राम)',
    carbsPlaceholder: 'उदा. 45',
    insulinLabel: 'इंसुलिन खुराक (यूनिट्स)',
    insulinPlaceholder: 'उदा. 4.5',
    notesLabel: 'नोट्स / भोजन का विवरण',
    notesPlaceholder: 'क्या खाया या कैसा महसूस हुआ...',
    advancedToggle: showAdvanced ? '− कम विकल्प' : '+ कार्ब्स और इंसुलिन जोड़ें',
    rangeLabel: 'सीमा'
  } : {
    title: 'Log Glucose Reading',
    quickPresets: 'Quick Values',
    saveBtn: 'Save Reading',
    saving: 'Saving...',
    carbsLabel: 'Carbohydrates (grams)',
    carbsPlaceholder: 'e.g., 45',
    insulinLabel: 'Insulin Dose (Units)',
    insulinPlaceholder: 'e.g., 4.5',
    notesLabel: 'Notes / Meal Details',
    notesPlaceholder: 'What you ate, symptoms, or activity...',
    advancedToggle: showAdvanced ? '− Less details' : '+ Add Carbs & Insulin',
    rangeLabel: 'Range'
  }

  const category = classifyGlucose(Number(value), targets)

  function handleSave() {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      navigator.vibrate(20)
    }

    const numericVal = Number(value)
    if (numericVal >= targets.low && numericVal <= targets.high) {
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#219EBC', '#C6E423', '#10B981']
        })
      } catch {}
    }

    onSave({
      glucose_value: numericVal,
      reading_type: readingType,
      carbs: carbs ? Number(carbs) : null,
      insulin: insulin ? Number(insulin) : null,
      notes: notes.trim() || null
    })

    setNotes('')
    setCarbs('')
    setInsulin('')
  }

  return (
    <section className="card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">{t.title}</span>
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
          </div>
        </div>

        {/* Dynamic Category Pill */}
        <span
          className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-sm transition-all"
          style={{ backgroundColor: category.color }}
        >
          {lang === 'hi' ? category.labelHi : category.label}
        </span>
      </div>

      {/* Main Glucose Number Input */}
      <div className="relative my-2 flex flex-col items-center justify-center">
        <div className="flex items-baseline justify-center gap-1.5 w-full">
          <input
            value={value}
            onChange={e => setValue(e.target.value)}
            inputMode="numeric"
            type="number"
            min="20"
            max="600"
            className="w-48 text-center text-6xl sm:text-7xl font-black bg-transparent outline-none py-2 text-slate-900 dark:text-slate-100 tabular-nums focus:scale-105 transition-transform"
          />
          <span className="text-base font-bold text-slate-400">{unit}</span>
        </div>

        {/* Tactile Range Slider for Smooth Adjustments */}
        <div className="w-full max-w-xs mt-1 px-3">
          <input
            type="range"
            min="40"
            max="350"
            value={value || 118}
            onChange={e => setValue(Number(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Reading Context Chips */}
      <div className="grid grid-cols-3 gap-2 my-4">
        {READING_TYPES.map(rt => {
          const isSelected = readingType === rt.id
          return (
            <button
              key={rt.id}
              type="button"
              onClick={() => setReadingType(rt.id)}
              className={`min-h-[44px] px-2 rounded-2xl border text-[11px] sm:text-xs font-bold transition-all text-center ${
                isSelected
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
              }`}
            >
              {lang === 'hi' ? rt.hi : rt.en}
            </button>
          )
        })}
      </div>

      {/* Quick Value Presets */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4">
        {QUICK_PRESETS.map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setValue(v)}
            className={`h-10 rounded-xl font-black text-xs sm:text-sm border transition-all ${
              Number(value) === v
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Toggle Carbs & Insulin Section */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 mb-2"
        >
          {t.advancedToggle}
        </button>

        {showAdvanced && (
          <div className="space-y-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-fade-in">
            {/* Carbs */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-500" />
                  {t.carbsLabel}
                </label>
                <div className="flex gap-1">
                  {CARB_PRESETS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCarbs(c)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400"
                    >
                      +{c}g
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="0"
                max="500"
                value={carbs}
                onChange={e => setCarbs(e.target.value)}
                placeholder={t.carbsPlaceholder}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm outline-none focus:border-teal-500"
              />
            </div>

            {/* Insulin */}
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Syringe className="w-3.5 h-3.5 text-indigo-500" />
                {t.insulinLabel}
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={insulin}
                onChange={e => setInsulin(e.target.value)}
                placeholder={t.insulinPlaceholder}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Notes Input */}
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        maxLength={1000}
        placeholder={t.notesPlaceholder}
        className="mt-3 w-full min-h-[76px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-3 text-xs sm:text-sm outline-none focus:border-teal-500 dark:text-slate-200 resize-none"
      />

      {/* Submit Button */}
      <button
        disabled={busy}
        onClick={handleSave}
        className="btn-lime w-full min-h-[52px] mt-4 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
      >
        <PlusCircle className="w-5 h-5" />
        <span>{busy ? t.saving : t.saveBtn}</span>
      </button>
    </section>
  )
}
