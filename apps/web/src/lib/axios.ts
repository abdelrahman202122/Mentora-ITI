import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

type ErrorResponse = {
  message?: string;
  errors?: unknown;
};


type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export class ApiClientError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.details = details;
  }
}

export function normalizeApiError(error: unknown): ApiClientError {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (axios.isAxiosError<ErrorResponse>(error)) {
    return new ApiClientError(
      error.response?.data?.message ?? error.message ?? "Request failed",
      error.response?.status,
      error.response?.data?.errors
    );
  }

  return new ApiClientError(
    error instanceof Error ? error.message : "An unexpected error occurred"
  );
}

const clientOptions = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
};

const api = axios.create({
  ...clientOptions,
});

const refreshClient = axios.create({
  ...clientOptions,
});

let refreshRequest: Promise<void> | null = null;

function shouldAttemptRefresh(error: AxiosError, request?: RetryableRequest): boolean {
  if (error.response?.status !== 401 || !request || request._retry) {
    return false;
  }

  const url = request.url ?? "";
  return ![
    "/users/login",
    "/users/register",
    "/users/refresh-token",
    "/users/me",
  ].some((endpoint) => url.includes(endpoint));
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      throw normalizeApiError(error);
    }

    const request = error.config as RetryableRequest | undefined;

    if (shouldAttemptRefresh(error, request) && request) {
      request._retry = true;

      try {
        if (!refreshRequest) {
          refreshRequest = refreshClient
            .post("/users/refresh-token")
            .then(() => undefined)
            .finally(() => {
              refreshRequest = null;
            });
        }

        await refreshRequest;
        return api(request);
      } catch (refreshError) {
        throw normalizeApiError(refreshError);
      }
    }

    throw normalizeApiError(error);
  }
);

export default api;
