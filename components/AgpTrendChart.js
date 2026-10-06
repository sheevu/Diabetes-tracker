'use client'

import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts'
import { TrendingUp, Calendar, Info } from 'lucide-react'
import { classifyGlucose, toMmol } from '@/lib/clinicalMetrics'

export default function AgpTrendChart({
  logs = [],
  lang = 'en',
  unit = 'mg/dL',
  targets = { low: 70, high: 180 }
}) {
  const [rangeDays, setRangeDays] = useState(7)

  const t = lang === 'hi' ? {
    title: 'एम्बुलेटरी ग्लूकोज प्रोफाइल (AGP)',
    targetBadge: `लक्ष्य: ${targets.low}–${targets.high} ${unit}`,
    empty: 'चार्ट देखने के लिए कम से कम 2 रीडिंग जोड़ें',
    carbs: 'कार्ब्स',
    insulin: 'इंसुलिन',
    notes: 'नोट्स',
    unit: unit,
    d1: '24 घंटे',
    d7: '7 दिन',
    d14: '14 दिन',
    d30: '30 दिन',
    all: 'सभी'
  } : {
    title: 'Ambulatory Glucose Profile (AGP)',
    targetBadge: `Target: ${targets.low}–${targets.high} ${unit}`,
    empty: 'Add at least 2 readings to see your interactive trend',
    carbs: 'Carbs',
    insulin: 'Insulin',
    notes: 'Notes',
    unit: unit,
    d1: '24h',
    d7: '7D',
    d14: '14D',
    d30: '30D',
    all: 'All'
  }

  // Filter logs according to selected range
  const filteredLogs = useMemo(() => {
    if (!logs || !logs.length) return []
    if (rangeDays === 'all') return logs

    const now = new Date().getTime()
    const cutoff = now - (rangeDays * 24 * 60 * 60 * 1000)

    return logs.filter(l => {
      const d = new Date(l.measured_at || l.created_at).getTime()
      return !isNaN(d) && d >= cutoff
    })
  }, [logs, rangeDays])

  // Prepare chronological data for Recharts
  const chartData = useMemo(() => {
    return [...filteredLogs]
      .sort((a, b) => new Date(a.measured_at || a.created_at) - new Date(b.measured_at || b.created_at))
      .map(item => {
        const dateObj = new Date(item.measured_at || item.created_at)
        const val = Number(item.glucose_value)
        const displayVal = unit === 'mmol/L' ? toMmol(val) : val
        const category = classifyGlucose(val, targets)

        return {
          id: item.id,
          rawTimestamp: dateObj.getTime(),
          timeLabel: dateObj.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          glucose: displayVal,
          rawGlucose: val,
          type: item.reading_type || item.type || 'Custom',
          carbs: item.carbs,
          insulin: item.insulin,
          notes: item.notes,
          color: category.color,
          status: category.status
        }
      })
  }, [filteredLogs, lang, unit, targets])

  // Unit-adjusted target thresholds for chart rendering
  const displayLow = unit === 'mmol/L' ? toMmol(targets.low) : targets.low
  const displayHigh = unit === 'mmol/L' ? toMmol(targets.high) : targets.high

  return (
    <section className="card p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-black text-base sm:text-lg text-slate-900 dark:text-slate-100">{t.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{t.targetBadge}</span>
            </div>
          </div>
        </div>

        {/* Time Window Switcher */}
        <div className="flex rounded-full bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/60 text-xs font-bold self-start sm:self-auto">
          {[
            { label: t.d1, val: 1 },
            { label: t.d7, val: 7 },
            { label: t.d14, val: 14 },
            { label: t.d30, val: 30 },
            { label: t.all, val: 'all' }
          ].map(btn => (
            <button
              key={btn.val}
              onClick={() => setRangeDays(btn.val)}
              className={`px-3 py-1 rounded-full transition-all ${
                rangeDays === btn.val
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length < 2 ? (
        <div className="h-56 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <Info className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-xs sm:text-sm font-semibold max-w-xs">{t.empty}</p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#219EBC" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#219EBC" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Shaded Target Corridor (e.g., 70-180 mg/dL) */}
              <ReferenceArea
                y1={displayLow}
                y2={displayHigh}
                fill="#10B981"
                fillOpacity={0.08}
                stroke="#10B981"
                strokeOpacity={0.2}
                strokeDasharray="3 3"
              />

              {/* Boundary Reference Lines */}
              <ReferenceLine y={displayLow} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} opacity={0.6} />
              <ReferenceLine y={displayHigh} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1.5} opacity={0.6} />

              <XAxis
                dataKey="timeLabel"
                stroke="#94A3B8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={25}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />

              <Tooltip content={<CustomTooltip unit={unit} lang={lang} />} />

              <Area
                type="monotone"
                dataKey="glucose"
                stroke="#219EBC"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#glucoseGradient)"
                dot={(props) => {
                  const { cx, cy, payload } = props
                  const fill = payload.color || '#219EBC'
                  return (
                    <circle
                      key={`dot-${cx}-${cy}`}
                      cx={cx}
                      cy={cy}
                      r={4.5}
                      fill="#FFFFFF"
                      stroke={fill}
                      strokeWidth={2.5}
                    />
                  )
                }}
                activeDot={{ r: 7, stroke: '#0F172A', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Target Zone Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>&lt; {displayLow} (Hypo)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>{displayLow}–{displayHigh} (In Range)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>&gt; {displayHigh} (Hyper)</span>
        </div>
      </div>
    </section>
  )
}

function CustomTooltip({ active, payload, unit, lang }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const isHypo = data.rawGlucose < 70
  const isHyper = data.rawGlucose > 180

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl border border-slate-200 dark:border-slate-800 text-xs min-w-[170px] animate-fade-in">
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
        {data.timeLabel}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-xl font-black tabular-nums text-slate-900 dark:text-slate-100">
          {data.glucose}
        </span>
        <span className="text-[11px] font-bold text-slate-400">{unit}</span>
        <span
          className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white"
          style={{ backgroundColor: data.color }}
        >
          {data.type}
        </span>
      </div>

      {(data.carbs || data.insulin) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          {data.carbs ? <span>🍞 {data.carbs}g</span> : null}
          {data.insulin ? <span>💉 {data.insulin}U</span> : null}
        </div>
      )}

      {data.notes && (
        <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 italic break-words">
          &ldquo;{data.notes}&rdquo;
        </div>
      )}
    </div>
  )
}
