// Central API helper. Change API_BASE in production.
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://fleetflow-backend-bmvz.onrender.com/api';

const Api = {
  token: localStorage.getItem('ff_token') || null,

  setToken(t) {
    this.token = t;
    if (t) localStorage.setItem('ff_token', t);
    else localStorage.removeItem('ff_token');
  },

  headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    return h;
  },

  async request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: this.headers(),
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  },

  get: (p) => Api.request(p),
  post: (p, body) => Api.request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => Api.request(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p) => Api.request(p, { method: 'DELETE' }),
};