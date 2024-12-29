"use client"
import Container from "@/components/Common/Container";
import Icons from "@/components/Common/Icons";
import BreakpointConfig from "@/configs/breakpoints.config";
import useDictionary from "@/hooks/useDictionary";
import useUrl from "@/hooks/useUrl";
import useWindowEvent from "@/hooks/useWindowEvent";
import { Dictionary } from "@/libs/dictionary.lib";
import { cn } from "@/utils/dom.util";
import { Divider } from "@nextui-org/react";
import { AlignJustify } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useMemo } from "react"

const MobileNavbarHosting = ({ }) => {
    const { isScrollingDown, isScroll, screen } = useWindowEvent();
    const { t } = useDictionary<"common", Dictionary["common"]["mobile"]["navbar"]>("common", d => d.mobile.navbar);
    const { replacePath } = useUrl();
    const lang = useParams()?.lang;
    const pathname = useMemo(() => (replacePath(`/${lang}`, "") || "/"), [replacePath, lang]);

    const navbar = useMemo(() => (
        [
            {
                href: "/hosting",
                icon: <Icons.houseCheck className="inline-block text-inherit" />,
                name: t("Today")
            },
            {
                href: "#!",
                icon: <Icons.calendar width={24} height={24} className="inline-block text-inherit" />,
                name: t("Calendar")
            },
            {
                href: "/hosting/listings",
                icon: <Icons.houseBuilding height={24} width={24} className="inline-block text-inherit" />,
                name: t("Listings")
            },
            {
                href: "/guest/messages",
                icon: <Icons.message className="inline-block text-inherit" />,
                name: t("Messages")
            },
            {
                icon: <AlignJustify className="inline-block text-inherit" />,
                name: t("Menu"),
                onClick: () => { }
            },
        ]
    ), [t]);
    
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
            <Container className="min-w-fit">
                <nav className="w-full py-3 text-accent">
                    <ul className="flex justify-between items-center w-full max-w-full gap-x-3">
                        {
                            navbar.map((item, i) => (
                                <li
                                    key={i}
                                    className={cn(
                                        "flex-1 text-center transition-colors h-full inline-block w-full max-w-full",
                                        pathname === item.href ? "text-primary" : "text-default-600"
                                    )}
                                >
                                    {
                                        item.href ? (
                                            <Link
                                                href={item.href}
                                                className="text-inherit"
                                            >
                                                {item.icon}
                                                <span className="block mt-[5px] text-[10px] font-medium truncate w-full max-w-full">
                                                    {item.name}
                                                </span>
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                className={cn(
                                                    "w-full h-full bg-none text-inherit block",
                                                )}
                                                onClick={item.onClick}
                                            >
                                                {item.icon}
                                                <span className="block mt-[5px] text-[10px] font-medium truncate w-full" >
                                                    {item.name}
                                                </span>
                                            </button>
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

export default MobileNavbarHosting;