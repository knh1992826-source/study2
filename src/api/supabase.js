import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// .env가 비어 있어도 화면이 죽지 않도록 placeholder 사용
export const supabase = createClient(url || 'http://localhost:54321', key || 'missing-key')
