'use client'

import { useState } from 'react'
import { Flame, Dumbbell, Timer, Plus, CheckCircle, Trash2 } from 'lucide-react'

const ACTIVITIES = [
  { name: 'Brisk Walking', rate: 4.5, icon: '🚶' },
  { name: 'Cycling', rate: 7.0, icon: '🚴' },
  { name: 'Strength Training', rate: 5.0, icon: '🏋️' },
  { name: 'Yoga & Stretching', rate: 3.0, icon: '🧘' },
  { name: 'Jogging / Running', rate: 9.5, icon: '🏃' },
  { name: 'Swimming', rate: 8.0, icon: '🏊' }
]

export default function ExerciseLogger({
  exercises = [],
  onLogExercise,
  onDeleteExercise,
  busy = false,
  lang = 'en'
}) {
  const [selectedActivity, setSelectedActivity] = useState(ACTIVITIES[0].name)
  const [duration, setDuration] = useState(25)
  const [notes, setNotes] = useState('')

  const t = lang === 'hi' ? {
    title: 'व्यायाम और शारीरिक गतिविधि',
    subtitle: 'नियमित व्यायाम इंसुलिन संवेदनशीलता में सुधार करता है',
    activity: 'गतिविधि चुनें',
    duration: 'अवधि (मिनट)',
    notes: 'नोट्स (वैकल्पिक)',
    logBtn: 'व्यायाम दर्ज करें',
    history: 'हाल की गतिविधियां',
    empty: 'अभी कोई व्यायाम दर्ज नहीं हुआ',
    estBurn: 'अनुमानित बर्न',
    mins: 'मिनट'
  } : {
    title: 'Exercise & Activity Tracker',
    subtitle: 'Physical activity enhances insulin sensitivity and lowers post-meal spikes',
    activity: 'Select Activity',
    duration: 'Duration (Minutes)',
    notes: 'Notes (Optional)',
    logBtn: 'Log Exercise',
    history: 'Workout History',
    empty: 'No exercise logged yet',
    estBurn: 'Est. Calorie Burn',
    mins: 'min'
  }

  const currentRate = ACTIVITIES.find(a => a.name === selectedActivity)?.rate || 5.0
  const estimatedCalories = Math.round((Number(duration) || 0) * currentRate)

  function handleSubmit() {
    onLogExercise({
      activity: selectedActivity,
      duration_minutes: Number(duration),
      notes: notes.trim() || null
    })
    setNotes('')
  }

  return (
    <div className="grid md:grid-cols-[380px_1fr] gap-5">
      {/* Logger Form */}
      <section className="card p-5 sm:p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <Dumbbell className="w-5 h-5" />
            <h2 className="font-black text-lg text-slate-900 dark:text-slate-100">{t.title}</h2>
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-1">{t.subtitle}</p>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            {t.activity}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITIES.map(act => (
              <button
                key={act.name}
                type="button"
                onClick={() => setSelectedActivity(act.name)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  selectedActivity === act.name
                    ? 'bg-teal-500 text-white border-teal-500 shadow-sm scale-[1.02]'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                }`}
              >
                <span>{act.icon}</span>
                <span className="truncate">{act.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.duration}
            </label>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100">
              {duration} {t.mins}
            </span>
          </div>

          <input
            type="range"
            min="5"
            max="180"
            step="5"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full accent-teal-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
            <span>5 min</span>
            <span>30 min</span>
            <span>60 min</span>
            <span>120+ min</span>
          </div>
        </div>

        {/* Estimated burn badge */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            {t.estBurn}
          </span>
          <span className="font-black text-sm">~{estimatedCalories} kcal</span>
        </div>

        <button
          disabled={busy}
          onClick={handleSubmit}
          className="btn-lime w-full min-h-[50px] flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{busy ? '...' : t.logBtn}</span>
        </button>
      </section>

      {/* History Feed */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-black text-lg text-slate-900 dark:text-slate-100 mb-3">
          {t.history}
        </h2>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {exercises.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm font-semibold">
              {t.empty}
            </div>
          ) : (
            exercises.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-teal-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                    {ACTIVITIES.find(a => a.name === item.activity)?.icon || '🏃'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.activity}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.performed_at || item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-black text-base text-slate-900 dark:text-slate-100">
                      {item.duration_minutes}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">min</span>
                  </div>

                  {onDeleteExercise && (
                    <button
                      onClick={() => onDeleteExercise(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
