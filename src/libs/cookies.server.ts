"use server";
import { addDays } from "date-fns";
import { CookieListItem } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers"

type CookieProps = {
    httpOnly?: boolean
} & CookieListItem;

export const getCookie = async (name: string) => {
    const cookieStore = cookies();

    const cookie = cookieStore.get(name)?.value || "";
    return cookie
};

export const setCookie = async (cookie: CookieProps) => {
    const cookieStore = cookies();
    cookieStore.set(cookie)
}
export const deleteCookie = async (name: string) => {
    const cookieStore = cookies();
    cookieStore.delete(name)
}
export const deleteCookies = async (name: string[]) => {
    const cookieStore = cookies();
    name.forEach((n) => {
        cookieStore.delete(n)
    })
}

type SetCookies = (values: { name: string, value: string }[], option?: Omit<CookieProps, "value" | "name">) => void

export const setCookies: SetCookies = async (
    values,
    option = {}
) => {
    const cookieStore = cookies();

    values.forEach((v) => {
        cookieStore.set({
            expires: option?.expires ? option.expires : addDays(new Date(), 30),
            path: option?.path ? option.path : "/",
            ...option,
            name: v.name,
            value: v.value,
        })
    })
}