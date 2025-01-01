"use client"
import React from "react"
import { RangeCalendar as RangeCalendarDefault, RangeCalendarProps } from "@nextui-org/react"
import { cn } from "@/utils/dom.util";
import Translate from "./Translate";

const RangeCalendar: React.FC<RangeCalendarProps> = ({
    classNames,
    ...props
}) => {
    return (
        <Translate className="w-[inherit] h-[inherit] bg-inherit">
            <RangeCalendarDefault
                aria-label="Date range calendar picker"
                color="secondary"
                allowsNonContiguousRanges
                pageBehavior="visible"
                {...props}
                classNames={{
                    ...classNames,
                    base: cn("shadow-none w-full bg-inherit", classNames?.base),
                    cellButton: cn("aria-[disabled=true]:line-through aria-[disabled=true]:!bg-inherit aria-[disabled=true]:!text-default-300", classNames?.cellButton),
                    title: cn("text-base font-medium", classNames?.title),
                    gridHeader: cn("bg-inherit shadow-none", classNames?.gridHeader),
                    headerWrapper: cn("bg-inherit", classNames?.headerWrapper),
                    gridWrapper: cn("overflow-visible w-full", classNames?.gridWrapper),
                    content: cn("w-full", classNames?.content),
                }}
            />
        </Translate>
    );
};

export default RangeCalendar;