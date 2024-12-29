"use client"
import Button from "@/components/Button";
import Image from "@/components/Common/Image";
import { GetRoomDetail } from "@/services/room.service";
import { cn } from "@/utils/dom.util";
import { Grip } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react"

interface SlideImageProps {
    photos: GetRoomDetail["photos"]
}

const SlideImage: React.FC<SlideImageProps> = ({
    photos,
}) => {
    const slideRef = useRef<HTMLDivElement | null>(null);
    const [imageIndex, setImageIndex] = useState(1);
    const searchParams = useSearchParams();
    const router = useRouter()
    const query = useMemo(() => {
        const search = new URLSearchParams(searchParams);
        search.set("modalPhotos", "true");
        return search.toString()
    }, [searchParams])

    useEffect(() => {
        const slide = slideRef.current;
        if (!slide) return;

        const images = Array.from(slide.children) as Element[];
        const options = {
            rootMargin: "0px",
            threshold: 0.25
        } as IntersectionObserverInit;
        const callback: IntersectionObserverCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const intersectingIndex = images.indexOf(entry.target);
                    setImageIndex(intersectingIndex + 1)
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
    }, [slideRef]);

    return (
        <section
            className="relative pt-[71.3%] lg:max-h-[560px] lg:min-h-[300px] md:pt-[40%] lg:pt-[50%] -mx-4 sm:-mx-6 md:mx-0 h-auto"
            id="photos"
        >
            <div
                ref={slideRef}
                className={cn(
                    "absolute inset-0 ",
                    "scrollbar-none overflow-x-auto md:rounded-xl",
                    "md:grid md:grid-cols-4 md:grid-rows-2 md:gap-2 md:overflow-hidden",
                    "snap-x snap-mandatory flex md:snap-none"
                )}
            >
                {
                    photos.map((photo, i) => (
                        <Link
                            href={{
                                query
                            }}
                            key={i}
                            className={cn(
                                "snap-center shrink-0 w-full bg-default-300 block",
                                i === 0 && "md:col-span-2 md:row-span-2",
                                i > 4 && "md:hidden"
                            )}
                        >
                            <Image
                                src={photo.url}
                                alt={photo.id}
                                width={'100%'}
                                className="object-cover max-h-full max-w-full h-full w-full"
                                classNames={{
                                    wrapper: "h-full w-full z-0"
                                }}
                                radius="none"
                            />
                        </Link>
                    ))
                }
            </div>
            <span className="absolute md:hidden bottom-4 right-4 bg-default-900/40 text-default-50 px-3 py-1 text-[12px] font-semibold rounded">
                {imageIndex} / {photos.length}
            </span>
            <Button
                size="sm"
                startContent={
                    <Grip size={16} />
                }
                type="button"
                variant="bordered"
                className="hidden md:inline-flex absolute bg-content1 bottom-3 right-3 border-1.5 font-medium border-content1-foreground"
                disableRipple
                onPress={() => {
                    router.push("?" + query, {
                        scroll: false
                    })
                }}
            >
                Hiển thị tất cả ảnh
            </Button>
        </section>
    );
};

export default SlideImage;