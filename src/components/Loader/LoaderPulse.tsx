"use client"
import { cn } from "@/utils/dom.util";
import { CircleDot } from "lucide-react";
import React from "react";

export type LoaderPulseProps = {
    className?: string;
    color?: string;
    size?: number;
    space?: number;
}

const LoaderPulse: React.FC<LoaderPulseProps> = ({
    className,
    color,
    size = 15,
    space = 3
}) => {

    return (
        <div
            className={cn(
                className,
                'flex justify-center items-center w-fit',
                !color && "fill-default-800 text-default-800"
            )}
            style={{
                columnGap: `${space}px`,
                ...(color && {
                    color: color,
                    fill: color,
                })
            }}
        >
            <span className='sr-only'>Loading...</span>
            <CircleDot size={size} className="fill-inherit text-inherit animate-pulse-scale [animation-delay:-0.24s]" />
            <CircleDot size={size} className="fill-inherit text-inherit animate-pulse-scale [animation-delay:-0.12s]" />
            <CircleDot size={size} className="fill-inherit text-inherit animate-pulse-scale" />
        </div>
    );
};

export default LoaderPulse;