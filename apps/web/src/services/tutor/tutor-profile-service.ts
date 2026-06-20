import axios from "axios";
import type { TutorProfileData } from "@/types/tutor/tutor-profile";
console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
export async function getTutorProfile(tutorId: string): Promise<TutorProfileData> {
  try {
    const options = {
      url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/data/tutorProfile.json`,
      method: "get",
      timeout: 10000
    };

    const response = await axios.request(options);
    const data = response.data.data;
    console.log(data);
    return data as TutorProfileData;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
