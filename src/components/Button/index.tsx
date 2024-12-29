"use client"
import React, { forwardRef, useEffect } from "react"
import { As, Button as ButtonDefault, ButtonProps as ButtonDefaultProps } from '@nextui-org/react';
import LoaderPulse, { LoaderPulseProps } from "../Loader/LoaderPulse";
import { cn } from "@/utils/dom.util";
import Translate from "../Common/Translate";

type ButtonProps = ButtonDefaultProps & {
    loaderProps?: LoaderPulseProps;
    innerProps?: {
        className?: string;
        as?: As<any>;
    };
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    children,
    isLoading,
    color = "default",
    className,
    loaderProps,
    onClick,
    type,
    translate,
    innerProps,
    ...props
}, ref) => {

    useEffect(() => {},[onClick])

    return (
        <ButtonDefault
            type={type}
            data-focus="false"
            data-focus-visible="false"
            isLoading={isLoading}
            color={color}
            className={cn(color === "secondary" && "data-[loading]:bg-default-400", className)}
            spinner={<LoaderPulse color="#fff" {...loaderProps} />}
            disableRipple
            translate={type === "submit" ? "no" : translate}
            radius="sm"
            {...props}
            ref={ref}
        >
            {
                type === "submit" ? (
                    <Translate {...innerProps} isExcLocaleSystem isTrans={translate !== "no"}>
                        {children}
                    </Translate>
                ) : (
                    children
                )
            }
        </ButtonDefault>
    );
});

Button.displayName = "Button";

export default Button;