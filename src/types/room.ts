import { PrivacyType } from "@/enum/room";

export interface Room {
    id: string,
    title: string | null,
    description: string | null,
    statusText: string,
    user_id: string,
    original_price: number | 0,
    instant_book: boolean,
    structure_id: string | null,
    privacy_type: PrivacyType.ENTIRE | PrivacyType.ROOM | PrivacyType.SHARED | null,
    amenity_id: string | null,
    fee_id: string | null,
    photo_id: string | null,
    user_wishlist: string,
    created_at: string,
    updated_at: string,
}