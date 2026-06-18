import axios from "axios";
import { TutorProfileData } from "../tutorTypes/profile";

export async function getTutorProfile(tutorId: string): Promise<TutorProfileData> {
  try {
    const options = {
      url: `http://localhost:3000/data/tutorProfile.json`,
      method: "get",
    };

    const { data } = (await axios.request(options)).data;

    console.log(data);
    return data as TutorProfileData;
  } catch (error) {
    console.log(error);
    throw error;
  }
}