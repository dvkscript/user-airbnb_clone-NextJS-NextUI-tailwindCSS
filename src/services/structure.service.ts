"use server"
import apiClient from "@/configs/apiClient.config";
import ApiRouter from "@/configs/apiRouter.config";
import { Structure } from "@/types";
import responseUtil from "@/utils/response.util";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

const router = ApiRouter.structure;

export type StructureService = Omit<Structure, "photo_id"> & {
    photo: string
}

export type GetStructureAndCountAll = {
    count: number;
    rows: StructureService[]
}

export const getStructureAndCountAll = responseUtil.catchError(
    async (searchParams: Params) => {
        apiClient.setQuery(searchParams);
        return await apiClient.get<GetStructureAndCountAll>(router.list);
    }
)