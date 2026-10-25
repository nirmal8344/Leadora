/**
 * Centralized API Client for Leadora
 * Reads VITE_API_BASE_URL without hardcoded localhost defaults in production.
 */

const RAW_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");

/**
 * Normalizes base URL and endpoint to prevent duplicate `/api` path segments.
 * Example: base='https://leadora-ijdq.onrender.com/api' + endpoint='/api/v1/auth/login'
 * -> 'https://leadora-ijdq.onrender.com/api/v1/auth/login'
 */
export function buildApiUrl(endpoint) {
  if (!endpoint) return RAW_API_BASE_URL;
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (RAW_API_BASE_URL.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    return `${RAW_API_BASE_URL.slice(0, -4)}${cleanEndpoint}`;
  }
  return `${RAW_API_BASE_URL}${cleanEndpoint}`;
}

let memoryToken = null;

export const setAuthToken = (token) => {
  memoryToken = token;
};

export const getAuthToken = () => {
  return memoryToken;
};

export const clearAuthToken = () => {
  memoryToken = null;
};

/**
 * Universal request wrapper
 */
async function request(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true, data: null };
    }

    const contentType = response.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    const networkError = new Error("Unable to connect to the Leadora backend service.");
    networkError.status = 0;
    networkError.originalError = err;
    throw networkError;
  }
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) =>
    request(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  put: (endpoint, body, options) =>
    request(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  patch: (endpoint, body, options) =>
    request(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
  getBaseUrl: () => RAW_API_BASE_URL,
};

export default apiClient;
