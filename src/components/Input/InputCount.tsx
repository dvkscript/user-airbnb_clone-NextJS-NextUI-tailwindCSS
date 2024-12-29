"use client"
import { cn } from "@/utils/dom.util";
import { Button } from "@nextui-org/react";
import { Minus, Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react"

interface InputCountProps {
    spacing?: number;
    minValue?: number;
    maxValue?: number;
    className?: string;
    value?: number;
    onValueChange?: (value: number) => void;
}

const InputCount: React.FC<InputCountProps> = ({
    spacing = 1,
    maxValue,
    minValue = 0,
    className,
    value,
    onValueChange
}) => {
    const [count, setCount] = useState(minValue);

    const handleCountChange = useCallback((name: "increment" | "decrement") => {
        let value = 0;
        switch (name) {
            case "increment":
                if (typeof maxValue === "number" && count >= maxValue) return;
                value = count + spacing;
                setCount(value);
                if (onValueChange) onValueChange(value)
                break;
            case "decrement":
                if (typeof minValue === "number" && count <= minValue) return;
                value = count - spacing;
                setCount(value);
                if (onValueChange) onValueChange(value)
                break;
            default:
                break;
        }
    }, [maxValue, count, spacing, onValueChange, minValue]);

    useEffect(() => {
        if (value) setCount(value);
    }, [value]);

    return (
        <div
            className={cn(
                "flex justify-center items-center",
                className
            )}
        >
            <Button
                variant="bordered"
                radius="full"
                size="sm"
                isIconOnly
                className={cn("text-default-600 pointer-events-auto")}
                disableRipple
                isDisabled={typeof minValue === "number" ? minValue >= count : false}
                onPress={() => handleCountChange("decrement")}
                style={{
                    cursor: typeof minValue === "number" && minValue >= count ? "cursor-not-allowed" : "pointer"
                }}
            >
                <Minus size={16} />
            </Button>
            <span className="text-center min-w-10">
                {count}
            </span>
            <Button
                variant="bordered"
                radius="full"
                size="sm"
                isIconOnly
                className={cn("text-default-600 pointer-events-auto",)}
                disableRipple
                isDisabled={typeof maxValue === "number" ? maxValue <= count : false}
                onPress={() => handleCountChange("increment")}
                style={{
                    cursor: typeof maxValue === "number" && maxValue <= count ? "not-allowed" : "pointer"
                }}
            >
                <Plus size={16} />
            </Button>
        </div>
    );
};

export default InputCount;