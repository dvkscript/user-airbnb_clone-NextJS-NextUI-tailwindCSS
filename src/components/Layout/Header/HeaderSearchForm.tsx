"use client";
import useDictionary from '@/hooks/useDictionary';
import useWindowEvent from '@/hooks/useWindowEvent';
import useUrl from '@/hooks/useUrl';
import { Dictionary } from '@/libs/dictionary.lib';
import { cn, formatDate } from '@/utils/dom.util';
import { Autocomplete, AutocompleteItem, Button, ButtonGroup, RangeCalendarProps } from '@nextui-org/react';
import { MapPin, Search, X } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useDebounce from '@/hooks/useDebounce';
import { mapSearch, MapSearchResult } from '@/libs/map';
import LoaderPulse from '@/components/Loader/LoaderPulse';
import CardGuest from '@/components/Card/CardGuest';
import RangeCalendar from '@/components/Common/RangeCalendar';
import { useDateFormatter } from '@react-aria/i18n';
import useRoomStore from '@/hooks/useRoomStore';
import { bookingRoomSelector } from '@/hooks/selectors/roomSelector';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
import { useRouter } from 'next-nprogress-bar';

const initialFormData = {
    q: "",
    dates: null as RangeCalendarProps["value"] | null,
    guests: 0,
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
}
interface HeaderSearchFormProps {
    duration?: number;
};

const HeaderSearchForm: FC<HeaderSearchFormProps> = ({
    duration = 300
}) => {
    const router = useRouter()
    const { isScroll, scrollY } = useWindowEvent();
    const { t } = useDictionary<"common", Dictionary["common"]["header"]["search"]>("common", (d) => d.header.search)
    const btnMsg = useDictionary("common", (d) => d.buttons).t;
    const unitMsg = useDictionary("common", (d) => d.units.items).t;
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { pathnames, searchParams } = useUrl();
    const search = useSearchParams();
    const drawerOpen = JSON.parse(search.get("drawer_open") ?? "false");
    const scrollYDebounce = useDebounce(scrollY, 300);

    const [isActive, setIsActive] = useState(false);

    const locale = useParams().lang as string;

    const { searchParamKeys } = useRoomStore(bookingRoomSelector);
    const mapSearchData = useRef<MapSearchResult[]>([]);

    const searchInputRef = useRef<HTMLInputElement | null>(null)
    const searchDateCheckInRef = useRef<HTMLButtonElement | null>(null)
    const searchDateCheckoutRef = useRef<HTMLButtonElement | null>(null)
    const searchGuestsBtnRef = useRef<HTMLButtonElement | null>(null)

    const [formData, setFormData] = useState(initialFormData);

    const setFormValue = useCallback(<T extends typeof formData, K extends keyof T>(key: K, value: T[K]) => {
        const newValues = {
            ...formData,
            [key]: value
        }

        newValues.guests = newValues.adults + newValues.children;

        setFormData(newValues)
    }, [formData])

    const dateFormatter = useDateFormatter({
        day: "numeric",
        month: "short",
    });

    const minDate = useMemo(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const timeZone = getLocalTimeZone();
        const currentDate = today(timeZone);

        if (currentHour >= 16) {
            return currentDate.add({ days: 1 });
        }
        return currentDate;
    }, []);

    const inputValueDebounce = useDebounce<string>(formData.q.trim(), 500);

    const searchParamValidate = (search: URLSearchParams, key: string, value: number | string) => {
        if (typeof value === "number") {
            if (value !== 0) {
                search.set(key, `${value}`)
            } else {
                search.delete(key)
            }
        } else {
            if (value.trim() !== "") {
                search.set(key, value)
            } else {
                search.delete("q")
            };
        }

    }

    const handleSearchSubmit = useCallback(() => {
        const search = new URLSearchParams(searchParams);
        const { guests, dates, adults, children, infants, pets, q } = formData;

        if (dates) {
            search.set(searchParamKeys.checkIn, dates.start.toString());
            search.set(searchParamKeys.checkout, dates.end.toString());
        } else {
            search.delete(searchParamKeys.checkIn);
            search.delete(searchParamKeys.checkout);
        };
        
        searchParamValidate(search, searchParamKeys.guests, guests);
        searchParamValidate(search, searchParamKeys.adults, adults);
        searchParamValidate(search, searchParamKeys.children, children);
        searchParamValidate(search, searchParamKeys.infants, infants);
        searchParamValidate(search, searchParamKeys.pets, pets);
        searchParamValidate(search, "q", q);

        router.replace(`?${search.toString()}`);
        setIsActive(false);
    }, [searchParams, formData, searchParamKeys, router])

    const fetchData = useCallback(async (value: string) => {
        if (!value) return;
        setIsLoading(true);

        const data = await mapSearch(value, {
            locale
        });

        mapSearchData.current = data;
        setIsLoading(false);
    }, [locale]);

    useEffect(() => {
        if (!inputValueDebounce) {
            mapSearchData.current = []
            return;
        };
        const find = mapSearchData.current.find(d => d.label.startsWith(inputValueDebounce));

        if (find) return;
        fetchData(inputValueDebounce);
    }, [fetchData, inputValueDebounce]);

    useEffect(() => {
        setIsLoaded(true);
        const newSearch = new URLSearchParams(searchParams);
        const checkIn = formatDate(newSearch.get(searchParamKeys.checkIn) || "", "yyyy-mm-dd");
        const checkout = formatDate(newSearch.get(searchParamKeys.checkout) || "", "yyyy-mm-dd");

        const searchValues = {
            adults: Number(newSearch.get(searchParamKeys.adults)) || initialFormData.adults,
            children: Number(newSearch.get(searchParamKeys.children)) || initialFormData.children,
            infants: Number(newSearch.get(searchParamKeys.infants)) || initialFormData.infants,
            pets: Number(newSearch.get(searchParamKeys.pets)) || initialFormData.pets,
            dates: initialFormData.dates,
            q: newSearch.get("q") || initialFormData.q,
            guests: 0,
        };
        searchValues.guests = searchValues.adults + searchValues.children;
        if (checkIn && checkout) {
            const checkInDate = new Date(checkIn);
            const checkoutDate = new Date(checkout);
            const minDateParse = new Date(minDate.toString());

            const checkInTime = checkInDate.getTime();
            const checkoutTime = checkoutDate.getTime();
            const minTime = minDateParse.getTime();

            if (
                minTime <= checkInTime &&
                checkInTime < checkoutTime
            ) {
                searchValues.dates = {
                    start: new CalendarDate(checkInDate.getFullYear(), checkInDate.getMonth() + 1, checkInDate.getDate()) as any,
                    end: new CalendarDate(checkoutDate.getFullYear(), checkoutDate.getMonth() + 1, checkoutDate.getDate()) as any
                }
            };
        };

        setFormData(searchValues);
    }, [searchParams, searchParamKeys, minDate]);

    useEffect(() => {
        if (scrollYDebounce !== scrollY) {
            setIsActive(false);
        }
    }, [scrollY, scrollYDebounce]);

    if (!isLoaded && !!pathnames[1]) {
        return null;
    };

    return (
        <>
            <div
                className={cn(
                    "group/container",
                    "w-fit py-[inherit] bg-inherit transition-height",
                    `duration-${duration}`,
                    "h-[calc(5rem-2rem)]",
                    "[&:not([data-active=true])]:mt-20",
                    "[&:not([data-active=true])]:xl:mt-0",
                    "[&:not([data-active=true])]:h-[calc(10.5rem-2rem)]",
                )}
                data-active={!!pathnames[1] || drawerOpen || isScroll || undefined}
            >
                <div
                    className='relative xl:static py-[inherit] w-[inherit]'
                >
                    <div
                        className={cn(
                            'absolute left-0 xl:left-1/2 -top-4 xl:top-4 z-[1]',
                            `duration-${duration}`,
                            "invisible",
                            "opacity-0",
                            "xl:scale-[1.8]",
                            `translate-y-[100%]`,
                            `xl:translate-y-[60%]`,
                            `translate-x-[40%]`,
                            "xl:-translate-x-1/2",
                            "group-data-[active=true]/container:data-[active=true]:visible",
                            "group-data-[active=true]/container:data-[active=true]:opacity-100",
                            "group-data-[active=true]/container:data-[active=true]:z-[1]",
                            "group-data-[active=true]/container:data-[active=true]:transition-[opacity,transform]",
                            `group-data-[active=true]/container:data-[active=true]:translate-y-0`,
                            `group-data-[active=true]/container:data-[active=true]:translate-x-0`,
                            `group-data-[active=true]/container:data-[active=true]:xl:-translate-x-1/2`,
                            `group-data-[active=true]/container:data-[active=true]:scale-100`,
                        )}
                        data-active={!isActive || undefined}
                    >
                        <ButtonGroup
                            className={cn(
                                "rounded-full bg-inherit overflow-hidden border-2 shadow-sm hover:shadow-md transition-shadow w-[360px] min-[888px]:w-auto",
                            )}
                            size='lg'
                        >
                            <Button
                                className='bg-inherit font-medium text-sm'
                                onPress={() => {
                                    const searchInput = searchInputRef.current;
                                    if (!searchInput) return;

                                    setIsActive(true);
                                    const timeoutId = setTimeout(() => {
                                        requestAnimationFrame(() => searchInput.focus());
                                    }, 300);

                                    return () => clearTimeout(timeoutId);
                                }}
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
                                onPress={() => {
                                    const searchTimeBtn = searchDateCheckInRef.current;
                                    if (!searchTimeBtn) return;
                                    setIsActive(true);
                                    requestAnimationFrame(() => searchTimeBtn.focus());
                                }}
                            >
                                <span className='truncate w-full'>
                                    {t("any week")}
                                </span>
                            </Button>
                            <Button
                                className='bg-inherit text-default-400 text-sm pl-6 pr-2'
                                onPress={() => {
                                    const searchGuestsBtn = searchGuestsBtnRef.current;
                                    if (!searchGuestsBtn) return;

                                    setIsActive(true);
                                    requestAnimationFrame(() => searchGuestsBtn.focus());
                                }}
                            >
                                <span className='truncate w-full'>
                                    {t("add guests")}
                                </span>
                                <div className='p-2 bg-primary text-white rounded-full'>
                                    <Search size={18} />
                                </div>
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div
                    className={cn(
                        'fixed inset-0 top-0 mt-[inherit] transition-opacity duration-300',
                        `duration-${duration}`,
                        "opacity-0 pointer-events-none invisible",
                        "data-[active=true]:opacity-20",
                        "data-[active=true]:pointer-events-auto",
                        "data-[active=true]:visible",
                        "data-[active=true]:bg-black",
                    )}
                    onClick={() => {
                        setIsActive(false)
                    }}
                    data-active={isActive || undefined}
                />
                <div
                    className={cn(
                        'absolute inset-x-0 top-0 py-[inherit] mt-[inherit] bg-inherit',
                        `duration-${duration}`,
                        "h-[inherit]",
                        "group-[&:not([data-active=true])]/container:h-fit",
                        "data-[active=true]:h-fit",
                        "data-[active=true]:pt-20",
                        "data-[active=true]:xl:pt-[inherit]",
                    )}
                    data-active={isActive || undefined}
                >
                    <div
                        className={cn(
                            "w-full mx-auto",
                            "invisible scale-50 opacity-0 -translate-x-[30%] xl:translate-x-0 -translate-y-full xl:-translate-y-1/2 transition-[opacity,transform]",

                            "group-[&:not([data-active=true])]/container:visible",
                            "group-[&:not([data-active=true])]/container:scale-100",
                            "group-[&:not([data-active=true])]/container:z-[1]",
                            "group-[&:not([data-active=true])]/container:opacity-100",
                            "group-[&:not([data-active=true])]/container:translate-y-0",
                            "group-[&:not([data-active=true])]/container:translate-x-0",
                            "group-[&:not([data-active=true])]/container:transition-[opacity,transform]",
                            `group-[&:not([data-active=true])]/container:duration-${duration}`,

                            "data-[active=true]:visible",
                            "data-[active=true]:scale-100",
                            "data-[active=true]:z-[1]",
                            "data-[active=true]:opacity-100",
                            "data-[active=true]:translate-y-0",
                            "data-[active=true]:translate-x-0",
                            "data-[active=true]:transition-[opacity,transform]",
                            `data-[active=true]:duration-${duration}`,
                        )}
                        data-active={isActive || undefined}
                    >
                        <div
                            className={cn(
                                'flex flex-col justify-center items-center gap-y-5 bg-inherit w-full px-6',
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
                            <div
                                className={cn(
                                    'rounded-full border-1.5 border-default-200 shadow w-full max-w-[852px] h-[66px] z-0',
                                    "has-[[data-active=true]]:bg-default-200",
                                    "group/form-container",
                                    "relative"
                                )}
                            >
                                <div
                                    className='overflow-hidden flex flex-row items-center w-full rounded-[inherit] border-inherit h-full bg-inherit'
                                >
                                    <div
                                        className='flex-1 h-full rounded-[inherit] group/location'
                                        tabIndex={-1}
                                        onBlur={(e) => {
                                            if (e.currentTarget.contains(e.relatedTarget)) return;
                                            e.currentTarget.removeAttribute("data-active");

                                            const input = searchInputRef.current;

                                            if (input && input.getAttribute("data-active") === "true") {
                                                input.removeAttribute("data-active")
                                            }
                                        }}
                                    >
                                        <Autocomplete
                                            aria-label="room search by address"
                                            variant='flat'
                                            classNames={{
                                                popoverContent: "w-[26.625rem] mt-1.5",
                                                clearButton: "hidden group-data-[active=true]/location:inline-flex"
                                            }}
                                            isDisabled={!isLoaded}
                                            selectorButtonProps={{
                                                className: "hidden",
                                            }}
                                            label={t("where")}
                                            placeholder={t("search destinations")}
                                            type='text'
                                            listboxProps={{
                                                selectionMode: "single",
                                                hideSelectedIcon: true,
                                                hideEmptyContent: !isLoading,
                                                emptyContent: <div className='mx-auto w-fit py-1.5'>
                                                    <LoaderPulse />
                                                </div>,
                                            }}
                                            inputValue={formData.q}
                                            onValueChange={(v) => {
                                                setFormValue("q", v);
                                            }}
                                            clearButtonProps={{
                                                onPress: () => {
                                                    setFormValue("q", "");
                                                }
                                            }}
                                            translate='no'
                                            defaultFilter={() => true}
                                            onSelectionChange={(key) => {
                                                const find = mapSearchData.current.find((d) => ([d.x, d.y].join("-") === key));

                                                if (find) {
                                                    setFormValue("q", find.label);
                                                };
                                                const input = searchInputRef.current;
                                                if (!input) return;
                                                input.setAttribute("data-active", "true");
                                            }}
                                            isLoading={isLoading}
                                            items={(!formData.q || isLoading) ? [] : mapSearchData.current}
                                            inputProps={{
                                                type: 'text',
                                                variant: 'bordered',
                                                classNames: {
                                                    label: "text-sm font-medium text-nowrap overflow-visible",
                                                    input: "text-sm font-medium pr-2 text-ellipsis ",
                                                    clearButton: "top-1/2 right-4 -translate-y-1/4 text-xl text-default-500",
                                                    inputWrapper: "rounded-[inherit] border-none shadow-none bg-transparent px-8 py-3.5 h-full w-full",
                                                    base: "w-full h-full rounded-[inherit] !bg-inherit",
                                                },
                                                disableAnimation: true,
                                                autoComplete: 'off',
                                            }}
                                            className={cn(
                                                "rounded-[inherit] h-full flex-1 relative z-0",
                                                "group-data-[active=true]/location:z-10",
                                                "group-data-[active=true]/location:bg-content1",
                                                "group-data-[active=true]/location:shadow",
                                                "group-has-[#search-time-start[data-active=true]]/form-container:hover:bg-default-300",
                                                "before:absolute",
                                                "before:w-[calc(100%+2px)]",
                                                "before:-z-20",
                                                "before:hidden",
                                                "before:hover:block",
                                                "group-data-[active=true]/location:before:hover:hidden",
                                                "before:h-8",
                                                "before:top-1/2",
                                                "before:-translate-y-1/2",
                                                "before:left-[-1px]",
                                                "before:bg-content1",
                                                "group-has-[[data-active=true]]/form-container:before:bg-inherit",
                                                "group-has-[#search-time-start[data-active=true]]/form-container:before:top-0",
                                                "group-has-[#search-time-start[data-active=true]]/form-container:before:left-1/3",
                                                "group-has-[#search-time-start[data-active=true]]/form-container:before:h-full",
                                                "group-has-[#search-time-start[data-active=true]]/form-container:before:translate-y-0",
                                                "group-has-[#search-time-start[data-active=true]]/form-container:before:rounded-[inherit]",
                                                "group-has-[#search-time-start[data-active=true]]/form-container:before:bg-inherit",
                                            )}
                                            id='search-location'
                                            ref={searchInputRef}
                                            onFocus={(e) => {
                                                e.currentTarget.setAttribute("data-active", "true");
                                                const wrapper = e.currentTarget.closest('.group\\/location');
                                                if (!wrapper) return;
                                                wrapper.setAttribute("data-active", "true");
                                            }}
                                        >
                                            {
                                                (item) => (
                                                    <AutocompleteItem
                                                        textValue={item.label}
                                                        key={[item.x, item.y].join("-")}
                                                        startContent={<div className='bg-default-300 size-12 inline-flex justify-center items-center rounded-md'>
                                                            <MapPin />
                                                        </div>}
                                                    >
                                                        <span className='line-clamp-2'>
                                                            {item.label}
                                                        </span>
                                                    </AutocompleteItem>
                                                )
                                            }
                                        </Autocomplete>
                                    </div>
                                    <div className='border-r h-8 w-0 border-inherit -z-10' />
                                    <div
                                        style={{
                                            display: "inherit",
                                            alignItems: "inherit",
                                            justifyContent: "inherit",
                                            borderRadius: "inherit",
                                        }}
                                        className={cn(
                                            'h-full flex-1 max-w-[calc(100%/3)] rounded-[inherit] border-inherit z-0 data-[active=true]:z-10',
                                            "group/dates"
                                        )}
                                        tabIndex={-1}
                                        onBlur={(e) => {
                                            if (e.currentTarget.contains(e.relatedTarget)) return;
                                            e.currentTarget.removeAttribute("data-active");

                                            const checkoutBtn = searchDateCheckoutRef.current;
                                            const checkInBtn = searchDateCheckInRef.current;

                                            if (checkoutBtn && checkoutBtn.getAttribute("data-active") === "true") {
                                                checkoutBtn.removeAttribute("data-active")
                                            }
                                            if (checkInBtn && checkInBtn.getAttribute("data-active") === "true") {
                                                checkInBtn.removeAttribute("data-active")
                                            }
                                        }}
                                    >
                                        <Button
                                            onFocus={(e) => {
                                                const checkoutBtn = searchDateCheckoutRef.current;
                                                if (checkoutBtn && checkoutBtn.getAttribute("data-active") === "true") {
                                                    checkoutBtn.removeAttribute("data-active")
                                                }

                                                e.currentTarget.setAttribute("data-active", "true");

                                                const parentElement = e.currentTarget.parentElement;
                                                if (!parentElement) return;

                                                parentElement.setAttribute("data-active", "true")
                                            }}
                                            className={cn(
                                                "data-[pressed=true]:scale-100 data-[focus-visible=true]:outline-0",
                                                'flex-1 h-full w-full p-0 relative overflow-visible rounded-[inherit] z-0 shadow-none',
                                                "data-[active=true]:z-10",
                                                "data-[active=true]:shadow",
                                                "data-[active=true]:bg-content1",
                                                "hover:bg-default-300",
                                                "data-[active=true]:hover:bg-content1",
                                                "before:absolute",
                                                "before:w-[calc(100%+2px)]",
                                                "before:-z-20",
                                                "before:hidden",
                                                "before:hover:block",
                                                "data-[active=true]:before:hover:hidden",
                                                "before:h-8",
                                                "before:top-1/2",
                                                "before:-translate-y-1/2",
                                                "before:left-[-1px]",
                                                "before:bg-content1",

                                                "group-has-[[data-active=true]]/form-container:before:hover:hidden",
                                                "group-has-[[data-active=true]]/form-container:before:bg-inherit",
                                                "group-has-[[data-active=true]]/form-container:before:h-full",
                                                "group-has-[[data-active=true]]/form-container:before:top-0",
                                                "group-has-[[data-active=true]]/form-container:before:translate-y-0",

                                                "group-has-[#search-location[data-active=true]]/form-container:before:hover:block",
                                                "group-has-[#search-location[data-active=true]]/form-container:before:-left-1/3",

                                                "group-has-[#search-time-end[data-active=true]]/form-container:before:hover:block",
                                                "group-has-[#search-time-end[data-active=true]]/form-container:before:left-1/3",
                                            )}
                                            variant='light'
                                            disableRipple
                                            disableAnimation
                                            isDisabled={!isLoaded}
                                            ref={searchDateCheckInRef}
                                            id='search-time-start'
                                        >
                                            <div
                                                className={cn(
                                                    "h-full w-full px-6 py-3.5 text-left rounded-[inherit] bg-inherit group-data-[active=true]:bg-content1",
                                                )}
                                            >
                                                <div className='text-xs font-medium text-nowrap text-default-600 leading-4 max-w-full truncate'>
                                                    {t("check in")}
                                                </div>
                                                <div className={cn(
                                                    'font-medium max-w-full truncate',
                                                    !formData.dates && "text-default-400"
                                                )}>
                                                    {formData.dates ? dateFormatter.format(new Date(formData.dates.start.toString())) : t("add dates")}
                                                </div>
                                                {
                                                    !!formData.dates && (
                                                        <span
                                                            onClick={() => {
                                                                setFormValue("dates", null);
                                                            }}
                                                            className='hidden group-data-[active=true]:inline-block absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 hover:bg-default-200'
                                                        >
                                                            <X size={15} strokeWidth={2.9} />
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </Button>
                                        <div className='border-r h-8 border-inherit -z-10' />
                                        <Button
                                            onFocus={(e) => {
                                                const checkInBtn = searchDateCheckInRef.current;
                                                if (checkInBtn && checkInBtn.getAttribute("data-active") === "true") {
                                                    checkInBtn.removeAttribute("data-active")
                                                }

                                                e.currentTarget.setAttribute("data-active", "true");

                                                const parentElement = e.currentTarget.parentElement;
                                                if (!parentElement) return;

                                                parentElement.setAttribute("data-active", "true")
                                            }}
                                            className={cn(
                                                "data-[pressed=true]:scale-100 data-[focus-visible=true]:outline-0",
                                                'flex-1 h-full w-full p-0 relative overflow-visible rounded-[inherit] z-0 shadow-none',
                                                "data-[active=true]:z-10",
                                                "data-[active=true]:shadow",
                                                "data-[active=true]:bg-content1",
                                                "hover:bg-default-300",
                                                "data-[active=true]:hover:bg-content1",
                                                "before:absolute",
                                                "before:w-[calc(100%+2px)]",
                                                "before:-z-20",
                                                "before:hidden",
                                                "before:hover:block",
                                                "data-[active=true]:before:hover:hidden",
                                                "before:h-8",
                                                "before:top-1/2",
                                                "before:-translate-y-1/2",
                                                "before:left-[-1px]",
                                                "before:bg-content1",

                                                "group-has-[[data-active=true]]/form-container:before:hover:hidden",
                                                "group-has-[[data-active=true]]/form-container:before:bg-inherit",
                                                "group-has-[[data-active=true]]/form-container:before:h-full",
                                                "group-has-[[data-active=true]]/form-container:before:top-0",
                                                "group-has-[[data-active=true]]/form-container:before:translate-y-0",

                                                "group-has-[#search-time-start[data-active=true]]/form-container:before:hover:block",
                                                "group-has-[#search-time-start[data-active=true]]/form-container:before:-left-1/3",

                                                "group-has-[#search-guests[data-active=true]]/form-container:before:hover:block",
                                                "group-has-[#search-guests[data-active=true]]/form-container:before:left-1/3",
                                            )}
                                            variant='light'
                                            disableRipple
                                            disableAnimation
                                            isDisabled={!isLoaded}
                                            ref={searchDateCheckoutRef}
                                            id='search-time-end'
                                        >
                                            <div className={cn(
                                                "h-full w-full px-6 py-3.5 text-left rounded-[inherit] bg-inherit group-data-[active=true]:bg-content1 relative",
                                            )}>
                                                <div className='text-xs font-medium text-nowrap text-default-600 leading-4 max-w-full truncate'>
                                                    {t("check out")}
                                                </div>
                                                <div className={cn(
                                                    'font-medium max-w-full truncate',
                                                    !formData.dates && "text-default-400"
                                                )}>
                                                    {formData.dates ? dateFormatter.format(new Date(formData.dates.end.toString())) : t("add dates")}
                                                </div>
                                                {
                                                    !!formData.dates && (
                                                        <span
                                                            onClick={() => {
                                                                setFormValue("dates", null);
                                                                const checkInBtn = searchDateCheckInRef.current;
                                                                if (!checkInBtn) return;
                                                                checkInBtn.focus();
                                                            }}
                                                            className='hidden group-data-[active=true]:inline-block absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 hover:bg-default-200'
                                                        >
                                                            <X size={15} strokeWidth={2.9} />
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </Button>
                                        <div
                                            className={cn(
                                                "px-8 py-4",
                                                "hidden w-full bg-content1 shadow rounded-2xl absolute top-full left-0 mt-2.5 border",
                                                "group-data-[active=true]/dates:block",
                                            )}
                                            tabIndex={-1}
                                            data-slot="dates-modal"
                                        >
                                            <RangeCalendar
                                                visibleMonths={2}
                                                classNames={{
                                                    headerWrapper: "py-4",
                                                    cellButton: "absolute inset-0 p-[50%]",
                                                    gridHeaderCell: "p-[6.838%]",
                                                    cell: "p-[6.435%] relative",
                                                }}
                                                value={formData.dates}
                                                onChange={(dates) => {
                                                    setFormValue("dates", dates);
                                                    const checkoutBtn = searchDateCheckoutRef.current;
                                                    if (!checkoutBtn) return;
                                                    checkoutBtn.focus()
                                                }}
                                                minValue={minDate}
                                            />
                                        </div>
                                    </div>
                                    <div className='border-r h-8 border-inherit -z-10 flex-shrink-0' />
                                    <div
                                        tabIndex={-1}
                                        onBlur={(e) => {
                                            if (e.currentTarget.contains(e.relatedTarget)) return;
                                            e.currentTarget.removeAttribute("data-active");
                                            const guestsBtn = searchGuestsBtnRef.current;
                                            if (guestsBtn && guestsBtn.getAttribute("data-active") === "true") {
                                                guestsBtn.removeAttribute("data-active")
                                            }
                                        }}
                                        className='group/guests border-inherit flex-1 h-full w-full max-w-[calc(100%/3)] rounded-[inherit] z-0 data-[focus=true]:z-10'
                                    >
                                        <div
                                            className={cn(
                                                'h-full w-full rounded-[inherit] border-inherit z-0 ',
                                                "relative",
                                                "hover:bg-default-300",
                                                "group-data-[active=true]/guests:bg-content1",
                                                "group-data-[active=true]/guests:hover:bg-content1",
                                                "group-data-[active=true]/guests:shadow",

                                                "before:absolute",
                                                "before:w-[calc(100%+2px)]",
                                                "before:-z-20",
                                                "before:hidden",
                                                "before:hover:block",
                                                "group-data-[active=true]/guests:before:hover:hidden",
                                                "before:h-8",
                                                "before:top-1/2",
                                                "before:-translate-y-1/2",
                                                "before:left-[-1px]",
                                                "before:bg-content1",

                                                "group-has-[[data-active=true]]/form-container:before:hover:hidden",
                                                "group-has-[[data-active=true]]/form-container:before:bg-inherit",
                                                "group-has-[[data-active=true]]/form-container:before:h-full",
                                                "group-has-[[data-active=true]]/form-container:before:top-0",
                                                "group-has-[[data-active=true]]/form-container:before:translate-y-0",

                                                "group-has-[#search-time-end[data-active=true]]/form-container:before:hover:block",
                                                "group-has-[#search-time-end[data-active=true]]/form-container:before:-left-1/3",
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-full h-full rounded-[inherit]",
                                                    "bg-inherit",
                                                    "flex justify-between items-center"
                                                )}
                                            >
                                                <Button
                                                    className={cn(
                                                        "data-[pressed=true]:scale-100 data-[focus-visible=true]:outline-0 bg-inherit data-[hover=true]:bg-inherit",
                                                        "h-full flex-1 p-0",
                                                    )}
                                                    variant='light'
                                                    disableRipple
                                                    disableAnimation
                                                    isDisabled={!isLoaded}
                                                    id='search-guests'
                                                    radius='full'
                                                    ref={searchGuestsBtnRef}
                                                    onFocus={(e) => {
                                                        e.currentTarget.setAttribute("data-active", "true");

                                                        const parentElement = e.currentTarget.parentElement?.parentElement?.parentElement;
                                                        if (!parentElement) return;

                                                        parentElement.setAttribute("data-active", "true")
                                                    }}
                                                >
                                                    <div className='px-6 py-3.5 w-full h-full text-left'>
                                                        <div className='text-xs font-medium text-nowrap text-default-600 leading-4'>
                                                            {t("check out")}
                                                        </div>
                                                        {
                                                            [
                                                                formData.guests,
                                                                formData.infants,
                                                                formData.pets,
                                                            ].some((v) => v !== 0) ? (
                                                                <div className='font-medium max-w-full truncate'>
                                                                    {
                                                                        [
                                                                            formData.guests !== 0 ? `${formData.guests} ${unitMsg("guests")}` : null,
                                                                            formData.infants !== 0 ? `${formData.infants} ${unitMsg("infants")}` : null,
                                                                            formData.pets !== 0 ? `${formData.pets} ${unitMsg("pets")}` : null,
                                                                        ].filter((v) => v).join(", ")
                                                                    }
                                                                </div>
                                                            ) : (
                                                                <div className='text-default-400 font-medium max-w-full truncate'>
                                                                    {t("add dates")}
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    radius='full'
                                                    className={cn(
                                                        "h-12 w-12 m-2 !transition-width delay-100",
                                                        "group-has-[[data-active=true]]/form-container:w-[calc(50%-16px)]",
                                                        "group-has-[[data-active=true]]/form-container:delay-0",
                                                    )}
                                                    color='primary'
                                                    startContent={
                                                        <Search size={18} strokeWidth='2.5' className='pointer-events-none' />
                                                    }
                                                    onFocus={(e) => {
                                                        const parentElement = e.currentTarget.parentElement?.parentElement?.parentElement;
                                                        const guestsBtn = searchGuestsBtnRef.current
                                                        if (!parentElement || !guestsBtn) return;
                                                        guestsBtn.removeAttribute("data-active")
                                                        parentElement.removeAttribute("data-active")
                                                    }}
                                                    onPress={handleSearchSubmit}
                                                    disableRipple
                                                    type='button'
                                                >
                                                    <span className='ml-2 font-medium hidden group-has-[[data-active=true]]/form-container:inline-block'>
                                                        {btnMsg("Search")}
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                        <div
                                            className={cn(
                                                "absolute w-1/2 border rounded-2xl bg-content1 top-full mt-2.5 right-0",
                                                "hidden px-8 py-6 shadow",
                                                "group-data-[active=true]/guests:block"
                                            )}
                                        >
                                            <CardGuest
                                                isDivider
                                                minGuest={0}
                                                onValueChange={(values) => {
                                                    const guests = values.adults + values.children;
                                                    setFormData({
                                                        ...formData,
                                                        ...values,
                                                        guests
                                                    })
                                                }}
                                                values={{
                                                    adults: formData.adults,
                                                    children: formData.children,
                                                    infants: formData.infants,
                                                    pets: formData.pets
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HeaderSearchForm;