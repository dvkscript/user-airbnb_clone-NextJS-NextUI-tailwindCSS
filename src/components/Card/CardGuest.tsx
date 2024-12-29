"use client"
import InputCount from "@/components/Input/InputCount";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";
import useDictionary from "@/hooks/useDictionary";
import useRoomStore from "@/hooks/useRoomStore";
import { cn } from "@/utils/dom.util";
import { Spacer } from "@nextui-org/react";
import React from "react"

interface CardGuestProps {
    className?: string;
}

const CardGuest: React.FC<CardGuestProps> = ({
    className
}) => {
    const { bookForm, setBookValue, maxGuest } = useRoomStore(bookingRoomSelector)

    const formMsg = useDictionary("common", d => d.forms.guests.options).d;

    return (
        <div className={cn(className)}>
            <div className="w-full flex justify-between">
                <div>
                    <span className="block text-base">
                        {formMsg?.adults.label}
                    </span>
                    <span className="block text-sm text-default-700">
                        {formMsg?.adults.description}
                    </span>
                </div>
                <InputCount
                    minValue={1}
                    maxValue={maxGuest - bookForm.children}
                    value={bookForm.adults}
                    onValueChange={(v) => setBookValue("adults", v)}
                />
            </div>
            <Spacer y={3} />
            <div className="w-full flex justify-between">
                <div>
                    <span className="block text-base">
                        {formMsg?.children.label}
                    </span>
                    <span className="block text-sm text-default-700">
                        {formMsg?.children.description}
                    </span>
                </div>
                <InputCount
                    maxValue={maxGuest - bookForm.adults}
                    value={bookForm.children}
                    onValueChange={(v) => setBookValue("children", v)}
                />
            </div>
            <Spacer y={3} />
            <div className="w-full flex justify-between">
                <div>
                    <span className="block text-base">
                        {formMsg?.infants.label}
                    </span>
                    <span className="block text-sm text-default-700">
                        {formMsg?.infants.description}
                    </span>
                </div>
                <InputCount
                    maxValue={5}
                    value={bookForm.infants}
                    onValueChange={(v) => setBookValue("infants", v)}
                />
            </div>
            <Spacer y={3} />
            <div className="w-full flex justify-between">
                <div>
                    <span className="block text-base">
                        {formMsg?.pets.label}
                    </span>
                    <span className="block text-sm underline cursor-pointer">
                        {formMsg?.pets.description}
                    </span>
                </div>
                <InputCount
                    maxValue={1}
                    value={bookForm.pets}
                    onValueChange={(v) => setBookValue("pets", v)}
                />
            </div>
        </div>
    );
};

export default CardGuest;