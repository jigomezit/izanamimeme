import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://blyxgnzpspvvyhpsszmq.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseXhnbnpwc3B2dnlocHNzem1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTI5MzMsImV4cCI6MjA2ODY2ODkzM30.3ooLopQDq4RUKR8T55qn5mu3Ay9OBwF8zh-DIKjgidc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

