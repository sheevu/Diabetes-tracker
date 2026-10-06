'use client'

import { useState } from 'react'
import { X, Trash2, Check, AlertCircle } from 'lucide-react'

const TYPES = ['Fasting', 'Before Meal', 'After Meal', 'Bedtime', 'Exercise', 'Custom']

export default function EditLogModal({ log, isOpen, onClose, onUpdate, onDelete, lang = 'en', unit = 'mg/dL' }) {
  if (!isOpen || !log) return null

  const [glucose, setGlucose] = useState(log.glucose_value || 120)
  const [type, setType] = useState(log.reading_type || log.type || 'After Meal')
  const [carbs, setCarbs] = useState(log.carbs ?? '')
  const [insulin, setInsulin] = useState(log.insulin ?? '')
  const [notes, setNotes] = useState(log.notes || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const t = lang === 'hi' ? {
    title: 'रीडिंग संपादित करें',
    save: 'बदलाव सहेजें',
    delete: 'हटाएं',
    confirmDelete: 'क्या आप निश्चित हैं?',
    cancel: 'रद्द करें',
    glucose: 'ग्लूकोज',
    type: 'प्रकार',
    carbs: 'कार्ब्स (ग्राम)',
    insulin: 'इंसुलिन (यूनिट्स)',
    notes: 'नोट्स'
  } : {
    title: 'Edit Reading',
    save: 'Save Changes',
    delete: 'Delete',
    confirmDelete: 'Are you sure?',
    cancel: 'Cancel',
    glucose: 'Glucose',
    type: 'Reading Context',
    carbs: 'Carbs (grams)',
    insulin: 'Insulin (units)',
    notes: 'Notes'
  }

  function handleSave() {
    onUpdate(log.id, {
      glucose_value: Number(glucose),
      reading_type: type,
      carbs: carbs !== '' ? Number(carbs) : null,
      insulin: insulin !== '' ? Number(insulin) : null,
      notes: notes.trim() || null
    })
    onClose()
  }

  function handleDelete() {
    onDelete(log.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">{t.title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <label className="text-xs font-bold text-slate-500">{t.glucose} ({unit})</label>
            <input
              type="number"
              min="20"
              max="600"
              value={glucose}
              onChange={e => setGlucose(e.target.value)}
              className="mt-1 w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-lg font-black outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">{t.type}</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm font-semibold outline-none focus:border-teal-500"
            >
              {TYPES.map(tp => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500">{t.carbs}</label>
              <input
                type="number"
                value={carbs}
                onChange={e => setCarbs(e.target.value)}
                placeholder="0"
                className="mt-1 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">{t.insulin}</label>
              <input
                type="number"
                step="0.5"
                value={insulin}
                onChange={e => setInsulin(e.target.value)}
                placeholder="0"
                className="mt-1 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500">{t.notes}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs outline-none focus:border-teal-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.delete}</span>
            </button>
          ) : (
            <button
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              {t.confirmDelete}
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="btn-teal px-5 py-2 text-xs"
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
