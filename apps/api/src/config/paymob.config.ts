import { env } from './env.js';

export const paymobConfig = {
    apiKey: env.PAYMOB_API_KEY,

    secretKey:
        env.PAYMOB_SECRET_KEY,

    publicKey:
        env.PAYMOB_PUBLIC_KEY,

    hmacSecret:
        env.PAYMOB_HMAC_SECRET,

    integrationId:
        env.PAYMOB_INTEGRATION_ID,

    baseUrl:
        "https://accept.paymob.com"
