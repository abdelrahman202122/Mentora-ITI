import { apiFetch } from "@/lib/api/apiClient";

const BASE_URL = "/api/users";

/**
 * Logout the current user.
 * Backend clears the accessToken + refreshToken cookies and deletes
 * all refresh token records from the DB.
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch(`${BASE_URL}/logout`, {
      method: "POST",
    });
  } catch (error) {

    console.error("Logout API call failed:", error);
  }
}