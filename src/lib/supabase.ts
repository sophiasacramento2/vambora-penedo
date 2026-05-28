import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Para desenvolvimento sem travar o app caso as variáveis não estejam setadas de imediato
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente Supabase não configuradas em .env.local.')
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
