"use server";

import apiClient from "@/configs/apiClient.config";
import ApiRouter from "@/configs/apiRouter.config";
import { ApiTags } from "@/enum/apiTags.enum";
import { revalidateTag } from "@/libs/cache";
import { getCookie } from "@/libs/cookies.server";
import { Address, Discount, Fee, Profile, Room, RoomPhotos, User, UserWishlist } from "@/types";
import responseUtil from "@/utils/response.util";
import { TCreateUserRoomValidator, TUpdateUserRoomValidator } from "@/validators/user.validator";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { StructureService } from "./structure.service";
import { AmenityService } from "@/services/amenity.service";
import CookieConfig from "@/configs/cookie.config";
import { FloorPlan } from "@/types/floor-plan";

const router = ApiRouter.user;

export type GetProfile = Omit<User, "password"> & {
    roles: string[];
    permissions: string[];
    profile: Omit<Profile, "user_id" | "photo_id" | "address_id"> & {
        thumbnail: string
    }
}

export const getProfile = responseUtil.catchError(
    async () => {
        const token = await getCookie(CookieConfig.accessToken.name);

        if (!token) {
            throw new responseUtil.CatchError({
                status: 400,
                message: "Token not found"
            })
        }
        apiClient.setOptions({
            token,
            next: {
                tags: [ApiTags.PROFILE]
            }
        });
        return await apiClient.get<GetProfile>(router.profile);
    }
)

export type GetUserRoomAndCountAll = {
    count: number;
    rows: (Pick<Room, "id" | "title" | "description" | "original_price" | "statusText" | "created_at" | "updated_at"> & {
        photos: (Omit<RoomPhotos, "photo_id"> & { url: string })[],
        address: Address
    })[]
}


export const getUserRoomAndCountAll = responseUtil.catchError(
    async (searchParams: Params) => {
        apiClient.setOptions({
            next: {
                tags: [ApiTags.USER_ROOMS]
            },
            token: await getCookie(CookieConfig.accessToken.name),
            query: searchParams,
        });
        return await apiClient.get<GetUserRoomAndCountAll>(router.rooms)
    }
)

export type GetUserRoom = Omit<Room, "user_id" | "structure_id" | "amenity_id" | "fee_id"> & {
    structure: StructureService | null;
    amenities: AmenityService[];
    photos: ((Omit<RoomPhotos, "photo_id" | "room_id"> & {
        url: string
    })[]);
    fee: Fee,
    discounts: Discount[];
    floorPlan: FloorPlan
}

export const getUserRoom = responseUtil.catchError(
    async (roomId: string) => {
        apiClient.setOptions({
            next: {
                tags: [ApiTags.USER_ROOM]
            },
            token: await getCookie(CookieConfig.accessToken.name),
        });
        const result = await apiClient.get<GetUserRoom>(router.room(roomId));

        const photos = result.data?.photos
        if (result.data && photos) {
            result.data = {
                ...result.data,
                photos: photos.sort((a, b) => a.position - b.position)
            }
        }
        return result
    }
);

export const createUserRoom = responseUtil.catchError(
    async (body: TCreateUserRoomValidator) => {
        apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
        const result = await apiClient.post<any>(router.rooms, body);
        if (result.ok) {
            revalidateTag(ApiTags.USER_ROOMS)
            revalidateTag(ApiTags.USER_ROOM)
            revalidateTag(ApiTags.STRUCTURES)
        }
        return result;
    }
);

export const updateUserRoom = responseUtil.catchError(
    async (roomId: string, body: TUpdateUserRoomValidator) => {
        apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
        const result = await apiClient.patch<any>(router.room(roomId), body);

        if (result.ok) {
            revalidateTag(ApiTags.USER_ROOM)
        }
        return result;
    }
)

export const deleteUserRooms = responseUtil.catchError(
    async (ids: string[]) => {
        apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
        const result = await apiClient.delete(router.rooms, {
            ids
        })
        if (result.ok) {
            revalidateTag(ApiTags.USER_ROOMS)
        }
        return result;
    }
)

export type GetWishlists = (Omit<UserWishlist, "user_id"> & {
    thumbnail: string | null;
    roomCount: number;
})[]

export const getWishlists = responseUtil.catchError(
    async () => {
        apiClient.setOptions({
            token: await getCookie(CookieConfig.accessToken.name),
            next: {
                tags: [ApiTags.USER_FAVORITES]
            }
        })
        const result = await apiClient.get<GetWishlists>(router.wishlists)
        return result;
    }
)

export const createWishlist = responseUtil.catchError(
    async (name: string) => {
        apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
        const res = await apiClient.post<UserWishlist>(router.wishlists, {
            name,
        });
        if (res.ok) {
            revalidateTag(ApiTags.USER_FAVORITES);
            revalidateTag(ApiTags.ROOMS);
            revalidateTag(ApiTags.ROOM_DETAIL);
        }
        return res;
    }
);

export const wishlistAddOrRemoveRoom = responseUtil.catchError(
    async (wishlistId: string, body: { roomId: string, action: "add" | "remove" }) => {
        apiClient.setToken(await getCookie(CookieConfig.accessToken.name));
        const res = await apiClient.post(router.wishlist(wishlistId), body);
        if (res.ok) {
            revalidateTag(ApiTags.USER_FAVORITES);
            revalidateTag(ApiTags.ROOMS);
            revalidateTag(ApiTags.ROOM_DETAIL)
        }
        return res;
    }
)