import { PrivacyType } from "@/enum/room";
import { z } from "zod";

export const CreateUserRoomValidator = z.object({
    title: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }).optional(),
    description: z.string({
        required_error: "Description is required",
        invalid_type_error: "Description must be a string",
    }).optional(),
    original_price: z.number({
        required_error: "Original price is required",
        invalid_type_error: "Original price must be a number",
    }).optional(),
    statusText: z.string().optional()
});

export type TCreateUserRoomValidator = z.infer<
    typeof CreateUserRoomValidator
>;

export const UpdateUserRoomValidator = z.object({
    title: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
    }).optional(),
    description: z.string({
        required_error: "Description is required",
        invalid_type_error: "Description must be a string",
    }).optional(),
    original_price: z.number({
        required_error: "Original price is required",
        invalid_type_error: "Original price must be a number",
    }).optional(),
    statusText: z.string().optional(),
    instant_book: z.boolean({
        required_error: "Instant book is required",
        invalid_type_error: "Instant book must be a boolean",
    }).optional(),
    structure_id: z.string({
        required_error: "Structure id is required",
        invalid_type_error: "Structure id must be a string",
    }).optional(),
    privacy_type: z.enum([PrivacyType.ENTIRE, PrivacyType.ROOM, PrivacyType.SHARED]).optional(),
    amenity_id: z.array(z.string({
        required_error: "Amenity id is required",
        invalid_type_error: "Amenity id must be a string",
    })).optional(),
    photos: z.array(z.object({
        id: z.string({
            required_error: "photo id is required",
            invalid_type_error: "Photo id must be a string",
        }),
        position: z.number({
            required_error: "photo position is required",
            invalid_type_error: "Photo position must be a number",
        }).optional()
    })).optional(),
    address: z.object({
        postal_code: z
            .string({
                required_error: "Postal_code is required",
                invalid_type_error: "Postal_code must be a string",
            })
            .min(5, {
                message: "Postal_code must be at least 5 characters",
            }).optional(),
        extras: z.string({
            required_error: "Extras is required",
            invalid_type_error: "Extras must be a string",
        })
            .min(3, {
                message: "Extras must be at least 3 characters",
            }).optional(),
        street: z.string({
            required_error: "Street is required",
            invalid_type_error: "Street must be a string",
        }).min(3, {
            message: "Street must be at least 3 characters",
        }),
        district: z.string({
            required_error: "District is required",
            invalid_type_error: "District must be a string",
        }).min(3, {
            message: "District must be at least 3 characters",
        }),
        province: z.string({
            required_error: "Province is required",
            invalid_type_error: "Province must be a string",
        }).min(3, {
            message: "Province must be at least 3 characters",
        }),
        country: z.string({
            required_error: "Country is required",
            invalid_type_error: "Country must be a string",
        }).min(2, {
            message: "Country must be at least 2 characters",
        }),
        country_code: z
            .string({
                required_error: "country_code is required",
                invalid_type_error: "country_code must be a string",
            })
            .min(2, {
                message: "country_code must be at least 2 characters",
            })
            .max(3, {
                message: "country_code maximum 3 characters",
            }),
        lat: z
            .number({
                required_error: "Lat is required",
                invalid_type_error: "Lat must be a number",
            }),
        lng: z
            .number({
                required_error: "Lng is required",
                invalid_type_error: "Lng must be a number",
            }),
    }).optional(),
    floorPlan: z.object({
        guests: z
            .number({
                required_error: "Guests is required",
                invalid_type_error: "Guests must be a number",
            })
            .min(1, {
                message: "Guests must be at least 1",
            })
            .max(16, {
                message: "Guests maximum 16",
            }),
        bedrooms: z
            .number({
                required_error: "Guests is required",
                invalid_type_error: "Guests must be a number",
            })
            .min(0, {
                message: "Bedrooms must be at least 0",
            })
            .max(50, {
                message: "Bedrooms maximum 50",
            }),
        bathrooms: z
            .number({
                required_error: "Guests is required",
                invalid_type_error: "Guests must be a number",
            })
            .min(0.5, {
                message: "Bathrooms must be at least 0.5",
            })
            .max(50, {
                message: "Bathrooms maximum 50",
            }),
        beds: z
            .number({
                required_error: "Guests is required",
                invalid_type_error: "Guests must be a number",
            })
            .min(1, {
                message: "Beds must be at least 1",
            })
            .max(50, {
                message: "Beds maximum 50",
            }),
    }).optional(),
    discounts: z.array(z.object({
        conditions: z.string().min(1),
        percent: z.number().min(1)
    })).optional(),
});

export type TUpdateUserRoomValidator = z.infer<
    typeof UpdateUserRoomValidator
>;
