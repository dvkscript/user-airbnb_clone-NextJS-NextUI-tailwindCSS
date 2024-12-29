import CookieConfig from "@/configs/cookie.config";
import HeaderConfig, { HeaderValue } from "@/configs/header.config";
import { Permissions } from "@/enum/permissions.enum";
import { refreshToken } from "@/services/auth.service";
import { getProfile } from "@/services/user.service";
import { addDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export default async function authMiddleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const pathnames = pathname.split("/").filter((p) => p);
    const refresh_token = req.cookies.get(CookieConfig.refreshToken.name)?.value || "";
    const locale = pathnames[0];
    const headers = req.headers;
    headers.set(HeaderConfig.isAuthorization.name, HeaderConfig.isAuthorization.values.false);
    headers.set(HeaderConfig.user.name, JSON.stringify(null));

    const { status, ok, message, data } = await getProfile();
    console.log("message profile: ", message);


    const homeRedirectRes = NextResponse.redirect(new URL(`/${locale}`, req.url));
    const tokenExpiredRedirectRes = NextResponse.rewrite(new URL(`/${locale}/token-expired`, req.url));
    const pathnamePrivate = ["hosting", "become-a-host"];

    if (data) {
        headers.set(HeaderConfig.user.name, JSON.stringify({
            isAdmin: data.permissions.includes(Permissions.ADMIN_ACCESS),
            full_name: data.full_name,
            email: data.email,
            profile: data.profile,
            roles: data.roles,
            permissions: data.permissions,
            created_at: data.created_at,
            updated_at: data.updated_at,
            status: data.status,
        } as HeaderValue<"user">));
    }

    const res = NextResponse.next({
        request: {
            headers
        }
    });

    if (!ok) {
        res.cookies.delete(CookieConfig.accessToken.name);
        homeRedirectRes.cookies.delete(CookieConfig.accessToken.name);
        if (status === 401) {
            if (refresh_token) {
                const result = await refreshToken(refresh_token);

                if (!result?.ok) {
                    tokenExpiredRedirectRes.cookies.delete(CookieConfig.refreshToken.name);
                    tokenExpiredRedirectRes.cookies.delete(CookieConfig.accessToken.name);

                    if (pathnamePrivate.includes(pathnames[1])) {
                        return tokenExpiredRedirectRes;
                    }
                } else {
                    res.headers.set(HeaderConfig.isAuthorization.name, HeaderConfig.isAuthorization.values.true);

                    res.cookies.set({
                        name: CookieConfig.accessToken.name,
                        value: result.data?.accessToken || "",
                        httpOnly: true,
                        expires: addDays(new Date(), 30),
                    });
                }
            } else if (pathnamePrivate.includes(pathnames[1])) {
                return tokenExpiredRedirectRes;
            }
        } else if (pathnamePrivate.includes(pathnames[1])) {
            return homeRedirectRes;
        };

        return res;
    };

    headers.set(HeaderConfig.isAuthorization.name, HeaderConfig.isAuthorization.values.true);

    return null;
}