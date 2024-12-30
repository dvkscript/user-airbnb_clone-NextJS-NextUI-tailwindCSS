
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
});

type HeaderConfigType = typeof HeaderConfig;

export type HeaderValue<Name extends keyof HeaderConfigType> =
    Name extends "isAuthorization"
    ? boolean
    : Name extends "nextUrl"
    ? Record<string, string>
    : never;


export default HeaderConfig;