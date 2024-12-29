import HeaderConfig, { HeaderValue } from "@/configs/header.config";
import { headers } from "next/headers";

export const getHeaderValue = <Name extends keyof typeof HeaderConfig>(name: Name): HeaderValue<Name> => {
    const value = headers().get(HeaderConfig[name].name);
    return value ? JSON.parse(value) : null;
}