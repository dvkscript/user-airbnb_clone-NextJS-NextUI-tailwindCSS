"use client";
import useDictionary from "@/hooks/useDictionary";
import { cn, formatDate } from "@/utils/dom.util";
import { Divider, Input, Popover, PopoverContent, PopoverTrigger, RangeCalendarProps } from "@nextui-org/react";
import { useDateFormatter } from "@react-aria/i18n";
import { ChevronDown, Info } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react"
import Button from "@/components/Button";
import Translate from "@/components/Common/Translate";
import { CalendarDate } from "@internationalized/date";
import { GetRoomDetail } from "@/services/room.service";
import useSystemStore from "@/hooks/useSystemStore";
import { locationSelector } from "@/hooks/selectors/systemSelector";
import RangeCalendar from "@/components/Common/RangeCalendar";
import { useRouter } from "next-nprogress-bar";
import { useParams } from "next/navigation";
import useRoomStore from "@/hooks/useRoomStore";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";
import CardGuest from "@/components/Card/CardGuest";

interface BookingFormProps {
    isPopoverDateRanger: boolean;
    setIsPopoverDateRanger: React.Dispatch<React.SetStateAction<BookingFormProps["isPopoverDateRanger"]>>;
    minDate: NonNullable<RangeCalendarProps["minValue"]>;
    address: GetRoomDetail["address"];
};

const dateFormat = 'dd/mm/yyyy';

const BookingForm: React.FC<BookingFormProps> = ({
    minDate,
    address,
    isPopoverDateRanger,
    setIsPopoverDateRanger,
}) => {
    const { countries } = useSystemStore(locationSelector)
    const [formData, setFormData] = useState({
        start: "",
        end: ""
    });
    const [error, setError] = useState<{
        start: boolean,
        end: boolean
    }>({
        end: false,
        start: false
    });
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

    const setFormValue = useCallback(<T extends typeof formData, K extends keyof T>(key: K, value: T[K]) => {
        setFormData({
            ...formData,
            [key]: value,
        })
    }, [formData]);

    const regexDate = (value: string) => {
        const numericInput = value.replace(/\D/g, '').slice(0, 8);
        const day = numericInput.substring(0, 2);
        const month = numericInput.substring(2, 4);
        const year = numericInput.substring(4, 8);

        const formattedInput = [day, month, year];

        return formattedInput
    }

    const validateDateValue = useCallback((key: keyof typeof formData) => {
        const value = formData[key];
        if (!value) return;
        const formattedInput = regexDate(value);
        const newError = { ...error };

        const date = formatDate(formattedInput.join("/"), dateFormat);

        if (!date) {
            newError[key] = true;
            return setError(newError);
        };

        const minDateParse = new Date(minDate.toString());
        const currentDateParse = new Date([...formattedInput].reverse().join("-"));

        if (isNaN(minDateParse.getTime()) || isNaN(currentDateParse.getTime())) {
            newError[key] = true;
            return setError(newError);
        };

        if (currentDateParse.getTime() < minDateParse.getTime()) {
            newError[key] = true;
            return setError(newError);
        };

        const keyOtherDate = key === "end" ? "start" : "end";
        if (!formData[keyOtherDate]) {
            return setFormData({
                ...formData,
                [key]: date || value,
            })
        };

        const otherDate = regexDate(formData[keyOtherDate]);
        const otherDateParse = new Date([...otherDate].reverse().join("-"))

        if (isNaN(otherDateParse.getTime())) {
            newError[keyOtherDate] = true;
            return setError(newError);
        };

        if (key === "end" && currentDateParse.getTime() <= otherDateParse.getTime()) {
            newError[key] = true;
            return setError(newError);
        } else if (key === "start" && currentDateParse.getTime() >= otherDateParse.getTime()) {
            newError[key] = true;
            return setError(newError);
        } else {
            newError.start = false;
            newError.end = false;
        };

        setError(newError);

        const newDate = {
            [key]: new CalendarDate(currentDateParse.getFullYear(), currentDateParse.getMonth() + 1, currentDateParse.getDate()),
            [keyOtherDate]: new CalendarDate(otherDateParse.getFullYear(), otherDateParse.getMonth() + 1, otherDateParse.getDate())
        } as any;
        setBookValue("dates", newDate)

    }, [formData, minDate, error, setBookValue]);

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

    useEffect(() => {
        if (dateValue) {
            setFormData(dateValue);
        } else {
            setFormData({
                end: "",
                start: ""
            })
        }
    }, [dateValue]);

    useEffect(() => {
        if (Object.values(error).some(e => e)) {
            setBookValue("dates", null)
        }
    }, [error, setBookValue])

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
                                <div className="flex justify-between w-full items-center gap-x-6">
                                    <div>
                                        <p className="text-subtitle">
                                            {
                                                bookForm.totalNight !== 0 ?
                                                    d?.titles.staySummary.
                                                        replace("{{day}}", `${bookForm.totalNight}`).
                                                        replace(
                                                            "{{address}}",
                                                            [
                                                                address.province,
                                                                countries[address.country_code as keyof typeof countries].native
                                                            ].filter(a => a).join(", ")) :
                                                    d?.titles.select
                                            }
                                        </p>

                                        <p className="text-description-accent text-accent pt-2 h-9">
                                            {
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
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <div
                                            className={cn(
                                                "border rounded-md flex max-w-[20.3rem] relative",
                                                "after:content-[''] after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:w-[0.5px] after:h-full after:bg-default-300"
                                            )}
                                        >
                                            <Input
                                                placeholder="DD/MM/YYYY"
                                                label={formMsg?.checkIn.label}
                                                variant="bordered"
                                                className="border-none"
                                                classNames={{
                                                    inputWrapper: "border-none data-[focus=true]:z-10 data-[focus=true]:shadow-[0_0_0_2px] data-[focus=true]:shadow-default-800 rounded-[inherit]",
                                                    label: "font-medium uppercase",
                                                    base: "rounded-[inherit]",
                                                    clearButton: "top-2/3 -translate-y-1/2"
                                                }}
                                                radius="sm"
                                                autoFocus={!formData.start || !!formData.end}
                                                value={formData.start}
                                                isClearable
                                                onValueChange={(v) => setFormValue("start", v)}
                                                onBlur={() => validateDateValue("start")}
                                                isInvalid={error.start}
                                            />
                                            <Input
                                                value={formData.end}
                                                placeholder="DD/MM/YYYY"
                                                label={formMsg?.checkout.label}
                                                variant="bordered"
                                                className="border-none"
                                                classNames={{
                                                    inputWrapper: cn(
                                                        "border-none data-[focus=true]:z-10 data-[focus=true]:shadow-[0_0_0_2px] rounded-[inherit]",
                                                        "data-[focus=true]:shadow-default-800"
                                                    ),
                                                    label: "font-medium uppercase",
                                                    base: "rounded-[inherit]",
                                                    clearButton: "top-2/3 -translate-y-1/2"
                                                }}
                                                isClearable
                                                onValueChange={(v) => setFormValue("end", v)}
                                                onBlur={() => validateDateValue("end")}
                                                isInvalid={error.end}
                                                autoFocus={!formData.end && !!formData.start}
                                            />
                                        </div>
                                        {
                                            (error.end || error.start) && (
                                                <span className="inline-block mt-2 text-xs text-danger">
                                                    <Info className="inline-block mr-1 -mt-0.5 align-middle" size={14} />
                                                    {" "}
                                                    {d?.form.messages.validate}
                                                </span>
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <RangeCalendar
                                        visibleMonths={2}
                                        minValue={minDate}
                                        classNames={{
                                            cellButton: "p-5",
                                            gridHeaderCell: "p-5",
                                            headerWrapper: "py-4",
                                        }}
                                        value={bookForm.dates}
                                        onChange={(dates) => {
                                            setIsPopoverDateRanger(false);
                                            setBookValue("dates", dates);
                                        }}
                                    />
                                </div>
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
                                {d?.form.messages.maxGuest.replace("{{guest}}", `${maxGuest}`)}
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