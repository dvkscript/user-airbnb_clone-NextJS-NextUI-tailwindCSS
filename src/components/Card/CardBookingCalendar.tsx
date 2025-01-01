"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import RangeCalendar from "../Common/RangeCalendar";
import { CalendarDate } from "@internationalized/date";
import { Input, RangeCalendarProps } from "@nextui-org/react";
import { Info } from "lucide-react";
import useRoomStore from "@/hooks/useRoomStore";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";
import useUrl from "@/hooks/useUrl";
import { cn, formatDate } from "@/utils/dom.util";
import useDictionary from "@/hooks/useDictionary";
import useWindowEvent from "@/hooks/useWindowEvent";

const dateFormat = 'dd/mm/yyyy';

interface CardBookingCalendarProps {
    minDate: NonNullable<RangeCalendarProps["minValue"]>;
    onChange?: RangeCalendarProps["onChange"];
    title?: React.ReactNode;
    description?: React.ReactNode;
}

const CardBookingCalendar = ({
    minDate,
    onChange,
    description,
    title
}: CardBookingCalendarProps) => {
    const { bookForm, setBookValue, setBookFormBySearchParams } = useRoomStore(bookingRoomSelector);
    const { searchParamsRef } = useUrl();
    const formMsg = useDictionary("common", d => d.forms).d;
    const { screen } = useWindowEvent();
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

    const visibleMonths = useMemo(() => ((screen?.key === "sm") ? 1 : 2), [screen])

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

    useEffect(() => {
        if (Object.values(error).some(e => e)) {
            setBookValue("dates", null)
        }
    }, [error, setBookValue])

    useEffect(() => {
        setBookFormBySearchParams(
            searchParamsRef.current,
            minDate,
        )
    }, [searchParamsRef, setBookFormBySearchParams, minDate]);
    
    useEffect(() => {
        if (bookForm.dates) {
            const start = bookForm.dates.start;
            const end = bookForm.dates.end;
            setFormData({
                start: formatDate([start.day, start.month, start.year].join("/"), dateFormat) || "",
                end: formatDate([end.day, end.month, end.year].join("/"), dateFormat) || ""
            })
        } else {
            setFormData({
                end: "",
                start: ""
            })
        }
    }, [bookForm.dates]);

    return (
        <div className="w-full h-full bg-inherit">
            <div className="flex justify-between w-full items-center gap-x-6">
                <div>
                    <h3 className="text-subtitle">
                        {title}
                    </h3>

                    <div className="text-description-accent text-accent pt-2 h-9">
                        {description}
                    </div>
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
                                {error.start ? formMsg?.checkIn.validate : formMsg?.checkout.validate}
                            </span>
                        )
                    }
                </div>
            </div>
            <div className="pt-4">
                <RangeCalendar
                    visibleMonths={visibleMonths}
                    minValue={minDate}
                    classNames={{
                        headerWrapper: "py-4",
                        ...(visibleMonths === 1 ? {
                            cellButton: "absolute inset-0 p-[50%]",
                            gridHeaderCell: "p-[6.838%]",
                            cell: "p-[6.435%] relative",
                        } : {
                            cellButton: "p-5",
                            gridHeaderCell: "p-5",
                        })
                    }}
                    value={bookForm.dates || null}
                    onChange={(dates) => {
                        setBookValue("dates", dates);
                        if (onChange) onChange(dates)
                    }}
                />
            </div>
        </div>
    );
};

export default CardBookingCalendar;