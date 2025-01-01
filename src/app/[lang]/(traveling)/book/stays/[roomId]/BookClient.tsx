"use client"
import Button from "@/components/Button";
import Container from "@/components/Common/Container";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";
import useDictionary from "@/hooks/useDictionary";
import useRoomStore from "@/hooks/useRoomStore";
import { GetRoomDetail, roomBooking } from "@/services/room.service";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useMemo, useRef, useState } from "react"
import YourTrip from "./_components/YourTrip";
import { Card, Divider, Spacer } from "@nextui-org/react";
import RoomImage from "./_components/RoomImage";
import PriceDetail from "./_components/PriceDetail";
import StripeProvider from "@/components/Pay/Stripe/StripeProvider";
import StripeCard from "@/components/Pay/Stripe/StripeCard";
import { Stripe, StripeElements } from "@stripe/stripe-js";
import BookAuth from "./_components/Auth";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface BookClientProps {
    room: GetRoomDetail;
    lang: string;
    isAuthorization: boolean
}

const maxWidth = 1280;

const BookClient: React.FC<BookClientProps> = ({
    room,
    isAuthorization
}) => {

    const router = useRouter();
    const { bookForm, searchParamKeys, handleBookingPrice } = useRoomStore(bookingRoomSelector);
    const { d } = useDictionary("book", d => d);
    const [isLoading, setIsLoading] = useState(false);
    const btnMsg = useDictionary("common", d => d.buttons).t;
    const [
        errorMsg,
        setErrorMsg
    ] = useState<string>();
    const submitBtnRef = useRef<HTMLInputElement | null>(null);
    const roomId = useParams().roomId as string;

    const prices = useMemo(() => {
        return handleBookingPrice(room.original_price, bookForm.totalNight, room.fee, room.discounts)
    }, [bookForm.totalNight, handleBookingPrice, room.discounts, room.fee, room.original_price]);

    const handleBack = useCallback(() => {
        if (!bookForm.dates) return router.replace(`/rooms/${room.id}`)
        const search = new URLSearchParams();

        for (const key in searchParamKeys) {
            if (searchParamKeys.hasOwnProperty(key)) {
                if (key === "checkIn") {
                    search.set(searchParamKeys.checkIn, bookForm.dates.start.toString());
                }
                if (key === "checkout") {
                    search.set(searchParamKeys.checkout, bookForm.dates.end.toString());
                }
                if (
                    bookForm.hasOwnProperty(key)
                ) {
                    search.set(searchParamKeys[key as keyof typeof searchParamKeys], `${bookForm[key as keyof typeof bookForm]}`);
                }
            }
        };

        router.push(`/rooms/${room.id}?${search.toString()}`);
    }, [router, bookForm, room.id, searchParamKeys]);

    const handleSubmit = useCallback(async ({ stripe, elements }: { stripe: Stripe, elements: StripeElements }) => {
        setIsLoading(true);
        if (!bookForm.dates) return;

        return toast.warning("Đang làm dở, sắp xong rùi :v")

        // const [{ error: submitError }, { error: methodError, paymentMethod }] = await Promise.all([
        //     elements.submit(),
        //     stripe.createPaymentMethod({
        //         elements
        //     })
        // ]);

        // if (submitError || methodError) {
        //     setErrorMsg(submitError?.message || methodError?.message);
        //     setIsLoading(false);
        //     return;
        // };

        
        
        // const data = {
        //     checkIn: bookForm.dates?.start.toString(),
        //     checkout: bookForm.dates.end.toString(),
        //     guests: bookForm.guests,
        //     adults: bookForm.adults,
        //     children: bookForm.children,
        //     infants: bookForm.infants,
        //     pets: bookForm.pets,
        // };


        // const res = await roomBooking(roomId, data);
        // console.log(res);
        
        // setIsLoading(false);
    }, [bookForm]);



    return (
        <>
            <div className="w-full sticky md:static top-0 bg-inherit z-10">
                <Container className="bg-inherit relative pt-5 pb-5 md:pt-16 md:pb-6" maxWidth={maxWidth}>
                    <div className="text-left relative -mx-4 md:mx-0">
                        <Button
                            isIconOnly
                            onPress={handleBack}
                            radius="full"
                            variant="light"
                            className="absolute top-1/2 left-0 translate-x-0 lg:-translate-x-full -translate-y-1/2"
                        >
                            <ChevronLeft />
                        </Button>
                        <h1 className="text-base md:text-3xl font-medium text-center lg:text-left w-full">
                            {d?.title}
                        </h1>
                    </div>
                </Container>
                <Divider className="block md:hidden" />
            </div>
            <Container className="bg-inherit z-0" maxWidth={maxWidth}>
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div>
                        <section className="py-6 block md:hidden z-0">
                            <RoomImage room={room} />
                        </section>
                        <Divider className="-mx-4 sm:-mx-6 md:mx-0 w-auto h-2 block md:hidden" />
                        <section className="py-6">
                            <YourTrip room={room} />
                        </section>
                        <Divider className="-mx-4 sm:-mx-6 md:mx-0 w-auto h-2 md:h-[1px]" />
                        <section className="py-6 block md:hidden">
                            <PriceDetail
                                prices={prices}
                            />
                        </section>
                        <Divider className="-mx-4 sm:-mx-6 md:mx-0 w-auto h-2 md:h-[1px] block md:hidden" />
                        {
                            isAuthorization ? (
                                <>
                                    <section className="py-6">
                                        <h2 className="text-xl font-medium">
                                            {d?.pay.title}
                                        </h2>
                                        <Spacer y={5} />
                                        <StripeProvider>
                                            <StripeCard
                                                onSubmit={handleSubmit}
                                                errorMsg={errorMsg}
                                            >
                                                <input type="submit" hidden style={{ display: "none", opacity: 0, visibility: "hidden" }} ref={submitBtnRef} />
                                            </StripeCard>
                                        </StripeProvider>
                                    </section>
                                    <Divider className="-mx-4 sm:-mx-6 md:mx-0 w-auto h-2 md:h-[1px]" />
                                    <section className="py-6">
                                        <h2 className="text-xl font-medium">
                                            {d?.policy.title}
                                        </h2>
                                        <Spacer y={6} />
                                        <div>
                                            <p>
                                                {d?.policy.items["non-refundable"]}
                                            </p>
                                        </div>
                                    </section>
                                    <Divider className="-mx-4 sm:-mx-6 md:mx-0 w-auto h-2 md:h-[1px]" />
                                    <section className="py-6">
                                        <h2 className="text-xl font-medium">
                                            {d?.rules.title}
                                        </h2>
                                        <Spacer y={6} />
                                        <div>
                                            <p>
                                                {d?.rules.subtitle}
                                            </p>
                                            <Spacer y={4} />
                                            <ul className="list-disc pl-5">
                                                {
                                                    Object.values(d?.rules.items || {}).map((t, i) => (
                                                        <li key={i}>
                                                            <p>
                                                                {t}
                                                            </p>
                                                        </li>
                                                    ))
                                                }
                                            </ul>
                                        </div>
                                    </section>
                                    <Divider className="-mx-4 sm:-mx-6 md:mx-0 w-auto h-2 md:h-[1px]" />
                                    <Spacer y={6} />
                                    <Button
                                        color="primary"
                                        size="lg"
                                        radius="sm"
                                        className="w-full md:w-auto"
                                        isLoading={isLoading}
                                        type="button"
                                        onPress={() => {
                                            if (!submitBtnRef.current) return;
                                            submitBtnRef.current.click();
                                        }}
                                    >
                                        {!isLoading && btnMsg("Request to book")}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <section className="py-6">
                                        <BookAuth />
                                    </section>
                                </>
                            )
                        }
                        <>
                            <Spacer y={6} />
                        </>
                    </div>
                    <div className="hidden md:block">
                        <section className="sticky top-20 hidden md:block ml-[9%]">
                            <Card className="p-6 gap-y-6">
                                <div className="p-0">
                                    <RoomImage
                                        room={room}
                                    />
                                </div>
                                <Divider />
                                <PriceDetail
                                    prices={prices}
                                />
                            </Card>
                        </section>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default BookClient;