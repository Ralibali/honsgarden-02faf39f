const API_BASE = 'https://honsgarden.onrender.com/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, name: string) {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async forgotPassword(email: string) {
    return this.request<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    try {
      await this.request<any>('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Hens
  async getHens() {
    return this.request<any[]>('/hens');
  }

  async createHen(data: any) {
    return this.request<any>('/hens', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateHen(id: string, data: any) {
    return this.request<any>(`/hens/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteHen(id: string) {
    return this.request<any>(`/hens/${id}`, { method: 'DELETE' });
  }

  async getHenProfile(id: string) {
    return this.request<any>(`/hens/${id}/profile`);
  }

  async markHenSeen(id: string) {
    return this.request<any>(`/hens/${id}/seen`, { method: 'POST' });
  }

  async getHenHealthScores() {
    return this.request<any>('/hens/health-scores');
  }

  async getProductivityAlerts() {
    return this.request<any>('/hens/productivity-alerts');
  }

  // Eggs
  async getEggs() {
    return this.request<any[]>('/eggs');
  }

  async createEggRecord(data: { date: string; count: number; notes?: string }) {
    return this.request<any>('/eggs', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteEggRecord(id: string) {
    return this.request<any>(`/eggs/${id}`, { method: 'DELETE' });
  }

  // Feed
  async getFeedRecords() {
    return this.request<any[]>('/feed');
  }

  async createFeedRecord(data: any) {
    return this.request<any>('/feed', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteFeedRecord(id: string) {
    return this.request<any>(`/feed/${id}`, { method: 'DELETE' });
  }

  async getFeedInventory() {
    return this.request<any>('/feed/inventory');
  }

  async getFeedStatistics() {
    return this.request<any>('/feed/statistics');
  }

  // Hatching
  async getHatchings() {
    return this.request<any[]>('/hatching');
  }

  async createHatching(data: any) {
    return this.request<any>('/hatching', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateHatching(id: string, data: any) {
    return this.request<any>(`/hatching/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteHatching(id: string) {
    return this.request<any>(`/hatching/${id}`, { method: 'DELETE' });
  }

  async getHatchingAlerts() {
    return this.request<any>('/hatching-alerts');
  }

  // Transactions (Finance)
  async getTransactions() {
    return this.request<any[]>('/transactions');
  }

  async createTransaction(data: any) {
    return this.request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) });
  }

  async deleteTransaction(id: string) {
    return this.request<any>(`/transactions/${id}`, { method: 'DELETE' });
  }

  // Statistics
  async getTodayStats() {
    return this.request<any>('/statistics/today');
  }

  async getMonthStats(year: number, month: number) {
    return this.request<any>(`/statistics/month/${year}/${month}`);
  }

  async getYearStats(year: number) {
    return this.request<any>(`/statistics/year/${year}`);
  }

  async getSummaryStats() {
    return this.request<any>('/statistics/summary');
  }

  async getStatisticsInsights() {
    return this.request<any>('/statistics/insights');
  }

  async getAdvancedInsights() {
    return this.request<any>('/statistics/advanced-insights');
  }

  async getTrendAnalysis() {
    return this.request<any>('/statistics/trend-analysis');
  }

  // Daily Chores
  async getDailyChores() {
    return this.request<any[]>('/daily-chores');
  }

  async completeChore(choreId: string) {
    return this.request<any>(`/daily-chores/${choreId}/complete`, { method: 'POST' });
  }

  async uncompleteChore(choreId: string) {
    return this.request<any>(`/daily-chores/${choreId}/complete`, { method: 'DELETE' });
  }

  // Coop settings
  async getCoopSettings() {
    return this.request<any>('/coop');
  }

  async updateCoopSettings(data: any) {
    return this.request<any>('/coop', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Yesterday summary
  async getYesterdaySummary() {
    return this.request<any>('/stats/yesterday-summary');
  }

  // Farm today
  async getFarmToday() {
    return this.request<any>('/farm/today');
  }

  // Flocks
  async getFlocks() {
    return this.request<any[]>('/flocks');
  }

  async createFlock(data: any) {
    return this.request<any>('/flocks', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateFlock(id: string, data: any) {
    return this.request<any>(`/flocks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteFlock(id: string) {
    return this.request<any>(`/flocks/${id}`, { method: 'DELETE' });
  }

  // Weather
  async getWeather() {
    return this.request<any>('/weather');
  }

  // AI
  async getDailyReport() {
    return this.request<any>('/ai/daily-report');
  }

  async getEggForecast() {
    return this.request<any>('/ai/egg-forecast');
  }

  async getDailyTip() {
    return this.request<any>('/ai/daily-tip');
  }

  async getFreeTip() {
    return this.request<any>('/ai/free-tip');
  }

  // Premium
  async getPremiumStatus() {
    return this.request<any>('/premium/status');
  }

  async createCheckoutSession(data: any) {
    return this.request<any>('/checkout/create', { method: 'POST', body: JSON.stringify(data) });
  }

  async cancelSubscription() {
    return this.request<any>('/subscription/cancel', { method: 'POST' });
  }

  // Reminders
  async getReminderSettings() {
    return this.request<any>('/reminders/settings');
  }

  async updateReminderSettings(data: any) {
    return this.request<any>('/reminders/settings', { method: 'PUT', body: JSON.stringify(data) });
  }

  // Health logs
  async getHealthLogs() {
    return this.request<any[]>('/health-logs');
  }

  async createHealthLog(data: any) {
    return this.request<any>('/health-logs', { method: 'POST', body: JSON.stringify(data) });
  }

  async getHenHealthLogs(henId: string) {
    return this.request<any[]>(`/health-logs/${henId}`);
  }

  // Alerts
  async getAlerts() {
    return this.request<any[]>('/alerts');
  }

  async dismissAlert(id: string) {
    return this.request<any>(`/alerts/${id}/dismiss`, { method: 'POST' });
  }

  // Streak
  async getStreak() {
    return this.request<any>('/me/streak');
  }

  async touchStreak() {
    return this.request<any>('/me/streak/touch', { method: 'POST' });
  }

  // Ranking
  async getRankingSummary() {
    return this.request<any>('/ranking/summary');
  }

  // Flock stats
  async getFlockStatistics() {
    return this.request<any>('/flock/statistics');
  }

  async getFlockHealth() {
    return this.request<any>('/flock/health');
  }

  // Feedback
  async submitFeedback(data: any) {
    return this.request<any>('/feedback', { method: 'POST', body: JSON.stringify(data) });
  }

  // Insights
  async getInsights() {
    return this.request<any>('/insights');
  }

  // Agda inbox
  async getAgdaInboxToday() {
    return this.request<any>('/agda/inbox/today');
  }

  // Admin
  async adminCheck() {
    return this.request<any>('/admin/check');
  }

  async adminStats() {
    return this.request<any>('/admin/stats');
  }

  async adminUsers() {
    return this.request<any[]>('/admin/users');
  }

  async adminSubscriptions() {
    return this.request<any[]>('/admin/subscriptions');
  }

  async adminFeedback() {
    return this.request<any[]>('/admin/feedback');
  }

  async adminUpdateFeedbackStatus(feedbackId: string, data: any) {
    return this.request<any>(`/admin/feedback/${feedbackId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async adminDeleteUser(userId: string) {
    return this.request<any>(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  async adminUpdateSubscription(userId: string, data: any) {
    return this.request<any>(`/admin/subscriptions/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
  }
}

export const api = new ApiClient();
