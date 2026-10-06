'use client'

import { useState } from 'react'
import {
  User,
  Moon,
  Sun,
  Sliders,
  Shield,
  FileSpreadsheet,
  LogOut,
  Mail,
  CheckCircle,
  ExternalLink,
  Laptop
} from 'lucide-react'

export default function ProfileSettings({
  user,
  backendReady,
  onSignIn,
  onSignOut,
  targets = { low: 70, high: 180 },
  onUpdateTargets,
  unit = 'mg/dL',
  onUpdateUnit,
  darkMode = false,
  onToggleDarkMode,
  lang = 'en',
  onUpdateLang,
  sheetId = '',
  busy = false,
  message = ''
}) {
  const [email, setEmail] = useState('')
  const [tempLow, setTempLow] = useState(targets.low || 70)
  const [tempHigh, setTempHigh] = useState(targets.high || 180)
  const [targetSaved, setTargetSaved] = useState(false)

  const t = lang === 'hi' ? {
    title: 'प्रोफ़ाइल और सेटिंग्स',
    account: 'खाता और क्लाउड सिंक',
    signedInAs: 'लॉग इन किया गया ईमेल:',
    logout: 'लॉगआउट',
    enterEmail: 'मैजिक लिंक प्राप्त करने के लिए ईमेल दर्ज करें',
    sendLink: 'मैजिक लिंक भेजें',
    offlineNote: 'आप बिना लॉगिन के भी डेटा स्थानीय रूप से सहेज सकते हैं।',
    theme: 'डिस्प्ले और थीम',
    dark: 'डार्क मोड',
    light: 'लाइट मोड',
    unitTitle: 'ग्लूकोज इकाई',
    targetsTitle: 'व्यक्तिगत ग्लूकोज लक्ष्य सीमा',
    targetLow: 'न्यूनतम लक्ष्य (हाइपो सीमा)',
    targetHigh: 'अधिकतम लक्ष्य (हाइपर सीमा)',
    saveTargets: 'लक्ष्य सीमा सहेजें',
    targetsSavedMsg: 'लक्ष्य सीमा अपडेट कर दी गई!',
    backup: 'Google Sheet बैकअप',
    openSheet: 'Google Sheet खोलें'
  } : {
    title: 'Profile & App Settings',
    account: 'Account & Cloud Sync',
    signedInAs: 'Signed in as:',
    logout: 'Sign Out',
    enterEmail: 'Enter your email for passwordless Magic Link',
    sendLink: 'Send Magic Link',
    offlineNote: 'You can use the app fully offline. Sign in to sync across devices.',
    theme: 'Appearance & Theme',
    dark: 'Dark Mode',
    light: 'Light Mode',
    unitTitle: 'Glucose Unit',
    targetsTitle: 'Custom Target Range',
    targetLow: 'Target Low (Hypo Threshold)',
    targetHigh: 'Target High (Hyper Threshold)',
    saveTargets: 'Save Target Range',
    targetsSavedMsg: 'Target ranges updated!',
    backup: 'Google Sheet Backup',
    openSheet: 'Open Google Sheet'
  }

  function handleSaveTargets() {
    onUpdateTargets({
      low: Number(tempLow),
      high: Number(tempHigh)
    })
    setTargetSaved(true)
    setTimeout(() => setTargetSaved(false), 3000)
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* 1. Account / Cloud Sync Card */}
      <section className="card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
          <User className="w-5 h-5" />
          <h2 className="font-black text-lg text-slate-900 dark:text-slate-100">{t.account}</h2>
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400 font-bold">{t.signedInAs}</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 break-all mt-1">
                {user.email}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Supabase Live Connected</span>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="w-full h-12 rounded-2xl border border-rose-300 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">{t.enterEmail}</p>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-12 pl-10 pr-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm outline-none focus:border-teal-500"
              />
            </div>

            <button
              disabled={busy || !backendReady}
              onClick={() => onSignIn(email)}
              className="btn-teal w-full h-12 text-xs flex items-center justify-center gap-2"
            >
              <span>{busy ? '...' : t.sendLink}</span>
            </button>

            <p className="text-[11px] text-slate-400 leading-relaxed">{t.offlineNote}</p>
          </div>
        )}
      </section>

      {/* 2. Preferences & Target Ranges */}
      <section className="card p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
          <Sliders className="w-5 h-5" />
          <h2 className="font-black text-lg text-slate-900 dark:text-slate-100">{t.theme}</h2>
        </div>

        {/* Theme & Unit Selectors */}
        <div className="grid grid-cols-2 gap-3">
          {/* Dark / Light Toggle */}
          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Theme
            </span>
            <button
              onClick={onToggleDarkMode}
              className="w-full h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              <span>{darkMode ? t.light : t.dark}</span>
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {t.unitTitle}
            </span>
            <div className="grid grid-cols-2 gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => onUpdateUnit('mg/dL')}
                className={`h-8 rounded-lg text-xs font-black transition ${
                  unit === 'mg/dL' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm' : 'text-slate-500'
                }`}
              >
                mg/dL
              </button>
              <button
                onClick={() => onUpdateUnit('mmol/L')}
                className={`h-8 rounded-lg text-xs font-black transition ${
                  unit === 'mmol/L' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm' : 'text-slate-500'
                }`}
              >
                mmol/L
              </button>
            </div>
          </div>
        </div>

        {/* Target Range Customization */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-3">
          <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
            {t.targetsTitle} ({unit})
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400">{t.targetLow}</label>
              <input
                type="number"
                min="50"
                max="120"
                value={tempLow}
                onChange={e => setTempLow(e.target.value)}
                className="mt-1 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-black outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400">{t.targetHigh}</label>
              <input
                type="number"
                min="130"
                max="300"
                value={tempHigh}
                onChange={e => setTempHigh(e.target.value)}
                className="mt-1 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm font-black outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <button
            onClick={handleSaveTargets}
            className="w-full h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition"
          >
            {targetSaved ? `✓ ${t.targetsSavedMsg}` : t.saveTargets}
          </button>
        </div>

        {/* Google Sheet Backup Link */}
        {sheetId && (
          <div className="pt-2">
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit`}
              className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-teal-500 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{t.openSheet}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        )}
      </section>
    </div>
  )
}
