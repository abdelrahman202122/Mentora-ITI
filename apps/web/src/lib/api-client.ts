import axios, { AxiosInstance, AxiosError } from 'axios';

// Type definitions for API responses
export interface AuthResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: 'learner' | 'tutor' | 'admin';
  };
  message?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Include cookies in requests for session-based auth
  withCredentials: true,
});

// Request interceptor to add token if using JWT
apiClient.interceptors.request.use(
  (config) => {
    // If you're using token-based auth, uncomment and modify:
    // const token = localStorage.getItem("authToken");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/Login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
