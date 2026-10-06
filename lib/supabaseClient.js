
import { createClient } from '@supabase/supabase-js'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if(!url || !anon) console.warn('Set Supabase env vars in .env.local')
export const supabase = createClient(url, anon)
