'use client'

import { useState, useMemo } from 'react'
import {
  Sparkles,
  Search,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Shield,
  Bot
} from 'lucide-react'
import {
  analyzeReadingsLocally,
  searchFaqChatbot,
  FAQ_CHATBOT_DB
} from '@/lib/knowledgeBase'

const PROMPT_SUGGESTIONS = [
  { en: 'normal sugar?', hi: 'सामान्य शुगर?' },
  { en: 'rice high?', hi: 'चावल से क्यों बढ़ती?' },
  { en: 'low symptoms', hi: 'लो शुगर लक्षण' },
  { en: 'best breakfast', hi: 'बेस्ट नाश्ता' },
  { en: 'millet vs wheat', hi: 'मिलेट vs गेहूं' },
  { en: 'stress raises sugar?', hi: 'तनाव से शुगर?' }
]

export default function LocalAiFaqAssistant({ logs = [], lang = 'en' }) {
  const [query, setQuery] = useState('')

  const t = lang === 'hi' ? {
    aiTitle: 'लोकल AI क्लिनिकल अंतर्दृष्टि (12 नियम)',
    aiSubtitle: 'बिना किसी बाहरी API के आपके डेटा पर आधारित तत्काल नियम विश्लेषण',
    faqTitle: 'ऑफलाइन क्लिनिकल चैटबॉट (22 FAQs)',
    faqSubtitle: 'कीवर्ड स्कोरिंग • 100% स्थानीय और निजी',
    searchPlaceholder: 'पूछें: सामान्य शुगर, चावल, लो लक्षण, फल...',
    noRulesYet: 'कम से कम 3-5 रीडिंग दर्ज करें ताकि पैटर्न और नियम सक्रिय हो सकें।',
    triggeredBadge: 'स्थानीय विश्लेषण सक्रिय',
    askSuggestions: 'सुझाए गए प्रश्न:'
  } : {
    aiTitle: 'Local AI Clinical Pattern Engine',
    aiSubtitle: 'Autonomous 12-rule clinical engine evaluated 100% locally on your readings',
    faqTitle: 'Offline Clinical Assistant (22 FAQs)',
    faqSubtitle: 'Instant keyword scoring • Zero API calls • 100% Private',
    searchPlaceholder: 'Ask: normal sugar, rice, hypo symptoms, fruits...',
    noRulesYet: 'Log at least 3-5 readings (fasting & post-meal) to activate trained pattern rules.',
    triggeredBadge: 'Triggered Locally',
    askSuggestions: 'Quick Prompts:'
  }

  // Run local AI rules analysis on the logs
  const aiAnalysis = useMemo(() => {
    return analyzeReadingsLocally(logs)
  }, [logs])

  // Run local FAQ search
  const matchedFaqs = useMemo(() => {
    return searchFaqChatbot(query)
  }, [query])

  return (
    <div className="space-y-6">
      {/* 1. Proactive Clinical Rules Insights */}
      <section className="card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100">
              {t.aiTitle}
            </h2>
            <p className="text-xs text-slate-400 font-semibold">{t.aiSubtitle}</p>
          </div>
        </div>

        {aiAnalysis.insights.length === 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-500 font-semibold flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
            <span>{t.noRulesYet}</span>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {aiAnalysis.insights.map(rule => {
              const isAlert = rule.severity === 'alert'
              const isWarn = rule.severity === 'warn'
              const bg = isAlert
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/80 text-rose-950 dark:text-rose-100'
                : isWarn
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/80 text-amber-950 dark:text-amber-100'
                : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/80 text-teal-950 dark:text-teal-100'

              return (
                <div key={rule.id} className={`p-4 rounded-2xl border-2 ${bg} space-y-2`}>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-black text-sm">
                      {lang === 'hi' ? rule.trigger_hi : rule.trigger_en}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border shadow-xs">
                      {t.triggeredBadge}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {lang === 'hi' ? rule.advice_hi : rule.advice_en}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 2. Offline FAQ Chatbot */}
      <section className="card p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100">
              {t.faqTitle}
            </h2>
            <p className="text-xs text-slate-400 font-semibold">{t.faqSubtitle}</p>
          </div>
        </div>

        {/* Search input with clear button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full h-12 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs sm:text-sm outline-none focus:border-teal-500 text-slate-900 dark:text-slate-100"
            />
          </div>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 self-center">
            {t.askSuggestions}
          </span>
          {PROMPT_SUGGESTIONS.map(p => (
            <button
              key={p.en}
              onClick={() => setQuery(p.en)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
            >
              {lang === 'hi' ? p.hi : p.en}
            </button>
          ))}
        </div>

        {/* Matching FAQ Cards */}
        <div className="space-y-3 pt-2">
          {matchedFaqs.map(faq => (
            <div
              key={faq.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-2 hover:border-indigo-400 transition"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-black text-xs grid place-items-center shrink-0 mt-0.5">
                  ?
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {lang === 'hi' ? faq.q_hi : faq.q_en}
                </h4>
              </div>

              <div className="ml-7.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                {lang === 'hi' ? faq.a_hi : faq.a_en}
              </div>

              <div className="flex gap-1.5 flex-wrap ml-7.5 pt-1">
                {faq.keywords.slice(0, 4).map(k => (
                  <span
                    key={k}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400"
                  >
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
