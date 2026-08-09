import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nvnhdnqkcmhzcppvkxqw.supabase.co'
const supabaseAnonKey = 'sb_publishable_ucvw91rUOZRmwgTAR55nxQ_gu100s9l'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
