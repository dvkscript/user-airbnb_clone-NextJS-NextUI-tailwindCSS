"use client";
import useDictionary from "@/hooks/useDictionary";
import { cn, formatDate } from "@/utils/dom.util";
import { Divider, Popover, PopoverContent, PopoverTrigger, RangeCalendarProps } from "@nextui-org/react";
import { useDateFormatter } from "@react-aria/i18n";
import { ChevronDown } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react"
import Button from "@/components/Button";
import Translate from "@/components/Common/Translate";
import { useRouter } from "next-nprogress-bar";
import { useParams } from "next/navigation";
import useRoomStore from "@/hooks/useRoomStore";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";
import CardGuest from "@/components/Card/CardGuest";
import CardBookingCalendar from "@/components/Card/CardBookingCalendar";

interface BookingFormProps {
    isPopoverDateRanger: boolean;
    setIsPopoverDateRanger: React.Dispatch<React.SetStateAction<BookingFormProps["isPopoverDateRanger"]>>;
    minDate: NonNullable<RangeCalendarProps["minValue"]>;
};

const dateFormat = 'dd/mm/yyyy';

const BookingForm: React.FC<BookingFormProps> = ({
    minDate,
    isPopoverDateRanger,
    setIsPopoverDateRanger,
}) => {
    const router = useRouter();
    const roomId = useParams()?.roomId;
    const { bookForm, setBookValue, maxGuest, searchParamKeys } = useRoomStore(bookingRoomSelector);

    const dateValue = useMemo(() => {
        if (!bookForm.dates) return null;
        const start = bookForm.dates.start;
        const end = bookForm.dates.end;
        return {
            start: formatDate([start.day, start.month, start.year].join("/"), dateFormat) || "",
            end: formatDate([end.day, end.month, end.year].join("/"), dateFormat) || ""
        }
    }, [bookForm.dates]);

    const [isOpenSelect, setIsOpenSelect] = useState(false);
    const { d } = useDictionary("rooms", d => d.booking)
    const btnMsg = useDictionary("common", d => d.buttons).t;
    const unitMsg = useDictionary("common", d => d.units.items).t;
    const formMsg = useDictionary("common", d => d.forms).d;
    const dateFormatter = useDateFormatter({
        day: "numeric",
        month: "short",
        year: "numeric"
    });


    const handleSubmit = useCallback(() => {
        if (!bookForm.dates) {
            setIsPopoverDateRanger(true)
        } else {
            const search = new URLSearchParams();
            search.set(searchParamKeys.checkIn, `${bookForm.dates.start.toString()}`)
            search.set(searchParamKeys.checkout, `${bookForm.dates.end.toString()}`)
            search.set(searchParamKeys.guests, `${bookForm.guests}`)
            search.set(searchParamKeys.adults, `${bookForm.adults}`)
            search.set(searchParamKeys.children, `${bookForm.children}`)
            search.set(searchParamKeys.infants, `${bookForm.infants}`)
            search.set(searchParamKeys.pets, `${bookForm.pets}`)
            router.push(`/book/stays/${roomId}?${search.toString()}`)
        }
    }, [bookForm, setIsPopoverDateRanger, router, roomId, searchParamKeys])

    return (
        <>
            <div>
                <div className="w-full border-1.5 rounded-md border-default-800">
                    <Popover
                        isOpen={isPopoverDateRanger}
                        placement="bottom-end"
                        offset={-80}
                        crossOffset={30}
                        onOpenChange={(isOpen) => {
                            setIsPopoverDateRanger(isOpen)
                        }}
                        motionProps={{
                            variants: {
                                enter: {
                                    y: 0,
                                    opacity: 1,
                                    transition: {
                                        opacity: {
                                            duration: 0.15,
                                        },
                                    },
                                },
                                exit: {
                                    opacity: 0,
                                    transition: {
                                        opacity: {
                                            duration: 0.1,
                                        },
                                    },
                                },
                            },

                        }}
                    >
                        <PopoverTrigger>
                            <button
                                type="button"
                                className="flex h-full w-full border-0 border-[inherit] aria-expanded:scale-100 aria-expanded:opacity-100"
                                onClick={() => setIsPopoverDateRanger(true)}
                            >
                                <div className="py-2.5 px-3 flex-1 text-left w-full border-r-1 -mr-[0.5px] border-[inherit]">
                                    <span className="text-nowrap text-xs font-medium block uppercase">
                                        {formMsg?.checkIn.label}
                                    </span>
                                    <span className="text-nowrap text-sm block text-accent">
                                        {!!dateValue?.start ? dateValue.start : formMsg?.checkIn.placeholder}
                                    </span>
                                </div>
                                <div className="py-2.5 px-3 flex-1 text-left w-full border-l-1 -ml-[0.5px] border-[inherit]">
                                    <span className="text-nowrap text-xs font-medium block uppercase">
                                        {formMsg?.checkout.label}
                                    </span>
                                    <span className="text-nowrap text-sm block text-accent">
                                        {!!dateValue?.end ? dateValue.end : formMsg?.checkout.placeholder}
                                    </span>
                                </div>
                            </button>
                        </PopoverTrigger>
                        <Translate isExcLocaleSystem isTrans>
                            <PopoverContent
                                className="pt-6 px-8 pb-4"
                            >
                                <CardBookingCalendar
                                    minDate={minDate}
                                    title={(
                                        bookForm.totalNight !== 0 ?
                                            d?.titles.staySummary.
                                                replace("{{day}}", `${bookForm.totalNight}`) :
                                            d?.titles.select
                                    )}
                                    description={(
                                        !bookForm.dates ? (
                                            d?.description
                                        ) : (
                                            <>
                                                <time dateTime={bookForm.dates.start.toString()}>
                                                    {dateFormatter.format(new Date(bookForm.dates.start.toString()))}
                                                </time>
                                                {" - "}
                                                <time dateTime={bookForm.dates.end.toString()}>
                                                    {dateFormatter.format(new Date(bookForm.dates.end.toString()))}
                                                </time>
                                            </>
                                        )
                                    )}
                                    onChange={() => {
                                        setIsPopoverDateRanger(false);
                                    }}
                                />
                                <div className="flex justify-end items-center gap-x-3 w-full">
                                    <Button
                                        variant="light"
                                        className="underline"
                                        onPress={() => {
                                            setBookValue("dates", null);
                                        }}
                                    >
                                        {btnMsg("Clear dates")}
                                    </Button>
                                    <Button
                                        color="secondary"
                                        onPress={() => setIsPopoverDateRanger(false)}
                                    >
                                        {btnMsg("Close")}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Translate>
                    </Popover>

                    <Divider className="bg-default-800" />
                    <Popover
                        placement="bottom"
                        offset={0}
                        classNames={{
                            base: "w-[325px]",
                            content: "rounded-sm"
                        }}
                        onOpenChange={(isOpen) => {
                            setIsOpenSelect(isOpen)
                        }}
                        isOpen={isOpenSelect}
                    >
                        <PopoverTrigger>
                            <button
                                type="button"
                                className="w-full py-2.5 px-3 inline-flex justify-start items-center aria-expanded:scale-100 aria-expanded:opacity-100"
                            >
                                <div className="flex flex-col text-left">
                                    <span className="font-medium text-xs uppercase">
                                        {formMsg?.guests.label}
                                    </span>
                                    <span className="text-sm text-accent">
                                        {
                                            [
                                                `${bookForm.guests} ${unitMsg("guest")}`,
                                                bookForm.infants ? `${bookForm.infants} ${unitMsg("infants")}` : null,
                                                bookForm.pets ? `${bookForm.pets} ${unitMsg("pets")}` : null,
                                            ].filter(v => v).join(", ")
                                        }
                                    </span>
                                </div>
                                <span
                                    className={cn(
                                        "ml-auto"
                                    )}
                                >
                                    <ChevronDown size={16} />
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full px-4 py-5 flex-col gap-y-4">
                            <CardGuest />
                            <p className="text-accent text-xs">
                                {formMsg?.guests.maxGuest.replace("{{guest}}", `${maxGuest}`)}
                            </p>
                            <div className="text-right ml-auto -my-2">
                                <Button
                                    className="underline px-2 py-2 h-fit min-w-fit"
                                    variant="light"
                                    onPress={() => setIsOpenSelect(false)}
                                >
                                    {btnMsg("Close")}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <Button
                    className="bg-rose-600 text-white mt-3"
                    size="lg"
                    fullWidth
                    radius="sm"
                    onPress={handleSubmit}
                >
                    {!!dateValue ? btnMsg("Reserve") : btnMsg("Check availability")}
                </Button>
            </div>
            <span className="text-center text-sm text-default-600">
                {d?.form.messages.alert}
            </span>
        </>
    );
};

export default BookingForm;