import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ 请替换为你自己的 Supabase 项目信息
// 你可以在 Supabase Dashboard -> Project Settings -> API 中找到
const SUPABASE_URL = 'https://pafxbructegrqzrpjlnr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZnhicnVjdGVncnF6cnBqbG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTc2NjUsImV4cCI6MjA3OTg3MzY2NX0.hDzQmKqEpSiapNfRpNjw_lWCD3_PvYK9FVu_g_w9Bys';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

