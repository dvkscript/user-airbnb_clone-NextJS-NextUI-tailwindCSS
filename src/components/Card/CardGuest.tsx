"use client"
import InputCount from "@/components/Input/InputCount";
import useDictionary from "@/hooks/useDictionary";
import { cn } from "@/utils/dom.util";
import { Divider, Spacer } from "@nextui-org/react";
import React, { useCallback, useEffect, useState } from "react"
import isEqual from "lodash.isequal";

const initialValues = {
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
}
interface CardGuestProps {
    className?: string;
    isDivider?: boolean;
    minGuest?: number;
    maxGuest?: number;
    values?: typeof initialValues;
    onValueChange?: (values: typeof initialValues) => void;
}

const CardGuest: React.FC<CardGuestProps> = ({
    className,
    isDivider,
    minGuest = 1,
    maxGuest = 16,
    values,
    onValueChange
}) => {
    const [formData, setFormData] = useState(initialValues);
    const formMsg = useDictionary("common", d => d.forms.guests.options).d;

    const setFormValue = useCallback(<T extends typeof formData, K extends keyof T>(key: K, value: T[K]) => {
        const newValues = {
            ...formData,
            [key]: value,
        }
        setFormData(newValues);
        if (onValueChange) {
            onValueChange(newValues);
        }
    }, [formData, onValueChange]);

    useEffect(() => {
        if (values && !isEqual(values, formData)) {
            setFormData(values);
        }
    },[values, formData]);

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
                    minValue={minGuest}
                    maxValue={maxGuest - formData.children}
                    value={formData.adults}
                    onValueChange={(v) => setFormValue("adults", v)}
                />
            </div>
            <Spacer y={3} />
            {isDivider && (<>
                <Divider />
                <Spacer y={3} />
            </>)}
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
                    maxValue={maxGuest - formData.adults}
                    value={formData.children}
                    onValueChange={(v) => setFormValue("children", v)}
                />
            </div>
            <Spacer y={3} />
            {isDivider && (<>
                <Divider />
                <Spacer y={3} />
            </>)}
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
                    value={formData.infants}
                    onValueChange={(v) => setFormValue("infants", v)}
                />
            </div>
            <Spacer y={3} />
            {isDivider && (<>
                <Divider />
                <Spacer y={3} />
            </>)}
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
                    maxValue={5}
                    value={formData.pets}
                    onValueChange={(v) => setFormValue("pets", v)}
                />
            </div>
        </div>
    );
};

export default CardGuest;