'use client'

import { useState, useMemo } from 'react'
import {
  Utensils,
  Search,
  Sparkles,
  Info,
  ChevronRight,
  Flame,
  PlusCircle,
  Apple
} from 'lucide-react'
import { INDIAN_FOODS_DB, searchIndianFoods } from '@/lib/knowledgeBase'

const CATEGORIES = [
  { id: 'all', en: 'All Foods', hi: 'सभी' },
  { id: 'staple', en: 'Staples & Rotis', hi: 'रोटी व मुख्य' },
  { id: 'protein', en: 'Dals & Veggies', hi: 'दाल व सब्जी' },
  { id: 'fruit', en: 'Fruits', hi: 'फल' },
  { id: 'snack', en: 'Snacks', hi: 'स्नैक्स' },
  { id: 'sweet', en: 'Sweets', hi: 'मिठाई' }
]

export default function IndianFoodExplorer({
  onSelectFoodCarbs,
  lang = 'en'
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')

  const t = lang === 'hi' ? {
    title: '63 भारतीय खाद्य पदार्थ और कार्ब गाइड',
    subtitle: 'ग्लाइसेमिक इंडेक्स (GI), कार्ब्स और मधुमेह सुझाव (100% ऑफलाइन)',
    searchPlaceholder: 'रोटी, चावल, दाल, फल या नाश्ता खोजें...',
    portion: 'मात्रा',
    carbs: 'कार्ब्स',
    gi: 'GI',
    fiber: 'फाइबर',
    useCarbs: '+ लॉग में जोड़ें',
    empty: 'कोई खाद्य पदार्थ नहीं मिला'
  } : {
    title: '63 Indian Foods & Carb Database',
    subtitle: 'Glycemic Index (GI), net carbs, and clinical meal tips (100% Offline)',
    searchPlaceholder: 'Search roti, rice, dal, fruit, or snack...',
    portion: 'Portion',
    carbs: 'Carbs',
    gi: 'GI',
    fiber: 'Fiber',
    useCarbs: '+ Use in Log',
    empty: 'No matching foods found'
  }

  const filteredFoods = useMemo(() => {
    let result = searchIndianFoods(searchTerm)
    if (selectedCat !== 'all') {
      result = result.filter(f => f.category === selectedCat)
    }
    return result
  }, [searchTerm, selectedCat])

  return (
    <div className="card p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100">
              {t.title}
            </h2>
            <p className="text-xs text-slate-400 font-semibold">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs sm:text-sm outline-none focus:border-teal-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Categories */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/60 text-xs font-bold overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCat === c.id
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {lang === 'hi' ? c.hi : c.en}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {filteredFoods.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm font-semibold">
            {t.empty}
          </div>
        ) : (
          filteredFoods.map(food => {
            const isHighGi = food.gi >= 70
            const isLowGi = food.gi <= 55
            const giBadgeColor = isLowGi
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
              : isHighGi
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'

            return (
              <div
                key={food.id}
                className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-teal-500/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
                        {food.en}
                      </h4>
                      <p className="text-xs text-slate-400 font-bold">{food.hi}</p>
                    </div>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${giBadgeColor}`}>
                      GI {food.gi}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {food.portion}
                    </span>
                    <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md">
                      🍞 {food.carbs}g carbs
                    </span>
                    {food.fiber > 0 && (
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                        🌱 {food.fiber}g fiber
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    💡 {lang === 'hi' ? food.tip_hi : food.tip_en}
                  </p>
                </div>

                {onSelectFoodCarbs && (
                  <button
                    onClick={() => onSelectFoodCarbs(food)}
                    className="w-full py-2 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t.useCarbs}</span>
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
