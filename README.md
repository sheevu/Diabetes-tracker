# GlucoPulse PRO - Precision Diabetes & Glucose Management Suite

A modern, clinical-grade, offline-first diabetes tracking and analytics web application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Supabase**.

---

## 🌟 Key Features

1. **Ambulatory Glucose Profile (AGP) Analytics**:
   - Time in Range (TIR % with ADA target >70%).
   - Time Below Range (TBR % <70 and <54 mg/dL Level 2 Hypoglycemia).
   - Time Above Range (TAR % >180 and >250 mg/dL).
   - Estimated HbA1c ($eA1c$) and Glucose Management Indicator (GMI %).
   - Glycemic Variability ($CV\% \le 36\%$) and Standard Deviation (SD).

2. **Interactive Trend Visualizer**:
   - Responsive Recharts area/line chart with target corridor shading (70–180 mg/dL).
   - Dynamic status dots (Red = Hypo, Green = In Range, Amber = Hyper).
   - Hover tooltips with carbs, insulin, and meal notes.
   - Time range switchers (24h, 7D, 14D, 30D, and All).

3. **Life-Saving "Rule of 15" Hypo Safety Protocol**:
   - Proactive alert banner for readings $<70$ mg/dL (or $<54$ mg/dL critical).
   - 3-step clinical action protocol (15g fast carbs $\rightarrow$ 15 min rest $\rightarrow$ re-test).
   - Integrated 15-minute countdown timer with push notification.

4. **63 Indian Foods & Carb Database**:
   - Curated database of staple Indian foods (Roti, Bajra/Jowar/Ragi, Rice, Dals, Poha, Thepla, Paneer, Karela, Fruits, and Sweets).
   - Net carbohydrates (g), Glycemic Index (GI), Fiber (g), and clinical meal tips in English & Hindi.
   - 1-click carb transfer to the quick-log form.

5. **Local AI Rules Engine & 22 Clinical FAQs**:
   - 12 autonomous clinical pattern rules evaluated locally (0 external API calls).
   - 22 bilingual clinical FAQs with keyword search.

6. **Logbook with In-Place Edit & Delete**:
   - Real-time search across notes and meal types.
   - Filter pills (All, In Target, Hypo, Hyper).
   - Edit and delete past readings with two-way Supabase / localStorage sync.

7. **Doctor-Ready AGP Clinical Printable Report**:
   - Formatted clinical sheet ready to print or export as PDF for endocrinologists.

8. **User Authentication & Guest Mode**:
   - Instant 1-click **Guest Mode** (100% offline, zero setup).
   - **Email Magic Link (Supabase OTP)** for cloud sync.
   - Preload 14-day sample clinical data for instant exploration.

9. **OLED Dark Mode & Dual Units**:
   - Instant toggle between Light Mode and OLED Dark Mode.
   - Real-time conversion between `mg/dL` and `mmol/L`.

---

## 🚀 Getting Started

### Local Development
```bash
git clone https://github.com/sheevu/Diabetes-tracker.git
cd Diabetes-tracker
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Configuration (Optional for Cloud Sync)
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GSHEET_ID=19bbtQprtEFeshiCh-X_eAQf2V8LNWupxebdIwQSkoW0
```

---

## ☁️ Deploy to Vercel (1-Click)

1. Push your changes to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository: `sheevu/Diabetes-tracker`.
3. (Optional) Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**.
