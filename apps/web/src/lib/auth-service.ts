import apiClient, { AuthResponse, ErrorResponse } from './api-client';
import type { RegisterPayload, LoginPayload } from './schemas';
import { AxiosError } from 'axios';

export class AuthService {
  /**
   * Register a new user
   * @param payload Registration data
   * @returns User data on success
   */
  static async register(
    payload: RegisterPayload,
  ): Promise<AuthResponse['data']> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/users/register',
        payload,
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   * @param payload Login credentials
   * @returns User data and optional token
   */
  static async login(
    payload: LoginPayload,
  ): Promise<AuthResponse['data']> {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/users/login',
        payload,
      );
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user (if needed)
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/users/logout');
    } catch (error) {
      // Logout errors shouldn't block the process
      console.error('Logout error:', error);
    }
  }

  /**
   * Verify current session/token
   */
  static async verifyAuth(): Promise<AuthResponse['data'] | null> {
    try {
      const response = await apiClient.get<AuthResponse>('/users/me');
      return response.data.data;
    } catch {
      return null;
    }
  }

  /**
   * Handle API errors and format them consistently
   */
  private static handleError(error: unknown): {
    message: string;
    fieldErrors?: Record<string, string[]>;
    code?: string;
    errorType?: 'network' | 'server' | 'validation' | 'auth' | 'unknown';
  } {
    if (error instanceof AxiosError) {
      // Network/Connection errors (no response from server)
      if (!error.response) {
        if (error.code === 'ECONNREFUSED') {
          return {
            message:
              'Unable to connect to server. Please check if the backend is running.',
            code: error.code,
            errorType: 'network',
          };
        }
        if (error.code === 'ENOTFOUND') {
          return {
            message:
              'Server address not found. Please check the API URL configuration.',
            code: error.code,
            errorType: 'network',
          };
        }
        if (error.code === 'ETIMEDOUT') {
          return {
            message: 'Connection timed out. Server is not responding.',
            code: error.code,
            errorType: 'network',
          };
        }
        return {
          message: 'Network error. Please check your connection.',
          code: error.code,
          errorType: 'network',
        };
      }

      const data = error.response?.data as ErrorResponse | undefined;
      const status = error.response?.status;

      // Validation errors (400/422)
      if (status === 400 || status === 422) {
        return {
          message: data?.message || 'Invalid request',
          fieldErrors: data?.errors,
          code: error.code,
          errorType: 'validation',
        };
      }

      // Authentication errors (401)
      if (status === 401) {
        return {
          message: data?.message || 'Invalid credentials',
          code: error.code,
          errorType: 'auth',
        };
      }

      // Server errors (5xx)
      if (status && status >= 500) {
        return {
          message: 'Server error. Please try again later or contact support.',
          code: error.code,
          errorType: 'server',
        };
      }

      // Generic API error
      return {
        message: data?.message || error.message || 'Request failed',
        fieldErrors: data?.errors,
        code: error.code,
        errorType: 'unknown',
      };
    }

    return {
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
      errorType: 'unknown',
    };
  }
}

export default AuthService;
