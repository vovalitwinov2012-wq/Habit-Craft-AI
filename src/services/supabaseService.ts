import { supabase } from "@/integrations/supabase/client";
import { getClientId } from "@/lib/clientId";

type Habit = any;

const STORAGE_KEY = "habitcraft_habits";

export async function loadHabits(): Promise<Habit[]> {
  const owner = getClientId();
  try {
    const { data, error } = await supabase.from('habits').select('*').eq('owner', owner).order('created_at', { ascending: true });
    if (error) {
      console.error('supabase loadHabits error', error);
      throw error;
    }
    if (!data) return [];
    // map to frontend shape
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      quote: d.quote,
      color: d.color || '#6366F1',
      completedDays: d.completed_days || 0,
      totalDays: d.total_days || 1,
      completedDates: d.completed_dates || [],
      category: d.category,
      goal: d.goal,
      reminder: d.reminder,
      createdAt: d.created_at
    }));
  } catch (e) {
    console.warn('loadHabits fallback to localStorage', e);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_){
      return [];
    }
  }
}

export async function saveHabits(habits: Habit[]) {
  const owner = getClientId();
  const rows = habits.map(h => ({
    id: h.id,
    owner,
    title: h.title,
    quote: h.quote || null,
    color: h.color || null,
    completed_days: h.completedDays || 0,
    total_days: h.totalDays || 1,
    completed_dates: h.completedDates || [],
    category: h.category || null,
    goal: h.goal || null,
    reminder: h.reminder || null,
    created_at: h.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
  try {
    const { data, error } = await supabase.from('habits').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error('supabase saveHabits error', error);
      throw error;
    }
    // cache locally for offline
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); } catch {}
    return data;
  } catch (e) {
    console.warn('saveHabits fallback to localStorage', e);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(habits)); } catch {}
    return null;
  }
}
