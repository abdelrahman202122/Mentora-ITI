// import api, { ApiClientError } from "@/lib/axios";
// import type { ApiSuccess } from "@/types/apis/api-success";
// import type { EarningsData } from "@/types/earning/earningData";

// export async function getMyEarnings(): Promise<EarningsData> {
//   try {
//     const response = await api.get<ApiSuccess<EarningsData>>(
//       "/earnings/me"
//     );

//     return response.data.data;
//   } catch (error) {
//     if (error instanceof ApiClientError) {
// console.error("getMyEarnings error:", {
//         message: error.message,
//         status: error.status,
//       });    }

//     throw error;
//   }
// }

import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { EarningsData } from "@/types/earning/earningData";

export type EarningStatus = "pending" | "available" | "paid_out" | "canceled";

interface GetMyEarningsParams {
  status?: EarningStatus;
  limit?: number;
  page?: number;
}

export async function getMyEarnings(
  params?: GetMyEarningsParams
): Promise<EarningsData> {
  try {
    const response = await api.get<ApiSuccess<EarningsData>>("/earnings/me", {
      params,
    });

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("getMyEarnings error:", {
        message: error.message,
        status: error.status,
      });
    }

    throw error;
  }
}