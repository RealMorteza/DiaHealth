import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ccqqtddvvltfqqfjgwdh.supabase.co' 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcXF0ZGR2dmx0ZnFxZmpnd2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjIzMzYsImV4cCI6MjA3MjYzODMzNn0.bZzVBTdkV-n0TGk0FK1nizfOi5nYMUhDFXLwJRpzQlk' // جایگزین API key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)   