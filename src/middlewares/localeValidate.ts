import ApiRouter from "@/configs/apiRouter.config";
import CookieConfig from "@/configs/cookie.config";
import { defaultLocale } from "@/configs/valueDefault.config";
import { getLocales, Locale } from "@/libs/dictionary.lib";
import { NextRequest, NextResponse } from "next/server";

export default async function localeValidate(req: NextRequest): Promise<NextResponse | null> {
    const { pathname, search } = req.nextUrl;
    const pathnames = pathname.split("/").filter((p) => p);

    const locale = req.cookies.get(CookieConfig.locale.name)?.value ?? defaultLocale;
    const localeCodes = await getLocales();
    const isLocale = localeCodes.includes(pathnames[0] as Locale);

    const socialRouterCallback = Object.values(ApiRouter.auth.providers).map((p) => p.callback);
    const isPathnameCallback = socialRouterCallback.includes(pathname);
    
    if (
        !isLocale &&
        !pathname.startsWith(`/image`) &&
        !isPathnameCallback
    ) {
        return NextResponse.redirect(new URL(`/${locale}${pathname}${search}`, req.url));
    }

    return null;
}