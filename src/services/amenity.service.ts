"use server";
import apiClient from "../configs/apiClient.config";
import ApiRouter from "../configs/apiRouter.config";
import responseUtil from "../utils/response.util";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import {Amenity} from "@/types";
import {ApiTags} from "@/enum/apiTags.enum";

const router = ApiRouter.amenity;

export  type  AmenityService = Omit<Amenity, "photo_id"> & {
    url: string
}
export  type GetAmenityAndCountAll = {
    count: number;
    rows: AmenityService[]
};

export const getAmenityAndCountAll = responseUtil.catchError(async (searchParams: Params) => {
    apiClient.setOptions({
        query: searchParams,
        next: {
            tags: [ApiTags.AMENITIES]
        }
    });
    return await apiClient.get<GetAmenityAndCountAll>(router.list);
})