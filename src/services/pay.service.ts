"use server";

import apiClient from "@/configs/apiClient.config";
import ApiRouter from "@/configs/apiRouter.config";
import CookieConfig from "@/configs/cookie.config";
import { getCookie } from "@/libs/cookies.server";
import responseUtil from "@/utils/response.util";

const router = ApiRouter.pay;

export const stripePaymentIntent = responseUtil.catchError(async (amount: number) => {
    apiClient.setToken(await getCookie(CookieConfig.accessToken.name));

    return apiClient.post<{
        clientSecret: string,
        payId: string
    }>(router.stripe, {
        amount,
    });
})

// export const paypalCreatePayment = responseUtil.catchError(async ({} : {}) => {
    
// })