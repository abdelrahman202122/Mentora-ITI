// import axios from "axios";
// import type { TutorProfileData } from "@/types/tutor/tutor-profile";
// console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
// export async function getTutorProfile(tutorId: string): Promise<TutorProfileData> {
//   try {
//     const options = {
//       url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/tutors/${tutorId}/profile`,
//       method: "get",
//       timeout: 10000
//     };

//     const response = await axios.request(options);
//     const data = response.data.data;
//     console.log(data);
//     return data as TutorProfileData;
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// }

import api, { ApiClientError } from "@/lib/axios";
import type { TutorProfileData } from "@/types/tutor/tutor-profile";

type ApiSuccess<T> = {
  success: boolean;
  data: T;
};

export async function getTutorProfile(
  tutorId: string
): Promise<TutorProfileData> {
  try {
    const response = await api.get<ApiSuccess<TutorProfileData>>(
      `/tutors/${tutorId}/profile`
    );
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}