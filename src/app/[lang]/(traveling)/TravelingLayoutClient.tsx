"use client"
import Button from "@/components/Button";
import MobileNavbarTraveling from "@/components/Layout/Mobile/MobileNavbarTraveling";
import BreakpointConfig from "@/configs/breakpoints.config";
import useUrl from "@/hooks/useUrl";
import useWindowEvent from "@/hooks/useWindowEvent";
import { cn } from "@/utils/dom.util";
import { Logs, Map } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface TravelingLayoutClientProps {
    children: React.ReactNode;
    isAuthorization: boolean
}

const TravelingLayoutClient: React.FC<TravelingLayoutClientProps> = ({
    children,
    isAuthorization
}) => {

    const { pathnames } = useUrl();
    const searchParams = useSearchParams();
    const drawerOpen = JSON.parse(searchParams.get("drawer_open") === "true" ? "true" : "false");
    const router = useRouter();
    const { screen, scrollY } = useWindowEvent();
    const [isBtnHidden, setIsBtnHidden] = useState(false);
    const mainRef = useRef<HTMLElement | null>(null);

    const isMobileScreen = useMemo(() => screen && screen.name === BreakpointConfig.md.name, [screen]);

    const handleBtnClick = useCallback(() => {
        const newSearchParams = new URLSearchParams(searchParams);
        if (drawerOpen) {
            newSearchParams.set("drawer_open", "false")
        } else {
            newSearchParams.set("drawer_open", "true")
        }
        router.replace(`?${newSearchParams.toString()}`, {
            scroll: false
        });
    }, [drawerOpen, router, searchParams]);

    useEffect(() => {
        const main = document.querySelector("main");
        if (!main) return;
        mainRef.current = main;
    }, [scrollY]);

    useEffect(() => {
        const main = mainRef.current;
        if (!main) return;
        const top = scrollY;
        const offset = main.offsetTop + main.offsetHeight - (document.documentElement.clientHeight + 80);
        setIsBtnHidden(top >= offset)
    }, [scrollY])

    return (
        <div
            className='bg-inherit'
            style={{
                overflowAnchor: "none"
            }}
        >
            {children}
            <div className={cn(
                "fixed inset-x-0 bottom-0 h-fit bg-inherit z-50 transition-height",
            )}>
                {!!pathnames[1] ? null : <>
                    <Button
                        className={cn(
                            'mb-9 gap-x-1 absolute bottom-full left-1/2 -translate-x-1/2 font-semibold hover:opacity-100 hover:scale-105 active:scale-95 shadow-md bg-neutral-800 text-white',
                            "transition-opacity",
                            isMobileScreen ? "text-xs" : "text-sm",
                            (isBtnHidden && !drawerOpen) ? "invisible opacity-0 delay-300 translate-y-1/2" : "visible opacity-100"
                            // (isMobileScreen && !isScroll) ?
                            //     "opacity-0 translate-y-1/2" :
                            //     "opacity-100",
                        )}
                        radius='full'
                        size={isMobileScreen ? 'md' : "lg"}
                        disableRipple
                        endContent={
                            <span>
                                {
                                    drawerOpen ? <Logs size={isMobileScreen ? 14 : 18} /> : <Map size={isMobileScreen ? 16 : 22} />
                                }
                            </span>
                        }
                        onPress={handleBtnClick}
                    >
                        {
                            drawerOpen ? "Hiển thị danh sách" : "Bản đồ"
                        }
                    </Button>
                </>}
                <MobileNavbarTraveling isAuthorization={isAuthorization} />
            </div>
        </div>
    );
};

export default TravelingLayoutClient;