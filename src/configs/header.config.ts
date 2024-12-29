import { GetProfile } from "@/services/user.service";

const HeaderConfig = Object.freeze({
    isAuthorization: {
        name: "isAuthorization",
        values: {
            true: "true",
            false: "false"
        }
    },
    nextUrl: {
        name: "x-next-url",
        values: null
    },
    user: {
        name: "x-user",
        values: null,
    }
});

type HeaderConfigType = typeof HeaderConfig;

export type HeaderValue<Name extends keyof HeaderConfigType> =
    Name extends "isAuthorization"
    ? boolean
    : Name extends "nextUrl"
    ? Record<string, string>
    : Name extends "user"
    ? Omit<GetProfile, "id"> & { isAdmin: boolean } | null
    : never;


export default HeaderConfig;