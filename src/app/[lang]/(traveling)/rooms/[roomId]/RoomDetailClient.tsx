"use client"
import { cleanStr, cn, formatPrice } from "@/utils/dom.util";
import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { ChevronLeft, Dot, Heart, Share } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react"
import SlideImage from "./_components/SlideImage";
import DateRangePicker from "./_components/DateRangePicker";
import Amenities from "./_components/Amenities";
import BookingForm from "./_components/BookingForm";
import { GetRoomDetail } from "@/services/room.service";
import useUrl from "@/hooks/useUrl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ModalPhotos from "./_components/ModalPhotos";
import ModalPhoto from "./_components/ModalPhoto";
import { ModalMode } from "@/enum/modalMode";
import useUserStore from "@/hooks/useUserStore";
import { profileSelector } from "@/hooks/selectors/userSelector";
import useModal from "@/hooks/useModal";
import useToast from "@/hooks/useToast";
import useDictionary from "@/hooks/useDictionary";
import { GetWishlists, wishlistAddOrRemoveRoom } from "@/services/user.service";
import Image from "@/components/Common/Image";
import Navbar from "./_components/Navbar";
import useSystemStore from "@/hooks/useSystemStore";
import { locationSelector } from "@/hooks/selectors/systemSelector";
import UserRoom from "./_components/UserRoom";
import Container from "@/components/Common/Container";
import ModalWishlist from "@/components/Modal/ModalWishlist";
import { GetAmenityAndCountAll } from "@/services/amenity.service";
import { getLocalTimeZone, today } from "@internationalized/date";
import useRoomStore from "@/hooks/useRoomStore";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";
import Translate from "@/components/Common/Translate";
import Location from "./_components/Location";
import Policies from "./_components/Policies";
import Profile from "./_components/Profile";

interface RoomDetailClientProps {
    room: GetRoomDetail;
    wishlists: GetWishlists;
    amenities: GetAmenityAndCountAll;
}

const RoomDetailClient: React.FC<RoomDetailClientProps> = ({
    room,
    wishlists,
    amenities
}) => {

    const roomAmenities = useMemo(() => {
        return room.amenities
    }, [room]);
    const { pathname } = useUrl();
    const router = useRouter();
    const { profile } = useUserStore(profileSelector);
    const { onModal } = useModal();
    const { toastRes } = useToast();
    const toastMsg = useDictionary("common", d => d.modal.wishlists.toast).t;
    const btnMsg = useDictionary("common", d => d.buttons).t;
    const unitMsg = useDictionary("common", d => d.units.items).t;
    const feeMsg = useDictionary("common", d => d.fees).t;
    const priceMsg = useDictionary("common", d => d.prices).t;
    const offerMsg = useDictionary("common", d => d.offers).t;
    const floorPlanMsg = useDictionary("rooms", d => d["floor-plan"]).t;
    const subtitleMsg = useDictionary("rooms", d => d["subtitles"]).t;
    const [isFavorite, setIsFavorite] = useState(!!room.wishlists);
    const { countries } = useSystemStore(locationSelector);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const { searchParamsRef } = useUrl();
    const { handleBookingPrice, bookForm, setBookFormBySearchParams, setMaxGuest, searchParamKeys } = useRoomStore(bookingRoomSelector);
    const [isPopoverDateRanger, setIsPopoverDateRanger] = useState(false);

    const minDate = useMemo(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const timeZone = getLocalTimeZone();
        const currentDate = today(timeZone);

        if (currentHour >= 16) {
            return currentDate.add({ days: 1 });
        }
        return currentDate;
    }, []);

    const prices = useMemo(() => {
        const { fee, original_price, discounts } = room;

        return handleBookingPrice(original_price, bookForm.totalNight, fee, discounts);
    }, [room, handleBookingPrice, bookForm.totalNight]);


    const handleShare = useCallback(async () => {
        if (!room) return;
        try {
            await navigator.share({
                title: room.title!,
                text: room.description!,
                url: `${window.location.origin}/${pathname}`,
            })
        } catch (error: any) {
            toast.error(error.message)
        }
    }, [pathname, room]);

    const handleFavorite = useCallback(async () => {
        if (!profile) {
            return onModal({
                mode: ModalMode.AUTH_SIGN_IN,
            })
        }
        if (room.wishlists) {
            setIsFavorite(false);
            const res = await wishlistAddOrRemoveRoom(room.wishlists.id, {
                action: "remove",
                roomId: room.id
            });
            if (!res.ok) {
                return toastRes(res);
            }

            return toast(
                <div className="w-full flex items-center justify-start gap-x-3 text-base">
                    <Image
                        src={room.photos[0].url}
                        alt={room.title || ""}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                    />

                    <span
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{
                            __html: toastMsg("remove", `<b class="font-medium notranslate">${cleanStr(room.wishlists.name)}</b>`),
                        }}
                    />
                </div>
                , {
                    position: "bottom-left",
                    className: "p-2 rounded-xl w-80",
                    closeButton: false,
                }
            )
        };

        return setIsOpenModal(true)
    }, [profile, onModal, room, toastRes, toastMsg]);

    useEffect(() => {
        const search = new URLSearchParams(searchParamsRef.current);
        const { guests, dates, adults, children, infants, pets } = bookForm;

        if (dates) {
            search.set(searchParamKeys.checkIn, dates.start.toString());
            search.set(searchParamKeys.checkout, dates.end.toString());
        }

        search.set(searchParamKeys.guests, `${guests}`)
        search.set(searchParamKeys.adults, `${adults}`)
        search.set(searchParamKeys.children, `${children}`)
        search.set(searchParamKeys.infants, `${infants}`)
        search.set(searchParamKeys.pets, `${pets}`);

        window.history.pushState(
            null,
            '',
            `?${search.toString()}`
        );
    }, [bookForm, searchParamsRef, searchParamKeys]);

    useEffect(() => {
        setBookFormBySearchParams(
            searchParamsRef.current,
            minDate,
        )
    }, [searchParamsRef, setBookFormBySearchParams, minDate])

    useEffect(() => {
        setIsFavorite(!!room.wishlists);
        setMaxGuest(room.floorPlan.guests)
    }, [room.wishlists, room.floorPlan.guests, setMaxGuest]);

    return (
        <>
            <Container maxWidth={1280} className="bg-inherit pb-40">
                <div className="flex flex-col bg-inherit py-12 -mt-12">
                    <div className="relative flex flex-col-reverse md:flex-col">
                        <Button
                            isIconOnly
                            variant="shadow"
                            radius="full"
                            className="absolute top-4 -left-2 md:hidden z-10 bg-default-50 min-w-fit w-9 h-9 shadow"
                            disableRipple
                            onPress={() => {
                                router.push("/")
                            }}
                        >
                            <ChevronLeft size={20} strokeWidth={2.2} />
                        </Button>
                        <div className="flex py-6">
                            <h1 className="text-title leading-8">
                                {room.title}
                            </h1>
                            <div
                                className={cn(
                                    "absolute flex gap-x-3 top-4 -right-2 z-10",
                                    "md:static md:ml-auto"
                                )}
                            >
                                <Button
                                    isIconOnly
                                    variant="shadow"
                                    radius="full"
                                    className="bg-content1 min-w-fit w-9 h-9 md:w-fit md:h-fit shadow md:shadow-none"
                                    disableRipple
                                    onPress={handleShare}
                                >
                                    <Share
                                        size={16}
                                        strokeWidth={2.2}
                                    />
                                    <span className="hidden md:inline-block md:ml-2 underline">
                                        {btnMsg("Share")}
                                    </span>
                                </Button>
                                <Button
                                    isIconOnly
                                    variant="shadow"
                                    disableRipple
                                    radius="full"
                                    className="bg-content1 min-w-fit w-9 h-9 md:w-fit md:h-fit shadow md:shadow-none"
                                    onPress={handleFavorite}
                                >
                                    <Heart
                                        size={16}
                                        strokeWidth={2.2}
                                        className={cn(
                                            isFavorite ? "fill-red-500 text-red-500" : ""
                                        )}
                                    />
                                    <span className="hidden md:inline-block md:ml-2 underline">
                                        {btnMsg("Save")}
                                    </span>
                                </Button>
                            </div>
                        </div>
                        <SlideImage photos={room.photos} />
                    </div>
                    <Navbar
                        discountedNightPrice={prices.discountedNightPrice}
                        basePrice={prices.basePrice}
                        setIsPopoverDateRanger={setIsPopoverDateRanger}
                    />
                    <div className="flex relative justify-between bg-inherit pb-[inherit]">
                        <div className="max-w-full lg:max-w-[41rem] flex flex-col w-full bg-inherit overflow-hidden">
                            <div className="py-8 -my-8">
                                <section className="py-[inherit]">
                                    <h2 className="text-subtitle">
                                        {subtitleMsg(room.privacy_type as any, [room.address.province, countries[room.address.country_code as keyof typeof countries].native].join(", "))}
                                    </h2>
                                    <ol className="flex text-sm md:text-base">
                                        <li className="list-none">
                                            {room.floorPlan.guests} {floorPlanMsg("guests")}
                                        </li>
                                        <li>
                                            <Dot size={15} className="inline-block" />
                                            {room.floorPlan.bedrooms} {floorPlanMsg("bedroom")}
                                        </li>
                                        <li>
                                            <Dot size={15} className="inline-block" />
                                            {room.floorPlan.bedrooms} {floorPlanMsg("bed")}
                                        </li>
                                        <li>
                                            <Dot size={15} className="inline-block" />
                                            {room.floorPlan.bathrooms} {floorPlanMsg("bath")}
                                        </li>
                                    </ol>
                                </section>
                                <Divider />
                                <div className="w-full py-6">
                                    <UserRoom
                                        user={room.user}
                                    />
                                </div>
                                <Divider />
                                <Amenities amenities={amenities} roomAmenities={roomAmenities} />
                                <Divider />
                                <section className="bg-inherit py-[inherit]">
                                    <DateRangePicker
                                        address={room.address}
                                        minDate={minDate}
                                    />
                                </section>
                            </div>
                        </div>
                        <div className="hidden lg:block max-w-[23.5rem] w-full pt-8">
                            <Card as={"section"} className="py-4 px-3 sticky top-28" id="book-form">
                                <CardHeader className="pb-0 pt-2 px-4 justify-start items-end gap-x-1">
                                    {
                                        prices.totalDiscount === 0 ? (
                                            <span className="text-subtitle">
                                                {formatPrice(prices.basePrice)}
                                            </span>
                                        ) : (
                                            <>
                                                <span className="text-subtitle line-through text-accent">
                                                    {formatPrice(prices.basePrice)}
                                                </span>
                                                <span className="text-subtitle">
                                                    {formatPrice(prices.discountedNightPrice)}
                                                </span>
                                            </>
                                        )
                                    }

                                    <span className="text-balance text-default-700">
                                        / {unitMsg("night")}
                                    </span>
                                </CardHeader>
                                <CardBody className="overflow-visible py-2 gap-y-3">
                                    <BookingForm
                                        minDate={minDate}
                                        address={room.address}
                                        isPopoverDateRanger={isPopoverDateRanger}
                                        setIsPopoverDateRanger={setIsPopoverDateRanger}
                                    />
                                    {
                                        prices.totalBasePrice !== 0 && (
                                            <div className="flex justify-between items-center font-normal">
                                                <span>
                                                    {formatPrice(prices.basePrice)} x {bookForm.totalNight} {unitMsg("night")}
                                                </span>
                                                <span>
                                                    {formatPrice(prices.totalBasePrice)}
                                                </span>
                                            </div>
                                        )
                                    }
                                    {
                                        prices.totalDiscount !== 0 && (
                                            <div className="flex justify-between items-center font-normal">
                                                <span>
                                                    {offerMsg("SpecialOffer")}
                                                </span>
                                                <span className="text-success">
                                                    -{formatPrice(Math.round(prices.totalDiscount))}
                                                </span>
                                            </div>
                                        )
                                    }
                                    {
                                        prices.cleaningCharge !== 0 && (
                                            <div className="flex justify-between items-center font-normal">
                                                <span>
                                                    {feeMsg("cleaningFee")}
                                                </span>
                                                <span>
                                                    {formatPrice(Math.round(prices.cleaningCharge))}
                                                </span>
                                            </div>
                                        )
                                    }
                                    {
                                        prices.serviceFee !== 0 && (
                                            <div className="flex justify-between items-center font-normal">
                                                <span>
                                                    {feeMsg("serviceFee")}
                                                </span>
                                                <span>
                                                    {formatPrice(Math.round(prices.serviceFee))}
                                                </span>
                                            </div>
                                        )
                                    }
                                    {
                                        prices.totalCost !== 0 && (
                                            <>
                                                <Divider className="my-2" />
                                                <div className="flex justify-between items-center font-semibold">
                                                    <span>
                                                        {priceMsg("totalBeforeTaxes")}
                                                    </span>
                                                    <span>
                                                        {formatPrice(Math.round(prices.totalCost))}
                                                    </span>
                                                </div>
                                            </>
                                        )
                                    }
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                    <Divider />
                    <section id="reviews" className="py-[inherit]">
                        <h2 className="text-subtitle">
                            <Translate isTrans isExcLocaleSystem as={"span"}>
                                No reviews (yet)
                            </Translate>
                        </h2>
                    </section>
                    <Divider />
                    <Location address={room.address} />
                    <Divider />
                    <Profile
                        user={room.user}
                    />
                    <Divider />
                    <Policies />
                </div>
            </Container>
            <ModalPhotos
                setIsOpenModal={setIsOpenModal}
                room={room}
            />
            <ModalPhoto
                room={room}
                setIsOpenModal={setIsOpenModal}
            />
            <ModalWishlist
                wishlists={wishlists}
                isOpenModal={isOpenModal}
                setIsOpenModal={setIsOpenModal}
                roomSelected={room}
            />
        </>
    );
};

export default RoomDetailClient;