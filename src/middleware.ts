import middlewares from "./middlewares";

export default middlewares()

export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
};