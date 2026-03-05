import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// Helper to get current user id
async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// ==================== HENS ====================

export async function getHens() {
  const { data, error } = await supabase.from('hens').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createHen(henData: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('hens').insert({ ...henData, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateHen(id: string, henData: any) {
  const { data, error } = await supabase.from('hens').update(henData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHen(id: string) {
  const { error } = await supabase.from('hens').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getHenProfile(id: string) {
  const { data: hen, error } = await supabase.from('hens').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  const { data: healthLogs } = await supabase.from('health_logs').select('*').eq('hen_id', id).order('date', { ascending: false });
  return { ...hen, health_logs: healthLogs || [] };
}

// ==================== EGGS ====================

export async function getEggs() {
  const { data, error } = await supabase.from('egg_logs').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createEggRecord(record: { date: string; count: number; notes?: string; hen_id?: string }) {
  const userId = await getUserId();
  const insertData: any = { date: record.date, count: record.count, user_id: userId };
  if (record.notes) insertData.notes = record.notes;
  if (record.hen_id) insertData.hen_id = record.hen_id;
  const { data, error } = await supabase.from('egg_logs').insert(insertData).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEggRecord(id: string) {
  const { error } = await supabase.from('egg_logs').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ==================== FEED ====================

export async function getFeedRecords() {
  const { data, error } = await supabase.from('feed_records').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createFeedRecord(record: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('feed_records').insert({ ...record, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFeedRecord(id: string) {
  const { error } = await supabase.from('feed_records').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getFeedInventory() {
  const { data, error } = await supabase.from('feed_records').select('*').order('date', { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  const totalKg = (data || []).reduce((sum, r) => sum + (r.amount_kg || 0), 0);
  return { total_kg: totalKg, records: data };
}

export async function getFeedStatistics() {
  const { data, error } = await supabase.from('feed_records').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  const totalCost = (data || []).reduce((sum, r) => sum + (r.cost || 0), 0);
  const totalKg = (data || []).reduce((sum, r) => sum + (r.amount_kg || 0), 0);
  return { total_cost: totalCost, total_kg: totalKg, record_count: (data || []).length };
}

// ==================== HATCHING ====================

export async function getHatchings() {
  const { data, error } = await supabase.from('hatchings').select('*').order('start_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createHatching(record: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('hatchings').insert({ ...record, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateHatching(id: string, record: any) {
  const { data, error } = await supabase.from('hatchings').update(record).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHatching(id: string) {
  const { error } = await supabase.from('hatchings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getHatchingAlerts() {
  const { data, error } = await supabase.from('hatchings').select('*').eq('status', 'incubating');
  if (error) throw new Error(error.message);
  const today = new Date();
  return (data || []).filter(h => {
    if (!h.expected_hatch_date) return false;
    const diff = Math.ceil((new Date(h.expected_hatch_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 3 && diff >= 0;
  }).map(h => ({ ...h, days_remaining: Math.ceil((new Date(h.expected_hatch_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) }));
}

// ==================== TRANSACTIONS ====================

export async function getTransactions() {
  const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createTransaction(record: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('transactions').insert({ ...record, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ==================== HEALTH LOGS ====================

export async function getHealthLogs() {
  const { data, error } = await supabase.from('health_logs').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createHealthLog(record: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('health_logs').insert({ ...record, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getHenHealthLogs(henId: string) {
  const { data, error } = await supabase.from('health_logs').select('*').eq('hen_id', henId).order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

// ==================== FEEDBACK ====================

export async function submitFeedback(feedbackData: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('feedback').insert({ ...feedbackData, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ==================== DAILY CHORES ====================

export async function getDailyChores() {
  const userId = await getUserId();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: chores, error } = await supabase
    .from('daily_chores')
    .select('*')
    .order('sort_order');
  if (error) throw new Error(error.message);

  const { data: completions } = await supabase
    .from('chore_completions')
    .select('chore_id')
    .eq('completed_date', today);

  const completedIds = new Set((completions || []).map(c => c.chore_id));
  return (chores || []).map(c => ({ ...c, completed: completedIds.has(c.id) }));
}

export async function completeChore(choreId: string) {
  const userId = await getUserId();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { error } = await supabase.from('chore_completions').insert({ chore_id: choreId, user_id: userId, completed_date: today });
  if (error) throw new Error(error.message);
}

export async function uncompleteChore(choreId: string) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { error } = await supabase.from('chore_completions').delete().eq('chore_id', choreId).eq('completed_date', today);
  if (error) throw new Error(error.message);
}

// ==================== COOP SETTINGS ====================

export async function getCoopSettings() {
  const userId = await getUserId();
  const { data, error } = await supabase.from('coop_settings').select('*').eq('user_id', userId).single();
  if (error && error.code === 'PGRST116') {
    // No settings yet, create default
    const { data: newData, error: insertError } = await supabase
      .from('coop_settings')
      .insert({ user_id: userId })
      .select()
      .single();
    if (insertError) throw new Error(insertError.message);
    return newData;
  }
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCoopSettings(settings: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('coop_settings').update(settings).eq('user_id', userId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ==================== FLOCKS ====================

export async function getFlocks() {
  const { data, error } = await supabase.from('flocks').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function createFlock(flockData: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('flocks').insert({ ...flockData, user_id: userId }).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateFlock(id: string, flockData: any) {
  const { data, error } = await supabase.from('flocks').update(flockData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFlock(id: string) {
  const { error } = await supabase.from('flocks').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ==================== REMINDER SETTINGS ====================

export async function getReminderSettings() {
  const userId = await getUserId();
  const { data, error } = await supabase.from('reminder_settings').select('*').eq('user_id', userId).single();
  if (error && error.code === 'PGRST116') {
    const { data: newData, error: insertError } = await supabase
      .from('reminder_settings')
      .insert({ user_id: userId })
      .select()
      .single();
    if (insertError) throw new Error(insertError.message);
    return newData;
  }
  if (error) throw new Error(error.message);
  return data;
}

export async function updateReminderSettings(settings: any) {
  const userId = await getUserId();
  const { data, error } = await supabase.from('reminder_settings').update(settings).eq('user_id', userId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// ==================== STATISTICS (computed client-side) ====================

export async function getTodayStats() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [eggs, hens, feed] = await Promise.all([
    supabase.from('egg_logs').select('count').eq('date', today),
    supabase.from('hens').select('id').eq('is_active', true),
    supabase.from('feed_records').select('amount_kg, cost').eq('date', today),
  ]);
  const eggCount = (eggs.data || []).reduce((s, r) => s + r.count, 0);
  const henCount = (hens.data || []).length;
  const feedKg = (feed.data || []).reduce((s, r) => s + (r.amount_kg || 0), 0);
  const feedCost = (feed.data || []).reduce((s, r) => s + (r.cost || 0), 0);
  return { eggs: eggCount, hens: henCount, feed_kg: feedKg, feed_cost: feedCost, date: today };
}

export async function getMonthStats(year: number, month: number) {
  const start = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
  const end = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
  const { data: eggs } = await supabase.from('egg_logs').select('*').gte('date', start).lte('date', end).order('date');
  const { data: feed } = await supabase.from('feed_records').select('*').gte('date', start).lte('date', end);
  const { data: txns } = await supabase.from('transactions').select('*').gte('date', start).lte('date', end);
  return {
    eggs: eggs || [],
    feed: feed || [],
    transactions: txns || [],
    total_eggs: (eggs || []).reduce((s, r) => s + r.count, 0),
    total_feed_cost: (feed || []).reduce((s, r) => s + (r.cost || 0), 0),
  };
}

export async function getYearStats(year: number) {
  const start = format(startOfYear(new Date(year, 0)), 'yyyy-MM-dd');
  const end = format(endOfYear(new Date(year, 0)), 'yyyy-MM-dd');
  const { data: eggs } = await supabase.from('egg_logs').select('*').gte('date', start).lte('date', end);
  const { data: txns } = await supabase.from('transactions').select('*').gte('date', start).lte('date', end);
  return {
    total_eggs: (eggs || []).reduce((s, r) => s + r.count, 0),
    transactions: txns || [],
    monthly_eggs: eggs || [],
  };
}

export async function getSummaryStats() {
  const [eggs, hens, txns] = await Promise.all([
    supabase.from('egg_logs').select('count, date'),
    supabase.from('hens').select('id').eq('is_active', true),
    supabase.from('transactions').select('amount, type'),
  ]);
  const totalEggs = (eggs.data || []).reduce((s, r) => s + r.count, 0);
  const income = (txns.data || []).filter(t => t.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expense = (txns.data || []).filter(t => t.type === 'expense').reduce((s, r) => s + r.amount, 0);
  return { total_eggs: totalEggs, active_hens: (hens.data || []).length, total_income: income, total_expense: expense, profit: income - expense };
}

export async function getYesterdaySummary() {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const { data: eggs } = await supabase.from('egg_logs').select('count').eq('date', yesterday);
  const eggCount = (eggs || []).reduce((s, r) => s + r.count, 0);
  return { date: yesterday, eggs: eggCount };
}

export async function getFarmToday() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [eggs, hens, chores] = await Promise.all([
    supabase.from('egg_logs').select('count').eq('date', today),
    supabase.from('hens').select('id, name').eq('is_active', true),
    getDailyChores(),
  ]);
  return {
    eggs_today: (eggs.data || []).reduce((s, r) => s + r.count, 0),
    active_hens: (hens.data || []).length,
    chores_completed: chores.filter((c: any) => c.completed).length,
    chores_total: chores.length,
  };
}

// ==================== WEATHER (direct API) ====================

export async function getWeather() {
  const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=59.33&longitude=18.07&current=temperature_2m,weathercode&timezone=Europe/Stockholm');
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

// ==================== AI (via edge function) ====================

export async function getDailyTip() {
  const { data, error } = await supabase.functions.invoke('get-daily-tip');
  if (error) throw new Error(error.message);
  return data;
}

// ==================== PREMIUM ====================

export async function getPremiumStatus() {
  const { data, error } = await supabase.functions.invoke('check-subscription');
  if (error) throw new Error(error.message);
  return { is_premium: data?.subscribed ?? false, status: data?.subscribed ? 'premium' : 'free', subscription_end: data?.subscription_end };
}

export async function createCheckoutSession(sessionData: any) {
  const { data, error } = await supabase.functions.invoke('create-checkout', { body: sessionData });
  if (error) throw new Error(error.message);
  return data;
}

export async function cancelSubscription() {
  const { data, error } = await supabase.functions.invoke('customer-portal');
  if (error) throw new Error(error.message);
  return data;
}

// ==================== HEN ANALYTICS (computed) ====================

export async function getHenHealthScores() {
  const hens = await getHens();
  const healthLogs = await getHealthLogs();
  return (hens || []).map(hen => {
    const henLogs = (healthLogs || []).filter(l => l.hen_id === hen.id);
    const recentIssues = henLogs.filter(l => {
      const d = new Date(l.date);
      return (Date.now() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
    }).length;
    return { ...hen, health_score: Math.max(0, 100 - recentIssues * 20) };
  });
}

export async function getProductivityAlerts() {
  const eggs = await getEggs();
  const hens = await getHens();
  const activeHens = (hens || []).filter(h => h.is_active).length;
  if (activeHens === 0) return [];
  const last7 = (eggs || []).filter(e => {
    const d = new Date(e.date);
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  });
  const avgPerDay = last7.reduce((s, r) => s + r.count, 0) / 7;
  const alerts: any[] = [];
  if (avgPerDay < activeHens * 0.3) {
    alerts.push({ type: 'low_production', message: 'Äggproduktionen är ovanligt låg senaste veckan.' });
  }
  return alerts;
}

// ==================== STREAK (profile-based) ====================

export async function getStreak() {
  const userId = await getUserId();
  const { data } = await supabase.from('profiles').select('preferences').eq('user_id', userId).single();
  const prefs = (data?.preferences as any) || {};
  return { current_streak: prefs.streak || 0, last_activity: prefs.last_activity || null };
}

export async function touchStreak() {
  const userId = await getUserId();
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: profile } = await supabase.from('profiles').select('preferences').eq('user_id', userId).single();
  const prefs = (profile?.preferences as any) || {};
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  let streak = prefs.streak || 0;
  if (prefs.last_activity === today) return { current_streak: streak };
  if (prefs.last_activity === yesterday) streak += 1;
  else streak = 1;
  await supabase.from('profiles').update({ preferences: { ...prefs, streak, last_activity: today } }).eq('user_id', userId);
  return { current_streak: streak };
}

// ==================== ADMIN ====================

export async function adminCheck() {
  const userId = await getUserId();
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  return { is_admin: !!data };
}

export async function adminStats() {
  const [profiles, eggs, hens] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('egg_logs').select('id', { count: 'exact' }),
    supabase.from('hens').select('id', { count: 'exact' }),
  ]);
  return { user_count: profiles.count || 0, egg_records: eggs.count || 0, hen_count: hens.count || 0 };
}

export async function adminUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function adminFeedback() {
  const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function adminUpdateFeedbackStatus(feedbackId: string, statusData: any) {
  const { data, error } = await supabase.from('feedback').update(statusData).eq('id', feedbackId).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminSubscriptions() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteUser(userId: string) {
  // Delete profile (cascading will handle related data)
  const { error } = await supabase.from('profiles').delete().eq('user_id', userId);
  if (error) throw new Error(error.message);
  return {};
}

export async function adminUpdateSubscription(userId: string, data: any) {
  const status = data.is_premium ? 'premium' : 'free';
  const { error } = await supabase.from('profiles').update({ subscription_status: status }).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return {};
}

export async function adminAcceptTerms() {
  const userId = await getUserId();
  const { error } = await supabase.from('profiles').update({ terms_accepted_at: new Date().toISOString() }).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return {};
}

// Placeholder stubs for features that need more context
export async function getStatisticsInsights() { return { insights: [] }; }
export async function getAdvancedInsights() { return { insights: [] }; }
export async function getTrendAnalysis() { return { trends: [] }; }
export async function getAlerts() { return []; }
export async function dismissAlert(_id: string) { return {}; }
export async function getRankingSummary() { return { rank: 1, total: 1 }; }
export async function getFlockStatistics() { return {}; }
export async function getFlockHealth() { return {}; }
export async function getInsights() { return { insights: [] }; }
export async function getAgdaInboxToday() { return { messages: [] }; }
export async function markHenSeen(_id: string) { return {}; }

// Legacy compatibility: export as api object for existing imports
export const api = {
  getHens, createHen, updateHen, deleteHen, getHenProfile, markHenSeen,
  getHenHealthScores, getProductivityAlerts,
  getEggs, createEggRecord, deleteEggRecord,
  getFeedRecords, createFeedRecord, deleteFeedRecord, getFeedInventory, getFeedStatistics,
  getHatchings, createHatching, updateHatching, deleteHatching, getHatchingAlerts,
  getTransactions, createTransaction, deleteTransaction,
  getHealthLogs, createHealthLog, getHenHealthLogs,
  submitFeedback,
  getDailyChores, completeChore, uncompleteChore,
  getCoopSettings, updateCoopSettings,
  getFlocks, createFlock, updateFlock, deleteFlock,
  getReminderSettings, updateReminderSettings,
  getTodayStats, getMonthStats, getYearStats, getSummaryStats,
  getStatisticsInsights, getAdvancedInsights, getTrendAnalysis,
  getYesterdaySummary, getFarmToday,
  getWeather,
  getDailyTip,
  getPremiumStatus, createCheckoutSession, cancelSubscription,
  getAlerts, dismissAlert,
  getStreak, touchStreak,
  getRankingSummary, getFlockStatistics, getFlockHealth,
  getInsights, getAgdaInboxToday,
  adminCheck, adminStats, adminUsers, adminSubscriptions,
  adminFeedback, adminUpdateFeedbackStatus, adminDeleteUser, adminUpdateSubscription,
  adminAcceptTerms,
};
