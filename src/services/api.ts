// API Client for Marketing & Growth Backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_URL;
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

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, name?: string) {
    return this.request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request<any>('/api/auth/me');
  }

  async updateProfile(data: { name?: string }) {
    return this.request<any>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Campaign endpoints
  async getCampaigns() {
    return this.request<any[]>('/api/campaigns');
  }

  async getCampaign(id: number) {
    return this.request<any>(`/api/campaigns/${id}`);
  }

  async createCampaign(data: any) {
    return this.request<any>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(id: number, data: any) {
    return this.request<any>(`/api/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: number) {
    return this.request<any>(`/api/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  async getCampaignAnalytics(id: number) {
    return this.request<any>(`/api/campaigns/${id}/analytics`);
  }

  // UTM Links endpoints
  async createUTMLink(data: any) {
    return this.request<any>('/api/utm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUTMLinks(campaignId?: number) {
    const query = campaignId ? `?campaignId=${campaignId}` : '';
    return this.request<any[]>(`/api/utm${query}`);
  }

  async getUTMLink(id: number) {
    return this.request<any>(`/api/utm/${id}`);
  }

  async getUTMLinkAnalytics(id: number) {
    return this.request<any>(`/api/utm/${id}/analytics`);
  }

  async deleteUTMLink(id: number) {
    return this.request<any>(`/api/utm/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Posts endpoints
  async generatePost(data: any) {
    return this.request<any>('/api/posts/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPosts(filters?: { campaignId?: number; platform?: string; isFavorite?: boolean }) {
    const query = new URLSearchParams();
    if (filters?.campaignId) query.set('campaignId', filters.campaignId.toString());
    if (filters?.platform) query.set('platform', filters.platform);
    if (filters?.isFavorite) query.set('isFavorite', 'true');

    const queryString = query.toString();
    return this.request<any[]>(`/api/posts${queryString ? '?' + queryString : ''}`);
  }

  async getPost(id: number) {
    return this.request<any>(`/api/posts/${id}`);
  }

  async updatePost(id: number, data: any) {
    return this.request<any>(`/api/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async schedulePost(id: number, scheduledFor: string) {
    return this.request<any>(`/api/posts/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledFor }),
    });
  }

  async deletePost(id: number) {
    return this.request<any>(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async getScheduledPosts() {
    return this.request<any[]>('/api/posts/scheduled/upcoming');
  }

  // Alias for getPosts to match calendar component
  async getAIPosts() {
    return this.getPosts();
  }

  // Bio Pages endpoints
  async createBioPage(data: any) {
    return this.request<any>('/api/bio', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBioPages() {
    return this.request<any[]>('/api/bio/my-pages');
  }

  async getBioPage(slug: string) {
    return this.request<any>(`/api/bio/${slug}`);
  }

  async updateBioPage(id: number, data: any) {
    return this.request<any>(`/api/bio/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBioPage(id: number) {
    return this.request<any>(`/api/bio/${id}`, {
      method: 'DELETE',
    });
  }

  async getBioPageAnalytics(id: number) {
    return this.request<any>(`/api/bio/${id}/analytics`);
  }

  async checkSlugAvailability(slug: string) {
    return this.request<{ available: boolean; slug: string }>(`/api/bio/check-slug/${slug}`);
  }

  // Template endpoints
  async getTemplates(filters?: { type?: string; category?: string; featured?: boolean }) {
    const query = new URLSearchParams();
    if (filters?.type) query.set('type', filters.type);
    if (filters?.category) query.set('category', filters.category);
    if (filters?.featured) query.set('featured', 'true');

    const queryString = query.toString();
    return this.request<any[]>(`/api/templates${queryString ? '?' + queryString : ''}`);
  }

  async getTemplate(id: number) {
    return this.request<any>(`/api/templates/${id}`);
  }

  async createTemplate(data: any) {
    return this.request<any>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: number, data: any) {
    return this.request<any>(`/api/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async purchaseTemplate(id: number) {
    return this.request<any>(`/api/templates/${id}/purchase`, {
      method: 'POST',
    });
  }

  async getMyPurchases() {
    return this.request<any[]>('/api/templates/my-purchases/all');
  }

  async getMyTemplates() {
    return this.request<any[]>('/api/templates/my-templates/all');
  }

  async rateTemplate(id: number, rating: number) {
    return this.request<any>(`/api/templates/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
  }

  // Calendar Events endpoints
  async getCalendarEvents(filters?: { campaignId?: number; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (filters?.campaignId) query.set('campaignId', filters.campaignId.toString());
    if (filters?.startDate) query.set('startDate', filters.startDate);
    if (filters?.endDate) query.set('endDate', filters.endDate);

    const queryString = query.toString();
    return this.request<any[]>(`/api/calendar${queryString ? '?' + queryString : ''}`);
  }

  async getCalendarEvent(id: number) {
    return this.request<any>(`/api/calendar/${id}`);
  }

  async createCalendarEvent(data: any) {
    return this.request<any>('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCalendarEvent(id: number, data: any) {
    return this.request<any>(`/api/calendar/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCalendarEvent(id: number) {
    return this.request<any>(`/api/calendar/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new APIClient();
export default api;
