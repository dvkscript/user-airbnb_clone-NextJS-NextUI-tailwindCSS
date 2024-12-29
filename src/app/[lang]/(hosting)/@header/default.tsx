"use client";
import Icons from "@/components/Common/Icons";
import HeaderUserMenu from "@/components/Layout/Header/HeaderUserMenu";
import BreakpointConfig from "@/configs/breakpoints.config";
import useDictionary from "@/hooks/useDictionary";
import useUrl from "@/hooks/useUrl";
import useWindowEvent from "@/hooks/useWindowEvent";
import { Dictionary } from "@/libs/dictionary.lib";
import { cn } from "@/utils/dom.util";
import Link from "next/link";
import React from "react"

const HeaderDefault = ({ }) => {

    const { screen } = useWindowEvent()

    const { t } = useDictionary<"common", Dictionary["common"]["header"]["navbar"]>("common", d => d.header.navbar);
    const { pathnames } = useUrl();

    const listEl = [
        {
            path: "",
            name: t("Today")
        },
        {
            path: "listings",
            name: t("Listings")
        },
        {
            path: "messages",
            name: t("Messages")
        },
    ];

    if (screen && screen.minWidth < BreakpointConfig.md.minWidth) return null;

    return (
        <header className="hidden md:block px-5 border-b-1.5 sticky top-0 z-50 bg-white dark:bg-neutral-800 flex-shrink-0">
            <div className="flex justify-start xl:justify-between items-center gap-x-3">
                <div className="text-left">
                    <Link
                        href={"/"}
                        className='w-fit p-4 inline-block align-middle'
                    >
                        <Icons.logo />
                    </Link>
                </div>
                <ul className={cn("flex h-full font-medium w-fit")}>
                    {
                        listEl.map((item, index) => (
                            <li key={index}>
                                <Link
                                    href={item.path ? `/hosting/${item.path}` : "/hosting/"}
                                    className={cn(
                                        'relative py-2 px-5 rounded-full block',
                                        ((pathnames[2] || "") === item.path) ? "text-default-800" : "text-default-500 hover:bg-default-50"
                                    )}
                                >
                                    {item.name}
                                    {
                                        ((pathnames[2] || "") === item.path) && (
                                            <span className='absolute w-[20px] h-[2px] bg-default-900 bottom-0 left-[50%] translate-x-[-50%]'></span>
                                        )
                                    }
                                </Link>
                            </li>
                        ))
                    }
                    <li>
                        <div
                            className={cn(
                                'relative py-2 px-5 rounded-full text-default-500 hover:bg-default-200 inline-block',
                            )}
                        >
                            {t("Menu")}
                        </div>
                    </li>
                </ul>
                <div className="text-right ml-auto xl:ml-0 w-fit">
                    <div
                        className='w-fit inline-block align-middle'
                    >
                        <HeaderUserMenu isIcon={false} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default HeaderDefault;