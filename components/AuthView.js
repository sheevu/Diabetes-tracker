'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  User,
  Mail,
  ArrowRight,
  Sparkles,
  Database,
  CheckCircle2,
  Lock,
  Zap,
  Globe2
} from 'lucide-react'

export default function AuthView({
  onGuestLogin,
  onEmailLogin,
  onLoadDemoData,
  busy = false,
  message = '',
  lang = 'en'
}) {
  const [email, setEmail] = useState('')
  const [activeTab, setActiveTab] = useState('guest') // 'guest' | 'email'

  const t = lang === 'hi' ? {
    welcome: 'GlucoPulse में आपका स्वागत है',
    tagline: 'सटीक, सुरक्षित और स्थानीय डायबिटीज प्रबंधन सुइट',
    guestTitle: 'अतिथि (Guest) के रूप में जारी रखें',
    guestDesc: 'कोई ईमेल या पासवर्ड की आवश्यकता नहीं। सारा डेटा सुरक्षित रूप से आपके डिवाइस पर सेव रहेगा और 100% ऑफलाइन काम करेगा।',
    guestBtn: 'अतिथि के रूप में शुरू करें',
    emailTitle: 'ईमेल मैजिक लिंक से लॉगिन करें',
    emailDesc: 'क्लाउड बैकअप और अन्य डिवाइस पर सिंक करने के लिए पासवर्डलेस मैजिक लिंक प्राप्त करें।',
    emailPlaceholder: 'अपना ईमेल पता दर्ज करें...',
    emailBtn: 'मैजिक लिंक भेजें',
    demoBtn: '14 दिन का डेमो डेटा लोड करें (तुरंत पूर्वावलोकन)',
    privacyBadge: '100% डेटा गोपनीयता • ऑफलाइन-प्रथम • सुरक्षित',
    switchGuest: 'अतिथि मोड',
    switchEmail: 'क्लाउड सिंक'
  } : {
    welcome: 'Welcome to GlucoPulse',
    tagline: 'Precision, Privacy-First Diabetes Management Suite',
    guestTitle: 'Continue as Guest',
    guestDesc: 'No email or password needed. All your readings are encrypted and saved right on your device with 100% offline access.',
    guestBtn: 'Enter as Guest',
    emailTitle: 'Sign in with Magic Link',
    emailDesc: 'Passwordless login to securely synchronize your health logs across all your devices using Supabase cloud.',
    emailPlaceholder: 'Enter your email address...',
    emailBtn: 'Send Magic Link',
    demoBtn: '⚡ Load 14-Day Sample Clinical Data',
    privacyBadge: '100% Private • Offline Ready • ADA Standards',
    switchGuest: 'Guest Mode',
    switchEmail: 'Cloud Sync'
  }

  function handleEmailSubmit(e) {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    onEmailLogin(email)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0E172C] rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-teal-600 to-teal-400 text-white font-black text-2xl shadow-lg shadow-teal-500/25 mx-auto">
            G
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {t.welcome}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
            {t.tagline}
          </p>
        </div>

        {/* Tab Switcher: Guest vs Cloud */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`h-11 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'guest'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.switchGuest}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`h-11 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'email'
                ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{t.switchEmail}</span>
          </button>
        </div>

        {/* Notification / Toast */}
        {message && (
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-200 text-center animate-pop">
            {message}
          </div>
        )}

        {/* Panel 1: Guest Mode */}
        {activeTab === 'guest' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-slate-100 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{t.guestTitle}</span>
              </div>
              <p>{t.guestDesc}</p>
            </div>

            <button
              onClick={onGuestLogin}
              className="btn-lime w-full h-14 text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg"
            >
              <span>{t.guestBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Panel 2: Email Magic Link */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {t.emailDesc}
            </p>

            <div className="relative">
              <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full h-13 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-sm outline-none focus:border-teal-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-teal w-full h-13 text-sm flex items-center justify-center gap-2"
            >
              <span>{busy ? '...' : t.emailBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Demo Data Quick-Start Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onLoadDemoData}
            className="w-full py-3 px-4 rounded-2xl border border-dashed border-teal-300 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-black flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>{t.demoBtn}</span>
          </button>
        </div>

        {/* Security & Feature Badges */}
        <div className="pt-1 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t.privacyBadge}</span>
        </div>
      </div>
    </div>
  )
}
