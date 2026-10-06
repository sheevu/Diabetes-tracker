'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Download,
  Printer,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Utensils,
  Syringe,
  ChevronDown
} from 'lucide-react'
import { classifyGlucose, formatGlucose, toMmol } from '@/lib/clinicalMetrics'
import EditLogModal from './EditLogModal'

export default function LogHistoryTable({
  logs = [],
  onUpdateLog,
  onDeleteLog,
  onExportCsv,
  lang = 'en',
  unit = 'mg/dL',
  targets = { low: 70, high: 180 }
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all') // 'all' | 'low' | 'in-range' | 'high'
  const [editingLog, setEditingLog] = useState(null)

  const t = lang === 'hi' ? {
    title: 'रीडिंग इतिहास और डायरी',
    searchPlaceholder: 'रीडिंग प्रकार या नोट्स खोजें...',
    all: 'सभी',
    inTarget: 'लक्ष्य में',
    hypo: 'हाइपो (<70)',
    hyper: 'हाइपर (>180)',
    empty: 'कोई रीडिंग नहीं मिली',
    exportCsv: 'CSV डाउनलोड',
    printReport: 'डॉक्टर रिपोर्ट प्रिंट करें',
    edit: 'संपादित करें',
    delete: 'हटाएं'
  } : {
    title: 'Readings History & Logbook',
    searchPlaceholder: 'Search by meal type or notes...',
    all: 'All',
    inTarget: 'In Target',
    hypo: 'Hypo (<70)',
    hyper: 'Hyper (>180)',
    empty: 'No matching readings found',
    exportCsv: 'Export CSV',
    printReport: 'Print Clinical Summary',
    edit: 'Edit',
    delete: 'Delete'
  }

  // Filter & Search
  const filteredLogs = useMemo(() => {
    return logs.filter(item => {
      const val = Number(item.glucose_value)
      const matchesSearch =
        (item.reading_type || item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes || '').toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      if (filterCategory === 'low') return val < targets.low
      if (filterCategory === 'in-range') return val >= targets.low && val <= targets.high
      if (filterCategory === 'high') return val > targets.high
      return true
    })
  }, [logs, searchTerm, filterCategory, targets])

  function handlePrint() {
    window.print()
  }

  return (
    <div className="card p-4 sm:p-6 space-y-4">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100">{t.title}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {logs.length} readings recorded
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn-teal px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printReport}</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs sm:text-sm outline-none focus:border-teal-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/60 text-xs font-bold shrink-0 overflow-x-auto">
          {[
            { id: 'all', label: t.all },
            { id: 'in-range', label: t.inTarget },
            { id: 'low', label: t.hypo },
            { id: 'high', label: t.hyper }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterCategory(f.id)}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterCategory === f.id
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Rows */}
      <div className="space-y-2.5 pt-1">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-semibold">
            {t.empty}
          </div>
        ) : (
          filteredLogs.map(l => {
            const val = Number(l.glucose_value)
            const cat = classifyGlucose(val, targets)
            const displayVal = unit === 'mmol/L' ? toMmol(val) : val
            const dateObj = new Date(l.measured_at || l.created_at)

            return (
              <div
                key={l.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/40 hover:border-teal-500/40 transition-all gap-3"
              >
                {/* Left: Reading details */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-2.5 h-10 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {l.reading_type || l.type || 'Custom'}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${cat.badgeBg}`}>
                        {lang === 'hi' ? cat.labelHi : cat.label}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {dateObj.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {/* Carbs, Insulin & Notes */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {l.carbs ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/50">
                          <Utensils className="w-3 h-3" /> {l.carbs}g carbs
                        </span>
                      ) : null}
                      {l.insulin ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-200/50">
                          <Syringe className="w-3 h-3" /> {l.insulin}U
                        </span>
                      ) : null}
                      {l.notes ? (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-xs">
                          &ldquo;{l.notes}&rdquo;
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right: Value & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-slate-100">
                      {displayVal}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 ml-1">
                      {unit}
                    </span>
                  </div>

                  {/* Edit Button */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingLog(l)}
                      className="p-2 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title={t.edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteLog(l.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingLog && (
        <EditLogModal
          log={editingLog}
          isOpen={Boolean(editingLog)}
          onClose={() => setEditingLog(null)}
          onUpdate={onUpdateLog}
          onDelete={onDeleteLog}
          lang={lang}
          unit={unit}
        />
      )}
    </div>
  )
}
