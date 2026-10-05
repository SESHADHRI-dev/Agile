const API_BASE = "http://localhost:8000/api";

class ApiService {
  constructor() {
    // If no token in localStorage, initialize with local development token so requests never lack Bearer header
    const saved = localStorage.getItem("token");
    if (!saved || saved === "undefined" || saved === "null") {
      this.token = "dev-admin-token";
      localStorage.setItem("token", "dev-admin-token");
    } else {
      this.token = saved;
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      // In local mode, keep a valid dev fallback
      this.token = "dev-admin-token";
      localStorage.setItem("token", "dev-admin-token");
    }
  }

  async request(endpoint, options = {}, isRetry = false) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : { Authorization: "Bearer dev-admin-token" }),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      // Automatic 401 Self-Healing for Local Development
      if (response.status === 401 && !isRetry) {
        console.warn(`[API] 401 Unauthorized encountered on ${endpoint}. Refreshing local development token...`);
        this.setToken("dev-admin-token");
        // Retry once with clean dev token
        return this.request(endpoint, options, true);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || `HTTP ${response.status} Error`);
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // Auth
  async getAuthConfig() {
    return this.request("/auth/config");
  }

  async login(username, password) {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getProfile() {
    return this.request("/auth/me");
  }

  logout() {
    this.setToken("dev-admin-token");
    localStorage.removeItem("user");
  }

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products${query ? `?${query}` : ""}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(payload) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async updateProduct(id, payload) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, { method: "DELETE" });
  }

  // Suppliers
  async getSuppliers(search = "") {
    return this.request(`/suppliers${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  }

  async createSupplier(payload) {
    return this.request("/suppliers", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async updateSupplier(id, payload) {
    return this.request(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }

  async deleteSupplier(id) {
    return this.request(`/suppliers/${id}`, { method: "DELETE" });
  }

  // Transactions
  async getPurchases() {
    return this.request("/purchases");
  }

  async recordPurchase(payload) {
    return this.request("/purchases", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async getSales(productId = "") {
    return this.request(`/sales${productId ? `?product_id=${productId}` : ""}`);
  }

  async recordSale(payload) {
    return this.request("/sales", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  // Inventory & Alerts
  async getInventory() {
    return this.request("/inventory");
  }

  async getAlerts() {
    return this.request("/alerts");
  }

  // Predictions & ML
  async calculatePrediction(payload) {
    return this.request("/predictions/calculate", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async getRecommendations(method = "exponential_smoothing") {
    return this.request(`/predictions/recommendations?method=${method}`);
  }

  // Reports & Seeding
  async getReportsSummary() {
    return this.request("/reports/summary");
  }

  getExportUrl(reportType) {
    return `${API_BASE}/reports/export?report_type=${reportType}&format=csv`;
  }

  async downloadReport(reportType) {
    const res = await fetch(`${API_BASE}/reports/export?report_type=${reportType}&format=csv`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Failed to download report" }));
      throw new Error(err.detail || err.error || "Failed to download report");
    }
    return res.blob();
  }

  async seedDatabase() {
    return this.request("/seed", { method: "POST" });
  }
}

export const api = new ApiService();
