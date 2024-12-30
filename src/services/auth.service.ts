"use server"
import apiClient from "@/configs/apiClient.config";
import ApiRouter from "@/configs/apiRouter.config";
import CookieConfig from "@/configs/cookie.config";
import { deleteCookies, getCookie, setCookies } from "@/libs/cookies.server";
import responseUtil from "@/utils/response.util";
import { TSignInValidator, TSignUpValidator } from "@/validators/auth.validator";
import { addDays } from "date-fns";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

const router = ApiRouter.auth;

type GetSocialRedirectLink = {
    urlRedirect: string
}

export const getSocialRedirectLink = responseUtil.catchError(
    async (provider: keyof typeof router.providers) => {
        return await apiClient.get<GetSocialRedirectLink>(router.providers[provider].redirect)
    }
);

type TokenService = {
    accessToken: string
    refreshToken: string
}

export const socialLoginCallBack = responseUtil.catchError(
    async (
        provider: keyof typeof router.providers,
        searchParams: Params
    ) => {
        apiClient.setQuery(searchParams);
        const result = await apiClient.get<TokenService>(router.providers[provider].callback);

        return result;
    }
)

export const signIn = responseUtil.catchError(
    async (formData: TSignInValidator) => {
        const result = await apiClient.post<TokenService>(router.signIn, formData);
        if (result.ok && result.data) {
            setCookies([
                { name: CookieConfig.accessToken.name, value: result.data.accessToken },
                { name: CookieConfig.refreshToken.name, value: result.data.refreshToken },
            ], {
                httpOnly: true,
                expires: addDays(new Date(), 30)
            });
        }
        return result;
    }
)

export const signUp = responseUtil.catchError(
    async (formData: TSignUpValidator) => {
        return await apiClient.post(router.signUp, formData);
    }
)

export const signOut = responseUtil.catchError(
    async () => {
        apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
        const result = await apiClient.post<any>(router.signOut, {
            refresh_token: await getCookie(CookieConfig.refreshToken.name),
        });
        deleteCookies([
            CookieConfig.accessToken.name,
            CookieConfig.refreshToken.name
        ]);
        apiClient.setToken(null)
        return result;
    }
)

export const refreshToken = responseUtil.catchError(
    async (refresh_token: string) => {
        apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
        return await apiClient.post<TokenService>(router.refreshToken, {
            refresh_token
        });
    }
)