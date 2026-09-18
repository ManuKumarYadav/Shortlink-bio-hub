import axios from "axios";

const resolveBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL || "/api";
  if (url.startsWith("http") && !url.replace(/\/$/, "").endsWith("/api")) {
    url = url.replace(/\/$/, "") + "/api";
  }
  return url;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/signup") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await api.post("/auth/refresh");
        if (refreshRes.data?.accessToken) {
          localStorage.setItem("accessToken", refreshRes.data.accessToken);
        }
        processQueue(null);
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem("accessToken");
        processQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/users/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", { token, newPassword }),
  verifyEmail: (token) => api.post("/auth/verify-email", { token }),
};

export const linkApi = {
  createLink: (data) => api.post("/links", data),
  getMyLinks: (params) => api.get("/links", { params }),
  getSingleLink: (id) => api.get(`/links/${id}`),
  deleteLink: (id) => api.delete(`/links/${id}`),
  getLinkAnalytics: (id) => api.get(`/links/${id}/analytics`),
};

export const bioApi = {
  createBio: (data) => api.post("/bio", data),
  updateBio: (data) => api.put("/bio", data),
  getMyBio: () => api.get("/bio/me"),
  getPublicBio: (username) => api.get(`/bio/${username}`),
};

export default api;
