
# GlucoPulse - Next.js + Supabase (Teal Lime Clean)

Clean light UI from your attached image, Hindi toggle, Supabase as primary DB, Google Sheet as export backup.

## 1. Setup Supabase (Free)
1. Go to supabase.com → New Project
2. SQL Editor → Paste `supabase/schema.sql` → Run
3. Auth → Enable Email OTP (or Google)
4. Settings → API → Copy URL + ANON_KEY

## 2. Setup Local
```bash
git clone https://github.com/sheevu/Diabetes-tracker.git
cd Diabetes-tracker
npm install
cp .env.example .env.local
# Fill .env.local with Supabase URL + ANON_KEY + optional GSHEET_WEBAPP_URL
npm run dev
```

## 3. Push to GitHub
```bash
git add .
git commit -m "feat: migrate to Next.js + Supabase, teal-lime clean UI, Hindi, GSheet export"
git push origin main
```

## 4. Deploy on Vercel (1 click, free)
- Import github.com/sheevu/Diabetes-tracker on vercel.com
- Add env vars (same as .env.local)
- Deploy → live URL

## 5. Keep Supabase awake (free tier pauses after 7 days idle)
- Vercel Cron or UptimeRobot ping your site every 6 days: GET https://your-app.vercel.app/api/ping

## Google Sheet Backup
Your old Sheet ID `19bbtQprtEFeshiCh-X_eAQf2V8LNWupxebdIwQSkoW0` still works for Export.
Apps Script fixed code is in old build, use text/plain POST.

Env:
```
NEXT_PUBLIC_GSHEET_WEBAPP_URL=https://script.google.com/macros/s/YOUR_ID/exec
```
