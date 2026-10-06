'use client'

import { useMemo } from 'react'
import { Printer, ArrowLeft, ShieldCheck, HeartPulse } from 'lucide-react'
import { calculateAGPMetrics, formatGlucose, toMmol } from '@/lib/clinicalMetrics'

export default function DoctorReportView({
  logs = [],
  userEmail = 'Patient User',
  onClose,
  lang = 'en',
  unit = 'mg/dL',
  targets = { low: 70, high: 180 }
}) {
  const metrics = useMemo(() => {
    return calculateAGPMetrics(logs, targets)
  }, [logs, targets])

  const t = lang === 'hi' ? {
    back: 'वापस जाएं',
    print: 'रिपोर्ट प्रिंट या PDF सहेजें',
    reportTitle: 'एम्बुलेटरी ग्लूकोज प्रोफाइल (AGP) - क्लिनिकल रिपोर्ट',
    patient: 'मरीज आईडी / ईमेल:',
    dateGenerated: 'दिनांक:',
    targetRange: `लक्षित सीमा: ${targets.low}–${targets.high} ${unit}`,
    metricsSummary: 'AGP क्लिनिकल मेट्रिक्स सारांश',
    tirTitle: 'टाइम इन रेंज (TIR)',
    tirStandard: 'मानक: >70%',
    tbrTitle: 'टाइम बिलो रेंज (TBR / हाइपो)',
    tbrStandard: 'मानक: <4%',
    tarTitle: 'टाइम अबोव रेंज (TAR / हाइपर)',
    tarStandard: 'मानक: <25%',
    variabilityTitle: 'ग्लूकोज परिवर्तनशीलता (CV%)',
    variabilityStandard: 'मानक: ≤36%',
    doctorNotes: 'चिकित्सक / एंडोक्रिनोलॉजिस्ट टिप्पणी और सलाह',
    doctorNotesPlaceholder: 'आहार, इंसुलिन समायोजन और अगली समीक्षा के लिए क्लिनिकल नोट्स...'
  } : {
    back: 'Back to Dashboard',
    print: 'Print or Save as PDF',
    reportTitle: 'Ambulatory Glucose Profile (AGP) - Clinical Report',
    patient: 'Patient ID / Email:',
    dateGenerated: 'Generated On:',
    targetRange: `Target Range: ${targets.low}–${targets.high} ${unit}`,
    metricsSummary: 'AGP Clinical Metrics Summary',
    tirTitle: 'Time in Range (TIR: 70–180 mg/dL)',
    tirStandard: 'Clinical Target: >70%',
    tbrTitle: 'Time Below Range (TBR <70 mg/dL)',
    tbrStandard: 'Clinical Target: <4%',
    tarTitle: 'Time Above Range (TAR >180 mg/dL)',
    tarStandard: 'Clinical Target: <25%',
    variabilityTitle: 'Glucose Variability (CV%)',
    variabilityStandard: 'Clinical Target: ≤36%',
    doctorNotes: 'Physician / Endocrinologist Clinical Notes',
    doctorNotesPlaceholder: 'Physician observations, titration notes, and next follow-up...'
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top action bar (hidden in print) */}
      <div className="flex items-center justify-between gap-3 no-print">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="btn-teal px-5 py-2.5 text-xs flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>{t.print}</span>
        </button>
      </div>

      {/* Printable Clinical Sheet */}
      <div className="bg-white text-slate-900 rounded-[28px] border-2 border-slate-200 p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                G
              </div>
              <h1 className="font-black text-xl sm:text-2xl tracking-tight text-slate-900">
                GlucoPulse Medical AGP Summary
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Standardized Ambulatory Glucose Profile (ADA / EASD Consensus)
            </p>
          </div>

          <div className="text-xs text-slate-600 space-y-1 font-semibold sm:text-right">
            <div><strong>{t.patient}</strong> {userEmail}</div>
            <div><strong>{t.dateGenerated}</strong> {new Date().toLocaleDateString()}</div>
            <div className="text-teal-700 font-black">{t.targetRange}</div>
          </div>
        </div>

        {/* Primary AGP Metrics 4-Box Grid */}
        <div className="my-6">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            {t.metricsSummary}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-900">
              <div className="text-[11px] font-bold text-emerald-800 uppercase">{t.tirTitle}</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">{metrics.tir}%</div>
              <div className="text-[10px] font-semibold text-emerald-700 mt-1">{t.tirStandard}</div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-slate-900">
              <div className="text-[11px] font-bold text-rose-800 uppercase">{t.tbrTitle}</div>
              <div className="text-3xl font-black text-rose-600 mt-1">{metrics.tbr}%</div>
              <div className="text-[10px] font-semibold text-rose-700 mt-1">{t.tbrStandard}</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900">
              <div className="text-[11px] font-bold text-amber-800 uppercase">{t.tarTitle}</div>
              <div className="text-3xl font-black text-amber-600 mt-1">{metrics.tar}%</div>
              <div className="text-[10px] font-semibold text-amber-700 mt-1">{t.tarStandard}</div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-slate-900">
              <div className="text-[11px] font-bold text-blue-800 uppercase">{t.variabilityTitle}</div>
              <div className="text-3xl font-black text-blue-600 mt-1">{metrics.cv}%</div>
              <div className="text-[10px] font-semibold text-blue-700 mt-1">{t.variabilityStandard}</div>
            </div>
          </div>
        </div>

        {/* Clinical Statistics Table */}
        <div className="my-6 rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="p-3">Clinical Indicator</th>
                <th className="p-3">Patient Value</th>
                <th className="p-3">Clinical Consensus Goal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold">Average Glucose</td>
                <td className="p-3 font-black text-slate-900">{metrics.mean} {unit}</td>
                <td className="p-3 text-slate-500">&lt; 154 mg/dL (~7.0% A1c)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Estimated HbA1c (eA1c)</td>
                <td className="p-3 font-black text-slate-900">{metrics.eA1c}%</td>
                <td className="p-3 text-slate-500">&lt; 7.0% (individualized)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Glucose Management Indicator (GMI)</td>
                <td className="p-3 font-black text-slate-900">{metrics.gmi}%</td>
                <td className="p-3 text-slate-500">&lt; 7.0%</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Standard Deviation (SD)</td>
                <td className="p-3 font-black text-slate-900">±{metrics.sd} {unit}</td>
                <td className="p-3 text-slate-500">Lower is better</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Total Glucose Readings Logged</td>
                <td className="p-3 font-black text-slate-900">{metrics.count} readings</td>
                <td className="p-3 text-slate-500">Regular testing recommended</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Doctor Impressions & Signature Space */}
        <div className="my-6 pt-4 border-t-2 border-slate-200">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2">
            {t.doctorNotes}
          </h3>
          <div className="h-32 rounded-2xl border border-dashed border-slate-300 p-4 text-xs text-slate-400 italic">
            {t.doctorNotesPlaceholder}
          </div>

          <div className="flex justify-between items-end mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500">
            <div>
              <p>GlucoPulse v2.5 Health Suite</p>
              <p className="text-[10px] text-slate-400">Not intended as primary medical diagnosis. Consult your licensed healthcare provider.</p>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-slate-400 mb-1"></div>
              <p className="font-bold">Physician Signature & Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
