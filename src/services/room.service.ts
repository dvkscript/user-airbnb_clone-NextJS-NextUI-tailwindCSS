"use server";

import apiClient from "@/configs/apiClient.config";
import ApiRouter from "@/configs/apiRouter.config";
import CookieConfig from "@/configs/cookie.config";
import { ApiTags } from "@/enum/apiTags.enum";
import { getCookie } from "@/libs/cookies.server";
import { Address, Discount, Fee, Room, RoomPhotos, User, UserWishlist } from "@/types";
import { FloorPlan } from "@/types/floor-plan";
import responseUtil from "@/utils/response.util";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

const router = ApiRouter.rooms;

export type GetRoomAndCountAll = {
    count: number;
    rows: (Pick<Room, "id" | "title" | "description" | "statusText" | "original_price" | "created_at" | "updated_at" | "instant_book" | "privacy_type"> & {
        address: Address,
        photos: (Omit<RoomPhotos, "room_id" | "photo_id"> & {
            url: string
        })[],
        wishlists: UserWishlist | null,
        structure: string
    })[]
}

export const getRoomAndCountAll = responseUtil.catchError(
    async (searchParams: Params) => {
        apiClient.setOptions({
            query: searchParams,
            next: {
                revalidate: 5 * 60,
                tags: [ApiTags.ROOMS]
            },
            token: await getCookie(CookieConfig.accessToken.name)
        })
        return await apiClient.get<GetRoomAndCountAll>(router.list);
    }
)

export type GetRoomDetail = Omit<Room, "user_id" | "photo_id" | "structure_id" | "user_wishlist_id" | "fee_id"> & {
    user: {
        full_name: User["full_name"],
        exp: number,
        thumbnail: string | null
    };
    wishlists: UserWishlist | null;
    photos: (Omit<RoomPhotos, "room_id" | "photo_id"> & {
        url: string
    })[];
    structure: string;
    address: Address;
    amenities: string[];
    fee: Fee;
    discounts: Discount[]
    floorPlan: FloorPlan;
}

export const getRoomDetail = responseUtil.catchError(
    async (roomId: string) => {
        apiClient.setOptions({
            next: {
                revalidate: 5 * 60,
                tags: [ApiTags.ROOM_DETAIL]
            },
            token: await getCookie(CookieConfig.accessToken.name)
        })
        return await apiClient.get<GetRoomDetail>(router.room(roomId));
    }
)

export const roomBooking = responseUtil.catchError(
    async (roomId: string, body: { paymentMethod: string, amount: number }) => {
        apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
        return await apiClient.post(router.booking(roomId), body)
    }
)