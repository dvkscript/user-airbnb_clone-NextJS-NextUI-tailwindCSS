"use client"
import Container from "@/components/Common/Container";
import Icons from "@/components/Common/Icons";
import HeaderButtonGroup from "@/components/Layout/Header/HeaderButtonGroup";
import HeaderControl from "@/components/Layout/Header/HeaderControl";
import HeaderSearchForm from "@/components/Layout/Header/HeaderSearchForm";
import HeaderSearchModal from "@/components/Layout/Header/HeaderSearchModal";
import HeaderUserMenu from "@/components/Layout/Header/HeaderUserMenu";
import BreakpointConfig from "@/configs/breakpoints.config";
import useUrl from "@/hooks/useUrl";
import useWindowEvent from "@/hooks/useWindowEvent";
import { cn } from "@/utils/dom.util";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useMemo } from "react"

const HeaderClient = ({ }) => {
    const { screen } = useWindowEvent();
    const { pathnames } = useUrl();
    const params = useParams();

    const headerMobile = useMemo(() => {
        if (screen && screen.minWidth >= BreakpointConfig.md.minWidth || !!pathnames[1]) {
            return null;
        }

        return (
            <div
                className={cn(
                    `md:hidden py-4 flex gap-x-3 justify-between items-center`
                )}
            >
                <HeaderSearchModal />
                <HeaderControl />
            </div>
        );
    }, [screen, pathnames])

    const headerTabletAndPC = useMemo(() => {
        if (screen && screen.minWidth < BreakpointConfig.md.minWidth) {
            return null
        };

        return (
            <div
                className={cn(
                    "hidden w-full md:flex flex-row items-start justify-start lg:justify-between gap-3 py-4 bg-inherit",
                )}
            >
                <div className='flex justify-start py-2 z-10'>
                    <Link
                        href={`/${params.lang}`}
                        className='z-[1]'
                    >
                        <Icons.logoFull className='text-primary hidden lg:inline-block' />
                        <Icons.logo className='text-primary lg:hidden' />
                    </Link>
                </div>
                {
                    (!pathnames[1] || pathnames[1] === "rooms") && (
                        <>
                            <HeaderSearchForm
                                duration={400}
                            />
                            <div className='flex justify-end z-10 ml-auto xl:ml-0'>
                                <div className="relative">
                                    <div className="flex flex-row items-center gap-x-2">
                                        <HeaderButtonGroup />

                                        <HeaderUserMenu />
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
        );
    }, [params.lang, screen, pathnames])

    return (
        <header
            className={cn(
                "sticky top-0 w-full z-50 bg-inherit",
            )}
            style={{
                position: !pathnames[1] ? "sticky" : "static",
            }}
        >
            <div className="w-full relative z-20 bg-inherit border-b">
                <Container className="bg-inherit">
                    {headerMobile}
                    {headerTabletAndPC}
                </Container>
            </div>
        </header>
    );
};

export default HeaderClient;