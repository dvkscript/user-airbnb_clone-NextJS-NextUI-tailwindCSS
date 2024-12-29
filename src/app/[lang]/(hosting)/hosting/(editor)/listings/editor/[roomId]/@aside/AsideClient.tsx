"use client"
import Button from "@/components/Button";
import { ArrowLeft, Dot } from "lucide-react";
import React, { useMemo } from "react"
import CardItem from "../_components/CardItem";
import Image from "@/components/Common/Image";
import { Chip } from "@nextui-org/react";
import useUrl from "@/hooks/useUrl";
import { cn, formatPrice } from "@/utils/dom.util";
import { useRouter } from "next-nprogress-bar";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import { GetUserRoom } from "@/services/user.service";
import { Discount } from "@/enum/room";

interface AsideClientProps {
    params: {
        roomId: string;
        lang: string;
    },
    room: GetUserRoom;
}

const AsideClient: React.FC<AsideClientProps> = ({
    params: {
        lang,
        roomId
    },
    room
}) => {

    const { pathnames } = useUrl();
    const router = useRouter();
    const { t, p } = useDictionary<"hosting", Dictionary["hosting"]["listings"]["editor"]["aside"]["items"]>("hosting", d => d.listings.editor.aside.items);
    const photos = useMemo(() => room.photos, [room]);
    const discounts = useMemo(() => room.discounts.reduce((acc: Record<string, typeof room.discounts[number]>, item) => {
        acc[item.conditions as string] = {
            ...item
        }; 
        return acc;
    }, {}), [room]);

    const hrefDefault = `/${lang}/hosting/listings/editor/${roomId}/details`;

    return (
        <aside className={cn(
            "xl:w-fit flex-col w-full h-full max-h-full lg:ml-20",
            !!pathnames[6] ? "hidden lg:flex" : "flex"
        )}>
            <header className="relative mt-5 md:mt-16 mb-5 text-left flex items-center gap-x-2 justify-between w-full px-5 md:px-[4.75rem] lg:px-8 xl:px-[4.75rem]">
                <Button
                    radius="full"
                    isIconOnly
                    variant="flat"
                    className="h-11 w-11 min-w-11 lg:absolute lg:-left-6 xl:left-0 md:mr-4"
                    onPress={() => {
                        router.push("/hosting/listings")
                    }}
                >
                    <ArrowLeft />
                </Button>
                <h1 className="text-wrap font-medium text-lg md:text-4xl w-fit text-center sm:text-left">
                    {p.listings.editor.aside.title}
                </h1>
                <div className="w-11 lg:absolute" />
            </header>
            <div className="overflow-x-hidden overflow-y-auto flex-1 relative min-w-[250px] xl:min-w-[559px] w-full max-h-full">
                <div className="pt-4 flex flex-col w-full gap-y-4 pb-[7.5rem] px-5 md:px-[4.75rem] lg:px-8 xl:px-[4.75rem]">
                    <CardItem
                        title={t("Photo tour")}
                        href={`${hrefDefault}/photo-tour`}
                    >
                        <div className="flex justify-start items-center gap-x-0 text-accent">
                            <span className="text-inherit">
                                {room?.floorPlan?.bedrooms} {t("Bedrooms")}
                            </span>
                            <Dot className="text-inherit" size={16} />
                            <span className="text-inherit">
                                {room?.floorPlan?.beds} {t("Beds")}
                            </span>
                            <Dot className="text-inherit" size={16} />
                            <span className="text-inherit">
                                {room?.floorPlan?.bathrooms} {t("Bathrooms")}
                            </span>
                        </div>
                        <div className="pt-8 px-[30px]">
                            <div className="flex justify-center relative max-w-80 mx-auto">
                                {!room ? (
                                    <>
                                        <div className="w-fit z-10 relative">
                                            <Image
                                                src={""}
                                                isLoading
                                                alt={"image loading..."}
                                                height={160}
                                                width={160}
                                                className="object-cover min-w-[160px] shadow"
                                            />
                                        </div>
                                        <Image
                                            src={""}
                                            isLoading
                                            alt="image loading..."
                                            height={140}
                                            width={140}
                                            className="object-cover "
                                            classNames={{
                                                wrapper: "absolute left-0 bottom-1.5 z-0 rotate-[-5deg] shadow-lg shadow-black/40"
                                            }}
                                        />
                                        <Image
                                            src={""}
                                            isLoading
                                            alt="image loading..."
                                            height={140}
                                            width={140}
                                            className="object-cover "
                                            classNames={{
                                                wrapper: "absolute right-0 bottom-1.5 z-0 rotate-[5deg] shadow-lg shadow-black/40"
                                            }}
                                        />
                                    </>
                                ) : photos.length > 0 && (
                                    <>
                                        <div className="w-fit z-10 relative">
                                            <Image
                                                src={photos[0].url}
                                                alt={room.title ?? ""}
                                                height={160}
                                                width={160}
                                                className="object-cover min-w-[160px] shadow"
                                            />
                                            <Chip className="absolute bg-white top-3 left-3 z-10 py-4 text-xs text-accent">
                                                5 Ảnh
                                            </Chip>
                                        </div>
                                        {
                                            photos.length > 2 && (
                                                <>
                                                    <Image
                                                        src={photos[1].url}
                                                        alt={room.title ?? ""}
                                                        height={140}
                                                        width={140}
                                                        className="object-cover "
                                                        classNames={{
                                                            wrapper: "absolute left-0 bottom-1.5 z-0 rotate-[-5deg] shadow-lg shadow-black/40"
                                                        }}
                                                    />
                                                    <Image
                                                        src={photos[2].url}
                                                        alt={room.title ?? ""}
                                                        height={140}
                                                        width={140}
                                                        className="object-cover"
                                                        classNames={{
                                                            wrapper: "absolute right-0 bottom-1.5 z-0 rotate-[5deg] shadow-lg shadow-black/40"
                                                        }}
                                                    />
                                                </>
                                            )
                                        }
                                    </>
                                )}
                            </div>
                        </div>
                    </CardItem>
                    <CardItem
                        title={t("Title")}
                        href={`${hrefDefault}/title`}
                    >
                        <div className="flex justify-start items-center gap-x-0 text-accent text-[20px] font-medium mt-2">
                            <span className="text-inherit text-wrap">
                                {room?.title}
                            </span>
                        </div>
                    </CardItem>
                    <CardItem
                        title={t("Pricing")}
                        href={`${hrefDefault}/pricing`}
                    >
                        <div className="text-accent">
                            <div className="mt-0.5">
                                <span>
                                    {t("{{value}} per night", formatPrice(room.original_price))}
                                </span>
                            </div>
                            {
                                discounts[Discount.NEW_USER] && (
                                    <div className="mt-0.5">
                                        <span>
                                            {t("{{value}}% new user discount", `${discounts[Discount.NEW_USER].percent * 100}`)}
                                        </span>
                                    </div>
                                )
                            }
                            {
                                discounts[Discount.WEEKLY] && (
                                    <div className="mt-0.5">
                                        <span>
                                            {t("{{value}}% weekly discount", `${discounts[Discount.WEEKLY].percent * 100}`)}
                                        </span>
                                    </div>
                                )
                            }
                            {
                                discounts[Discount.MONTHLY] && (
                                    <div className="mt-0.5">
                                        <span>
                                            {t("{{value}}% monthly discount", `${discounts[Discount.MONTHLY].percent * 100}`)}
                                        </span>
                                    </div>
                                )
                            }
                        </div>
                    </CardItem>
                </div>
            </div>
        </aside>
    );
};

export default AsideClient;