
import axios from "axios";
import { env } from "../config/env.js";

export const verifyEmail = async (email: string) => {
  const response = await axios.get(
    "https://emailvalidation.abstractapi.com/v1/",
    {
      params: {
        api_key: env.ABSTRACT_API_KEY,
        email,
      },
    }
  );

  return response.data;
};