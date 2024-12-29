"use client"
import BreakpointConfig from "@/configs/breakpoints.config";
import useDictionary from "@/hooks/useDictionary";
import useWindowEvent from "@/hooks/useWindowEvent";
import { cn } from "@/utils/dom.util";
import { Button, RangeCalendarProps } from "@nextui-org/react";
import { useDateFormatter } from "@react-aria/i18n";
import React, { useEffect, useState } from "react"
import { GetRoomDetail } from "@/services/room.service";
import useSystemStore from "@/hooks/useSystemStore";
import { locationSelector } from "@/hooks/selectors/systemSelector";
import RangeCalendar from "@/components/Common/RangeCalendar";
import useRoomStore from "@/hooks/useRoomStore";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";

interface DateRangePickerProps {
    className?: string
    address: GetRoomDetail["address"];
    minDate: NonNullable<RangeCalendarProps["minValue"]>;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    className,
    address,
    minDate,
}) => {
    const { countries } = useSystemStore(locationSelector)
    const { screen } = useWindowEvent()
    const [visibleMonths, setVisibleMonths] = useState(1);
    const { d } = useDictionary("rooms", d => d.booking)
    const btnMsg = useDictionary("common", d => d.buttons).t;
    const dateFormatter = useDateFormatter({
        day: "numeric",    
        month: "short",   
        year: "numeric"  
    });
    const { bookForm: { dates, totalNight }, setBookValue } = useRoomStore(bookingRoomSelector)

    useEffect(() => {
        if (screen && screen.minWidth < BreakpointConfig.md.minWidth) {
            setVisibleMonths(1)
        } else {
            setVisibleMonths(2)
        }
    }, [screen]);

    return (
        <>
            <div
                className={cn("w-full flex flex-col gap-y-3 bg-inherit", className)}
            >
                <div className="flex flex-col items-start text-left w-fit">
                    <h2 className="text-subtitle">
                        {
                            totalNight !== 0 ?
                                d?.titles.staySummary.
                                    replace("{{day}}", `${totalNight}`).
                                    replace(
                                        "{{address}}",
                                        [
                                            address.province,
                                            countries[address.country_code as keyof typeof countries].native
                                        ].filter(a => a).join(", ")) :
                                d?.titles.select
                        }
                    </h2>
                    <div className="text-sm text-default-500">
                        <p>
                            {
                                !dates ? (
                                    d?.description
                                ) : (
                                    <>
                                        <time dateTime={dates.start.toString()}>
                                            {dateFormatter.format(new Date(dates.start.toString()))}
                                        </time>
                                        {" - "}
                                        <time dateTime={dates.end.toString()}>
                                            {dateFormatter.format(new Date(dates.end.toString()))}
                                        </time>
                                    </>
                                )
                            }
                        </p>
                    </div>
                </div>
                <div className="mx-0 bg-inherit">
                    <RangeCalendar
                        visibleMonths={visibleMonths}
                        minValue={minDate}
                        classNames={{
                            cellButton: "sm:p-8 md:p-[23px] lg:p-5",
                            gridHeaderCell: "sm:p-8 md:p-[23px] lg:p-5",
                            title: "text-base font-medium",
                            gridHeader: "bg-inherit shadow-none",
                            headerWrapper: "py-4",
                        }}
                        value={dates}
                        onChange={(dates) => setBookValue("dates", dates)}
                    />
                </div>
                <div className="text-right">
                    <Button
                        variant="light"
                        className="underline"
                        disableRipple
                        onPress={() => setBookValue("dates", null)}
                    >
                        {btnMsg("Clear dates")}
                    </Button>
                </div>
            </div>
        </>
    );
};

export default DateRangePicker;