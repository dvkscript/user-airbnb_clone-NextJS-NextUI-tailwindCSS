"use client"
import Container from "@/components/Common/Container";
import Icons from "@/components/Common/Icons";
import BreakpointConfig from "@/configs/breakpoints.config";
import { ModalMode } from "@/enum/modalMode";
import useDictionary from "@/hooks/useDictionary";
import useModal from "@/hooks/useModal";
import useUrl from "@/hooks/useUrl";
import useWindowEvent from "@/hooks/useWindowEvent";
import { Dictionary } from "@/libs/dictionary.lib";
import { cn } from "@/utils/dom.util";
import { Divider } from "@nextui-org/react";
import { CircleUserRound, Heart, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useMemo } from "react"

interface MobileNavbarTravelingProps {
    isAuthorization: boolean
}

const MobileNavbarTraveling: React.FC<MobileNavbarTravelingProps> = ({
    isAuthorization,
}) => {
    const { screen, isScrollingDown, isScroll } = useWindowEvent();
    const { t } = useDictionary<"common", Dictionary["common"]["mobile"]["navbar"]>("common", d => d.mobile.navbar);
    const { replacePath } = useUrl();
    const lang = useParams()?.lang;
    const pathname = useMemo(() => (replacePath(`/${lang}`, "") || "/"), [replacePath, lang]);
    const { onModal } = useModal()

    const handleSignIn = useCallback(() => {
        onModal({
            mode: ModalMode.AUTH_SIGN_IN
        })
    },[onModal])

    const navbar = useMemo(() => (
        [
            {
                href: "/",
                icon: <Search className="inline-block" />,
                name: t("Explore")
            },
            {
                href: "/wishlists",
                icon: <Heart className="inline-block" />,
                name: t("Wishlists")
            },
            {
                href: "/trips/v1",
                icon: <Icons.logo height={24} width={24} className="inline-block" />,
                name: t("Trips")
            },
            {
                href: "/guest/messages",
                icon: <Icons.message height={24} width={24} className="inline-block" />,
                name: t("Messages")
            },
            {
                href: "/account-settings",
                icon: <CircleUserRound className="inline-block" strokeWidth={1.6} />,
                name: t("Profile"),
                isBtn: !isAuthorization
            },
        ]
    ), [t, isAuthorization]);

    if (screen && screen.name !== BreakpointConfig.md.name || pathname.startsWith("/rooms")) {
        return null;
    };

    return (
        <div
            className={cn(
                "md:hidden w-full bg-inherit transition-height",
                isScrollingDown && isScroll ? "h-0" : "h-[4.35rem]"
            )}
        >
            <Divider />
            <Container>
                <nav className="w-full py-3 text-accent">
                    <ul className="flex justify-between items-center w-full">
                        {
                            navbar.map((item, i) => (
                                <li
                                    key={i}
                                    className={cn(
                                        "flex-1 text-center transition-colors h-full inline-block",
                                        pathname === item.href && "text-primary"
                                    )}
                                >
                                    {
                                        item.isBtn ? (
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-full h-full bg-none text-inherit block",
                                                )}
                                                onClick={handleSignIn}
                                            >
                                                {item.icon}
                                                <span className="block mt-[5px] text-[10px] font-medium" >
                                                    {item.name}
                                                </span>
                                            </button>
                                        ) : (
                                            <Link
                                                href={item.href}
                                            >
                                                {item.icon}
                                                <span className="block mt-[5px] text-[10px] font-medium">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        )
                                    }
                                </li>
                            ))
                        }
                    </ul>
                </nav>
            </Container>
        </div >
    );
};

export default MobileNavbarTraveling;