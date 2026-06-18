import axios from "axios";
import { TutorProfileData } from "../tutorTypes/profile";

export async function getTutorProfile(tutorId: string): Promise<TutorProfileData> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
    const options = {
      url: `${baseUrl}/data/tutorProfile.json`,
      method: "get",
      timeout: 5000,
    };

    const { data } = (await axios.request(options)).data;

    console.log(data);
    return data as TutorProfileData;
  } catch (error) {
    console.log(error);
    throw error;
  }
}