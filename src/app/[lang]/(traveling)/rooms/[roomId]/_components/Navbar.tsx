"use client"
import Button from "@/components/Button";
import Container from "@/components/Common/Container";
import useDictionary from "@/hooks/useDictionary";
import useWindowEvent from "@/hooks/useWindowEvent";
import { cn, formatPrice } from "@/utils/dom.util";
import { Divider } from "@nextui-org/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next-nprogress-bar";
import { useParams } from "next/navigation";
import useRoomStore from "@/hooks/useRoomStore";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";

interface NavbarProps {
    basePrice: number;
    discountedNightPrice: number;
    setIsPopoverDateRanger: (isOpen: boolean) => void;
};

const Navbar = ({
    basePrice,
    discountedNightPrice,
    setIsPopoverDateRanger
}: NavbarProps) => {
    const { scrollY } = useWindowEvent();
    const [sectionIndex, setSectionIndex] = useState(0);
    const navbarRef = useRef<HTMLDivElement | null>(null);
    const { t } = useDictionary("rooms", d => d.navbar.items);
    const btnMsg = useDictionary("common", d => d.buttons).t;
    const unitMsg = useDictionary("common", d => d.units.items).t;
    const bookingMsg = useDictionary("rooms", d => d.booking).d;
    const router = useRouter();
    const roomId = useParams()?.roomId;
    const { bookForm } = useRoomStore(bookingRoomSelector);

    const items = useMemo(() => ([
        {
            id: "photos",
            text: t("Photos")
        },
        {
            id: "amenities",
            text: t("Amenities")
        },
        {
            id: "reviews",
            text: t("Reviews")
        },
        {
            id: "location",
            text: t("Location")
        },
    ]), [t]);

    const handleNavClick = useCallback((item: typeof items[number], space: number = 1) => {
        const section = document.querySelector(`section#${item.id}`);
        if (!section || !navbarRef.current) return;
        const offset = navbarRef.current.offsetHeight;
        const top = section.getBoundingClientRect().top + window.scrollY - offset + space;
        window.scrollTo({ top, behavior: 'smooth' });
    }, []);

    const handleBookClick = useCallback(() => {
        if (!bookForm.dates) {
            handleNavClick({
                id: "book-form",
                text: "test"
            }, -10);

            // Lắng nghe sự kiện scroll
            const handleScrollStop = (() => {
                let scrollTimeout: NodeJS.Timeout;

                return () => {
                    clearTimeout(scrollTimeout);

                    // Đặt lại timeout để phát hiện cuộn dừng
                    scrollTimeout = setTimeout(() => {
                        // Khi cuộn dừng
                        setIsPopoverDateRanger(true);

                        // Xoá listener để không ảnh hưởng hiệu suất
                        window.removeEventListener("scroll", handleScrollStop);
                    }, 30); // Thời gian (ms) để xác định cuộn dừng
                };
            })();

            // Gắn listener
            window.addEventListener("scroll", handleScrollStop);
            return;
        } else {
            const search = new URLSearchParams();
            search.set("guests", `${bookForm.guests}`)
            search.set("checkin", `${bookForm.dates.start.toString()}`)
            search.set("checkout", `${bookForm.dates.end.toString()}`)
            search.set("numberOfAdults", `${bookForm.adults}`)
            search.set("numberOfChildren", `${bookForm.children}`)
            search.set("numberOfInfants", `${bookForm.infants}`)
            search.set("numberOfPets", `${bookForm.pets}`)
            router.push(`/book/stays/${roomId}?${search.toString()}`)
        }

    }, [bookForm, handleNavClick, setIsPopoverDateRanger, router, roomId]);


    useEffect(() => {
        const main = document.querySelector("main");
        const mainInner = main?.children[0]?.children[0];
        if (!mainInner) return;
        const elements = Array.from(mainInner.children) as HTMLElement[];

        const currentItemIndex = elements.findIndex((element) => {
            const top = scrollY;
            const offset = element.offsetTop - 100;
            const height = element.offsetHeight;

            return top >= offset && top < offset + height;
        });
        setSectionIndex(currentItemIndex);
    }, [scrollY]);

    return (
        <div
            className={cn(
                "bg-inherit fixed top-0 inset-x-0 h-20 z-50",
                sectionIndex > 1 ? "block" : "hidden"
            )}
            ref={navbarRef}
        >
            <Container className="bg-inherit" maxWidth={1280}>
                <div className="w-full h-full flex justify-start items-center">
                    <nav className="h-full">
                        <ul className="flex items-center justify-start gap-x-5 text-sm font-medium h-full">
                            {
                                items.map((item, index) => (
                                    <li
                                        className="h-full"
                                        key={index}
                                    >
                                        <button
                                            className={cn(
                                                "h-full relative inline-block text-center py-[30px]",
                                                "after:content-[''] after:absolute after:bg-default-800 after:w-full after:h-1 after:bottom-0 after:left-0 after:hidden after:hover:block"
                                            )}
                                            onClick={() => handleNavClick(item)}
                                        >
                                            {item.text}
                                        </button>
                                    </li>
                                ))
                            }
                        </ul>
                    </nav>
                    {
                        sectionIndex > 2 && (
                            <div className="ml-auto flex justify-between items-center gap-x-4">
                                <div>
                                    {
                                        !!bookForm.dates ? (
                                            <>
                                                {
                                                    discountedNightPrice !== 0 && (
                                                        <span className="mr-2 font-medium text-accent line-through">
                                                            {formatPrice(basePrice)}
                                                        </span>
                                                    )
                                                }
                                                <span className="underline">
                                                    <span className="font-medium">
                                                        {formatPrice(discountedNightPrice !== 0 ? discountedNightPrice : basePrice)}
                                                    </span>
                                                    {' '}
                                                    <span>
                                                        {unitMsg("night")}
                                                    </span>
                                                </span>

                                            </>
                                        ) : (
                                            <span>
                                                {bookingMsg?.titles.add}
                                            </span>
                                        )
                                    }

                                </div>
                                <Button
                                    onPress={handleBookClick}
                                    size="lg"
                                    color="primary"
                                    className="font-medium"
                                    radius="sm"
                                >
                                    {
                                        !bookForm.dates ? btnMsg("Check availability") : btnMsg("Reserve")
                                    }
                                </Button>
                            </div>
                        )
                    }
                </div>
            </Container >
            <Divider />
        </div >
    );
};

export default Navbar;