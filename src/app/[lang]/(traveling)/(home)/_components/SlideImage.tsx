"use client"
import Image from "@/components/Common/Image";
import { GetRoomAndCountAll } from "@/services/room.service";
import { cn } from "@/utils/dom.util";
import { Button } from "@nextui-org/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react"

interface SlideImageProps {
    photos: GetRoomAndCountAll["rows"][number]["photos"];
    href: string;
    className?: string;
}

const SlideImage: React.FC<SlideImageProps> = ({
    photos,
    href,
    className
}) => {
    const imgContainerRef = useRef<HTMLDivElement | null>(null);
    const imagesRef = useRef<Element[] | null>(null);
    const dotContainerRef = useRef<HTMLDivElement | null>(null);
    const [imgCurrentIndex, setImgCurrentIndex] = useState(0)

    const handleSlideChange = useCallback((value: "next" | "previous") => {
        const div = imgContainerRef.current as HTMLDivElement | null;
        if (div) {
            div.scrollBy({
                left: value === "previous" ? -div.clientWidth : div.clientWidth,
                behavior: 'smooth'
            })
        }
    }, [imgContainerRef]);

    useEffect(() => {
        const imgContainer = imgContainerRef.current as HTMLDivElement | null;
        const dotContainer = dotContainerRef.current as HTMLDivElement | null;

        if (imgContainer && dotContainer) {
            imagesRef.current = Array.from(imgContainer.children)
            const images = imagesRef.current;
            const dots = Array.from(dotContainer.children) as HTMLDivElement[];

            const activateIndicator = (index: number) => {
                dots.forEach((dot, i) => {
                    if (i === index) {
                        dot.style.opacity = "1";
                        const offsetLeft = dot.offsetLeft;
                        const dotContainerCenter = dotContainer.clientWidth / 2;
                        const dotCenter = dot.offsetWidth / 2;
                        const targetScrollLeft = offsetLeft - dotContainerCenter + dotCenter;

                        dotContainer.scrollTo({
                            left: targetScrollLeft,
                            behavior: "smooth"
                        });
                    } else {
                        dot.style.opacity = "0.5";
                    }
                });
            }

            const options = {
                rootMargin: "0px",
                threshold: 0.25
            } as IntersectionObserverInit;

            const callback: IntersectionObserverCallback = (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const intersectingIndex = images.indexOf(entry.target);
                        activateIndicator(intersectingIndex);
                        setImgCurrentIndex(intersectingIndex)
                    }
                });
            };

            const observer = new IntersectionObserver(callback, options);
            images.forEach((item) => {
                observer.observe(item);
            });

            return () => {
                images.forEach((item) => observer.unobserve(item));
            };
        }
    }, [imgContainerRef, dotContainerRef]);

    return (
        <div
            className={cn(
                "relative w-full h-full group overflow-hidden",
                className
            )}
        >
            <div
                ref={imgContainerRef}
                className="w-full h-full snap-mandatory snap-x flex gap-0 overflow-x-auto scrollbar-none outline-none"
                tabIndex={-1}
            >
                {
                    photos.map((photo) => (
                        <Link
                            key={photo.id}
                            href={href}
                            className="w-full h-full inline-block snap-center flex-shrink-0"
                            target="_blank"
                        >
                            <picture
                                className="h-full w-full"
                            >
                                <Image
                                    radius="none"
                                    width="100%"
                                    alt={"room photo"}
                                    className="w-full object-cover z-0 inset-0 h-full"
                                    src={photo.url}
                                    classNames={{
                                        wrapper: "w-full h-full"
                                    }}
                                />
                            </picture>
                        </Link>
                    ))
                }
            </div>
            <div ref={dotContainerRef} className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-x-1.5 overflow-x-auto w-[60px] scrollbar-none">
                {
                    Array.from({ length: photos.length }).map((_, i) => (
                        <span
                            key={i}
                            className={cn(
                                "p-[3px] h-fit rounded-full bg-white cursor-pointer"
                            )}
                            onClick={() => {
                                if (!imagesRef.current) return;
                                const images = imagesRef.current;
                                const image = images[i];
                                image.scrollIntoView({
                                    behavior: "smooth", block: "nearest", inline: "start"
                                })
                            }}
                        />
                    ))
                }
            </div>
            <Button
                isIconOnly
                size="sm"
                radius="full"
                variant="bordered"
                disableRipple
                onPress={() => handleSlideChange("previous")}
                className={cn(
                    "absolute top-1/2 -translate-y-1/4 left-3 p-1.5 bg-default-50 border-1 opacity-0 transition-opacity invisible",
                    imgCurrentIndex > 0 && "group-hover:opacity-100 group-hover:visible"
                )}
            >
                <ChevronLeft strokeWidth={3} className="text-default-500" />
            </Button>
            <Button
                isIconOnly
                size="sm"
                disableRipple
                radius="full"
                variant="bordered"
                onPress={() => handleSlideChange("next")}
                className={cn(
                    "absolute top-1/2 -translate-y-1/4 right-3 p-1.5 bg-default-50 border-1 opacity-0 transition-opacity invisible",
                    imgCurrentIndex < photos.length - 1 && "group-hover:opacity-100 group-hover:visible"
                )}
            >
                <ChevronRight strokeWidth={3} className="text-default-500" />
            </Button>
        </div>
    )
};

export default SlideImage;