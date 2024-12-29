"use server";

import apiClient from "@/configs/apiClient.config";
import ApiRouter from "@/configs/apiRouter.config";
import CookieConfig from "@/configs/cookie.config";
import { getCookie } from "@/libs/cookies.server";
import responseUtil from "@/utils/response.util";

const router = ApiRouter.photo;

export type UploadPhoto = {
    id: string;
}[]

export const uploadPhoto = responseUtil.catchError(
    async (formData: FormData) => {
        apiClient.setOptions({
            token: await getCookie(CookieConfig.accessToken.name),
            contentType: null,
        });
        return await apiClient.post<UploadPhoto>(router.upload, formData)
    }
);

export const deletePhoto = responseUtil.catchError(async (ids: string[]) => {
    apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
    return await apiClient.delete(router.list, {
        ids
    })
})