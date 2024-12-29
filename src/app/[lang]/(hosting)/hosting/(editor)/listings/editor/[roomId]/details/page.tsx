"use client"
import BreakpointConfig from "@/configs/breakpoints.config";
import useUrl from "@/hooks/useUrl";
import useWindowEvent from "@/hooks/useWindowEvent";
import { useRouter } from "next-nprogress-bar";
import { useLayoutEffect } from "react"

const Page = ({ }) => {
    const { screen } = useWindowEvent();
    const { pathname } = useUrl();
    const router = useRouter();

    useLayoutEffect(() => {
        if (screen && screen.minWidth >= BreakpointConfig.lg.minWidth) {
            router.replace(pathname + "/photo-tour")
        }
    }, [pathname, router, screen]);

    return (null);
};

export default Page;