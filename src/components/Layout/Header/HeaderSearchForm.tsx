"use client";
import useDictionary from '@/hooks/useDictionary';
import useWindowEvent from '@/hooks/useWindowEvent';
import useUrl from '@/hooks/useUrl';
import { Dictionary } from '@/libs/dictionary.lib';
import { cn } from '@/utils/dom.util';
import { Button, ButtonGroup, Input, InputProps } from '@nextui-org/react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

interface HeaderSearchFormProps {
    duration?: number;
};

const HeaderSearchForm: FC<HeaderSearchFormProps> = ({
    duration = 300
}) => {
    const { isScroll } = useWindowEvent();
    const [searchBtn, setSearchBtn] = useState<"location" | "time" | "guests" | null>(null);
    const { t } = useDictionary<"common", Dictionary["common"]["header"]["search"]>("common", (d) => d.header.search)
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const { pathnames } = useUrl();
    const search = useSearchParams();
    const drawerOpen = JSON.parse(search.get("drawer_open") ?? "false");
    const isActive = useMemo(() => {
        if (!!pathnames[1] || drawerOpen) return true;
        return isScroll;
    }, [isScroll, drawerOpen, pathnames])
    
    const handleSearchBtn = useCallback((value: "location" | "time" | "guests") => {
        setSearchBtn(value)
    }, []);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        setSearchBtn(null);
    }, [isActive]);

    const searchBtnEl = useMemo(() => (
        <ButtonGroup
            className={cn(
                "rounded-full bg-inherit overflow-hidden border-2 shadow-sm hover:shadow-md transition-shadow w-[360px] min-[888px]:w-auto",
            )}
            size='lg'
        >
            <Button
                className='bg-inherit font-medium text-sm'
                onPress={() => handleSearchBtn("location")}
            >
                <span className='truncate w-full'>
                    {t("anywhere")}
                </span>
            </Button>
            <Button
                className={cn(
                    'bg-inherit font-medium text-sm relative',
                    "before:w-[1.5px] before:h-[50%] before:absolute before:bg-default-300 before:right-0 before:translate-y-[-50%] before:top-[50%]",
                    "after:w-[1.5px] after:h-[50%] after:absolute after:bg-default-300 after:left-0 after:translate-y-[-50%] after:top-[50%]",
                )}
                onPress={() => handleSearchBtn("time")}
            >
                <span className='truncate w-full'>
                    {t("any week")}
                </span>
            </Button>
            <Button
                className='bg-inherit text-default-400 text-sm pl-6 pr-2'
                onPress={() => handleSearchBtn("guests")}
            >
                <span className='truncate w-full'>
                    {t("add guests")}
                </span>
                <div className='p-2 bg-rose-500 text-white rounded-full'>
                    <Search size={18} />
                </div>
            </Button>
        </ButtonGroup>
    ), [handleSearchBtn, t]);


    const inputClassNames = useMemo(() => ({
        label: "text-sm font-medium text-nowrap",
        input: "text-sm font-medium pr-2 text-ellipsis",
        clearButton: "top-1/2 right-4 -translate-y-1/4 text-xl text-default-500",
        inputWrapper: "border-none px-6 py-3.5 hover:bg-default-200 data-[focus=true]:hover:bg-inherit active:hover:bg-inherit h-[66px] w-full",
        base: "w-full"
    }), []);

    const inputProps = useCallback(() => {
        return {
            type: 'text',
            isClearable: true,
            variant: 'bordered',
            classNames: {
                ...inputClassNames,
            },
            autoComplete: 'off',
            radius: 'full'
        } as InputProps;
    }, [inputClassNames]);

    const searchInputEl = useMemo(() => (
        <div
            className={cn(
                'flex flex-col justify-center items-center gap-y-5 bg-inherit w-fit px-6',
            )}
        >
            <div className='flex bg-inherit'>
                <Button
                    className="hover:opacity-100 bg-inherit rounded-full font-medium transition-background text-base px-5"
                >
                    {t("stays")}
                </Button>
                <Button
                    className="hover:bg-default-200 bg-inherit rounded-full transition-background text-base px-5"
                >
                    {t("experiences")}
                </Button>
                <Button
                    className="hover:bg-default-200 bg-inherit rounded-full transition-background text-base px-5"
                >
                    {t("online Experiences")}
                </Button>
            </div>
            <div className='flex flex-row gap-x-[1px] rounded-full overflow-hidden border-1.5 shadow bg-inherit w-full max-w-[848px] items-center'>
                <Input
                    {...inputProps()}
                    classNames={{
                        ...inputClassNames,
                        inputWrapper: inputClassNames.inputWrapper.replace("px-6", "px-8"),
                    }}
                    label={t("where")}
                    placeholder={t("search destinations")}
                />
                <div className='w-[3px] h-6 bg-default-300' />
                <Input
                    {...inputProps()}
                    classNames={{
                        ...inputClassNames,
                        base: "w-full max-w-[140.5px]"
                    }}
                    label={t("check in")}
                    placeholder={t("add dates")}
                />
                <div className='w-[3px] h-6 bg-default-300' />
                <Input
                    {...inputProps()}
                    classNames={{
                        ...inputClassNames,
                        base: "w-full max-w-[140.5px]"
                    }}
                    label={t("check out")}
                    placeholder={t("add dates")}
                />
                <div className='w-[3px] h-6 bg-default-300' />
                <Input
                    {...inputProps()}
                    classNames={{
                        ...inputClassNames,
                        clearButton: "top-1/2 right-2.5 -translate-y-1/5 text-xl text-default-500 block opacity-100",
                        base: "w-full cursor-pointer opacity-100",
                        inputWrapper: "pointer-events-auto cursor-pointer " + inputClassNames.inputWrapper
                    }}
                    label={t("who")}
                    placeholder={t("add guests")}
                    endContent={
                        <div
                            className='p-4 bg-rose-500 text-white rounded-full absolute top-[50%] translate-y-[-50%] right-2'
                        >
                            <Search size={18} />
                        </div>
                    }
                    isDisabled
                />
            </div>
        </div>
    ), [t, inputClassNames, inputProps]);


    if (!isLoaded && !!pathnames[1]) {
        return null;
    };

    return (
        <>
            <div
                className={cn(
                    "w-fit py-[inherit] bg-inherit",
                    `duration-${duration}`,
                    !isActive && "mt-20 xl:mt-0"
                )}
                style={{
                    height: isActive ? "calc(5rem - 2rem)" : 'calc(10.5rem - 2rem)'
                }}
            >
                <div className='relative xl:static py-[inherit] w-[inherit]'>
                    <div className={cn(
                        'absolute left-0 xl:left-1/2 -top-4 xl:top-4 xl:-translate-x-1/2',
                        (isActive && !searchBtn) ?
                            `visible opacity-100 z-[1] transition-[opacity_transform] duration-${duration} translate-x-0 translate-y-0` :
                            'invisible opacity-0 scale-100 xl:scale-[1.8] translate-y-[100%] translate-x-[40%] xl:translate-y-[60%]',
                    )}
                    >
                        {searchBtnEl}
                    </div>
                </div>
                <div
                    className={cn(
                        'fixed inset-0 top-0 mt-[inherit] transition-opacity duration-300',
                        `duration-${duration}`,
                        !searchBtn ? "opacity-0 pointer-events-none" : "opacity-20 pointer-events-auto bg-black"
                    )}
                    onClick={() => {
                        if (!searchBtn) return;
                        setSearchBtn(null)
                    }}
                />
                <div
                    className={cn(
                        'absolute inset-x-0 top-0 py-[inherit] mt-[inherit]',
                        `duration-${duration}`,
                        (isActive && !searchBtn) ? "h-[inherit]" : 'h-fit bg-inherit',
                        !!searchBtn && "pt-20 xl:pt-[inherit]"
                    )}
                >
                    <div className={cn(
                        "w-fit mx-auto",
                        (isActive && !searchBtn) ?
                            'invisible scale-50 opacity-0 -translate-x-[30%] xl:translate-x-0 -translate-y-full xl:-translate-y-1/2' :
                            `visible z-[1] opacity-100 transition-[opacity,transform] duration-${duration}`,
                    )}>
                        {searchInputEl}
                    </div>
                </div>
            </div>
        </>
    )
}

export default HeaderSearchForm