/**
 * Clinical Metrics Calculation Engine for Diabetes Care
 * Formulated following International Consensus on Time in Range (TIR)
 * and American Diabetes Association (ADA) clinical guidelines.
 */

export const DEFAULT_TARGETS = {
  low: 70,       // mg/dL
  high: 180,     // mg/dL
  veryLow: 54,   // Level 2 Hypoglycemia
  veryHigh: 250, // Level 2 Hyperglycemia
}

export const MMOL_CONVERSION_FACTOR = 18.0182

/**
 * Convert mg/dL to mmol/L
 */
export function toMmol(mgdl) {
  if (mgdl == null || isNaN(mgdl)) return 0
  return Number((mgdl / MMOL_CONVERSION_FACTOR).toFixed(1))
}

/**
 * Convert mmol/L to mg/dL
 */
export function toMgdl(mmol) {
  if (mmol == null || isNaN(mmol)) return 0
  return Math.round(mmol * MMOL_CONVERSION_FACTOR)
}

/**
 * Format reading according to user's selected unit
 */
export function formatGlucose(mgdl, unit = 'mg/dL') {
  if (mgdl == null || isNaN(mgdl)) return '—'
  if (unit === 'mmol/L') {
    return `${toMmol(mgdl)} mmol/L`
  }
  return `${Math.round(mgdl)} mg/dL`
}

/**
 * Calculate standard AGP (Ambulatory Glucose Profile) metrics
 * from an array of glucose readings.
 * 
 * @param {Array<{ glucose_value: number, measured_at?: string, created_at?: string }>} logs
 * @param {{ low?: number, high?: number }} targets
 */
export function calculateAGPMetrics(logs = [], targets = DEFAULT_TARGETS) {
  const targetLow = targets.low || DEFAULT_TARGETS.low
  const targetHigh = targets.high || DEFAULT_TARGETS.high
  const veryLowCutoff = DEFAULT_TARGETS.veryLow
  const veryHighCutoff = DEFAULT_TARGETS.veryHigh

  const validValues = logs
    .map(l => Number(l.glucose_value))
    .filter(v => Number.isFinite(v) && v >= 20 && v <= 600)

  const count = validValues.length
  if (count === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      sd: 0,
      cv: 0,
      eA1c: 0,
      gmi: 0,
      tir: 0,
      tbr: 0,
      tbrVeryLow: 0,
      tar: 0,
      tarVeryHigh: 0,
      variabilityStatus: 'normal'
    }
  }

  // Mean & Median
  const sum = validValues.reduce((acc, v) => acc + v, 0)
  const mean = Math.round(sum / count)

  const sorted = [...validValues].sort((a, b) => a - b)
  const median = count % 2 === 0
    ? Math.round((sorted[count / 2 - 1] + sorted[count / 2]) / 2)
    : sorted[Math.floor(count / 2)]

  const min = sorted[0]
  const max = sorted[count - 1]

  // Standard Deviation (SD)
  const variance = validValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count
  const sd = Number(Math.sqrt(variance).toFixed(1))

  // Coefficient of Variation (CV% = SD / Mean * 100). ADA clinical target is <= 36%
  const cv = mean > 0 ? Number(((sd / mean) * 100).toFixed(1)) : 0
  const variabilityStatus = cv <= 36 ? 'stable' : 'variable'

  // Time in Range Breakdown
  const veryLowCount = validValues.filter(v => v < veryLowCutoff).length
  const lowCount = validValues.filter(v => v >= veryLowCutoff && v < targetLow).length
  const inRangeCount = validValues.filter(v => v >= targetLow && v <= targetHigh).length
  const highCount = validValues.filter(v => v > targetHigh && v <= veryHighCutoff).length
  const veryHighCount = validValues.filter(v => v > veryHighCutoff).length

  const tir = Math.round((inRangeCount / count) * 100)
  const tbrVeryLow = Math.round((veryLowCount / count) * 100)
  const tbr = Math.round(((veryLowCount + lowCount) / count) * 100)
  const tar = Math.round(((highCount + veryHighCount) / count) * 100)
  const tarVeryHigh = Math.round((veryHighCount / count) * 100)

  // Estimated A1c (eA1c formula by Nathan et al.: eA1c = (mean + 46.7) / 28.7)
  const eA1c = Number(((mean + 46.7) / 28.7).toFixed(1))

  // Glucose Management Indicator (GMI: Bergenstal et al. formula: 3.31 + 0.02392 * mean)
  const gmi = Number((3.31 + 0.02392 * mean).toFixed(1))

  return {
    count,
    mean,
    median,
    min,
    max,
    sd,
    cv,
    eA1c,
    gmi,
    tir,
    tbr,
    tbrVeryLow,
    tar,
    tarVeryHigh,
    variabilityStatus
  }
}

/**
 * Filter readings by date window
 */
export function filterLogsByWindow(logs = [], days = 7) {
  if (!days || days === 'all') return logs
  const now = new Date()
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return logs.filter(l => {
    const d = new Date(l.measured_at || l.created_at)
    return !isNaN(d.getTime()) && d >= cutoff
  })
}

/**
 * Classify a glucose reading into category and color token
 */
export function classifyGlucose(value, targets = DEFAULT_TARGETS) {
  const v = Number(value)
  if (v < (targets.veryLow || 54)) {
    return {
      status: 'severe-low',
      label: 'Critical Low',
      labelHi: 'गंभीर कम',
      color: '#DC2626',
      badgeBg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
    }
  }
  if (v < (targets.low || 70)) {
    return {
      status: 'low',
      label: 'Low (Hypo)',
      labelHi: 'कम (हाइपो)',
      color: '#EF4444',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
    }
  }
  if (v <= (targets.high || 180)) {
    return {
      status: 'in-range',
      label: 'In Target',
      labelHi: 'लक्ष्य में',
      color: '#10B981',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    }
  }
  if (v <= (targets.veryHigh || 250)) {
    return {
      status: 'high',
      label: 'High (Hyper)',
      labelHi: 'उच्च (हाइपर)',
      color: '#F59E0B',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    }
  }
  return {
    status: 'severe-high',
    label: 'Critical High',
    labelHi: 'गंभीर उच्च',
    color: '#991B1B',
    badgeBg: 'bg-red-950/20 text-red-700 dark:text-red-300 border-red-700/30'
  }
}
