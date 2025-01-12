import CookieConfig from "@/configs/cookie.config";
import { defaultLocale } from "@/configs/valueDefault.config";
import { RoomStatus } from "@/enum/room";
import { roomCreationPathnames } from "@/hooks/stores/roomStore";
import { getUserRoom } from "@/services/user.service";
import { addDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import localeValidate from "./localeValidate";
import authMiddleware from "./auth";
import HeaderConfig from "@/configs/header.config";

export default function middlewares() {
    return async function middleware(req: NextRequest) {
        const { pathname, href, origin } = req.nextUrl;
        const pathnames = pathname.split("/").filter((p) => p);
        const locale = req.cookies.get(CookieConfig.locale.name)?.value ?? defaultLocale;

        const localeRes = await localeValidate(req);

        if (localeRes) return localeRes;

        const authRes = await authMiddleware(req);

        if (!!authRes) {
            authRes.cookies.set({
                name: CookieConfig.locale.name,
                value: pathnames[0],
                httpOnly: CookieConfig.locale.httpOnly,
                expires: CookieConfig.locale.expires,
            })
            return authRes;
        }

        const notFoundRedirectRes = NextResponse.rewrite(new URL(`/${locale}/not-found`, req.url));

        if (pathnames[1] === "become-a-host") {
            const roomId = pathnames[2];
            if (roomId && roomId !== "overview") {
                const result = await getUserRoom(roomId);
                if (result.status === 404) {
                    return notFoundRedirectRes;
                } else if (result.ok) {
                    const tasks = roomCreationPathnames(roomId);
                    const room = result.data;
                    const roomStatus = room?.statusText;

                    const task = pathnames[3];
                    if (task) {
                        if (roomStatus?.startsWith(`${RoomStatus.CREATING}-`)) {
                            const taskName = roomStatus.replace(`${RoomStatus.CREATING}-`, "");
                            const taskNames = tasks.map(t => t.name);
                            const taskNameValidate = taskNames.slice(0, taskNames.indexOf(taskName) + 2);

                            if (!taskNames.includes(task)) {
                                return notFoundRedirectRes;
                            }

                            if (!taskNameValidate.includes(task)) {
                                return NextResponse.redirect(new URL(`/${locale}/${tasks[taskNameValidate.length - 2].pathname}`, req.url))
                            }
                        } else {
                            return notFoundRedirectRes;
                        }
                    }
                }
            }
        }

        req.headers.set(HeaderConfig.nextUrl.name, JSON.stringify({
            pathname,
            fullUrl: href,
            origin
        }))

        const response = NextResponse.next({
            request: {
                headers: req.headers,
            },
        });

        response.cookies.set({
            name: CookieConfig.locale.name,
            value: pathnames[0],
            httpOnly: CookieConfig.locale.httpOnly,
            expires: CookieConfig.locale.expires,
        })

        if (!pathname.startsWith(`/image`) && !pathname.startsWith(`/auth/`)) {
            response.cookies.set({
                name: "locale",
                value: pathnames[0],
                httpOnly: true,
                expires: addDays(new Date(), 100),
            });
        }

        return response;
    };
}