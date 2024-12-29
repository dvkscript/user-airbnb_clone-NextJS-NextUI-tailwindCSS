"use client";
import React, { Key, useCallback, useEffect, useState } from 'react';
import { Autocomplete, AutocompleteItem, AutocompleteItemProps, InputProps } from '@nextui-org/react';
import { toast } from 'sonner';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import { MapPin } from 'lucide-react';
import { cn } from '@/utils/dom.util';
import { MapSearchResult, mapSearch } from '@/libs/map';
import useDebounce from '@/hooks/useDebounce';
import { Locale } from '@/libs/dictionary.lib';
import Icons from '@/components/Common/Icons';

interface MapSearchProps {
    className?: string;
    searchParams?: Omit<Params, "q" | 'accept-language'> & { locale?: Locale };
    inputProps?: InputProps;
    onSelectItemChange?: (item: MapSearchResult) => void;
    onSelectKeyChange?: (item: Key | null) => void;
    searchData?: (data: MapSearchResult[]) => void;
    placeholder?: string;
    isMenu?: boolean;
    autocompleteItemProps?: Omit<AutocompleteItemProps, "children">;
}

type InputState = {
    isFocused: boolean;
    isLoading: boolean;
    inputValue: string;
    selectedItem: MapSearchResult | null;
    isDisabled: boolean;
    selectKey: string;
}

const MapSearch: React.FC<MapSearchProps> = ({
    className,
    searchParams,
    inputProps,
    onSelectItemChange = () => { },
    searchData,
    placeholder = "Search an animal",
    isMenu = true,
    onSelectKeyChange = () => { },
    autocompleteItemProps,
}) => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [data, setData] = useState<MapSearchResult[]>([]);
    const [{ isFocused, isLoading, inputValue, selectedItem, isDisabled, selectKey }, setInputState] = useState<InputState>({
        isFocused: false,
        isLoading: false,
        inputValue: "",
        selectedItem: null,
        isDisabled: false,
        selectKey: "",
    });

    const setValueInputState = useCallback(<T extends InputState, K extends keyof T>(name: K, value: T[K]) => {
        setInputState((s) => ({
            ...s,
            [name]: value
        }))
    }, []);

    const handleResetValue = useCallback(() => {
        setInputState((s) => ({
            ...s,
            inputValue: "",
            selectedItem: null,
            isLoading: false
        }));
        setData([]);
    }, [])

    const handleGetLocation = useCallback(() => {
        if (navigator.geolocation) {
            setValueInputState("selectKey", "local");
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    setInputState((s) => ({
                        ...s,
                        isLoading: true,
                        isDisabled: true,
                    }));
                    const dataValue = [
                        position.coords.latitude,
                        position.coords.longitude
                    ].join(",");
                    const result = await mapSearch(dataValue);
                    setInputState((s) => ({
                        ...s,
                        isLoading: false,
                        isDisabled: false,
                    }));
                    if (!result || result?.length === 0) {
                        toast.error("Không thể lấy vị trí. Vui lòng thử lại sau.");
                        setValueInputState("selectKey", "");
                        return;
                    }
                    setInputState((s) => ({
                        ...s,
                        inputValue: result[0].label,
                        selectedItem: result[0],
                    }));
                    setData(result);
                    if (onSelectItemChange) onSelectItemChange(result[0])
                },
                () => {
                    toast.error("Không thể lấy vị trí. Vui lòng cho phép quyền truy cập vị trí.");
                    setValueInputState("selectKey", "");
                }
            );
        } else {
            toast.error("Trình duyệt của bạn không hỗ trợ truy cập vị trí.");
        }
    }, [onSelectItemChange, setValueInputState]);

    const handleSelected = useCallback((key: Key | null) => {
        onSelectKeyChange(key);
        if (!key) return;
        switch (key) {
            case "local":
                handleGetLocation();
                break;
            case "empty":
                break;
            case "enter-address":
                break;
            default:
                const selected = data.find((item) => {
                    const keyFind = [item.x, item.y].join(",");
                    return keyFind === key;
                });
                if (!selected) {
                    toast.error("Không tìm thấy kết quả.");
                    return;
                };
                setInputState((s) => ({
                    ...s,
                    inputValue: inputValue !== selected.label ? selected.label : inputValue,
                    selectedItem: selected
                }))
                onSelectItemChange(selected);
                break;
        }
    }, [
        handleGetLocation,
        onSelectKeyChange,
        data,
        onSelectItemChange,
        inputValue,
    ])

    const inputValueDebounce = useDebounce<string>(inputValue, 500);

    const fetchData = useCallback(async (value: string) => {
        if (!value) return;
        setValueInputState("isLoading", true);

        const data = await mapSearch(value, searchParams);

        setData(data);
        if (searchData) {
            searchData(data);
        };

        setValueInputState("isLoading", false);
    }, [searchData, setValueInputState, searchParams]);

    useEffect(() => {
        if (selectedItem) return;
        if (inputValueDebounce !== inputValue) return;
        if (!inputValue) return;
        
        fetchData(inputValueDebounce);
    }, [inputValueDebounce, fetchData, setValueInputState, selectedItem, inputValue]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const autocompleteItemDefaultProps = () => {
        return {
            variant: 'flat',
            ...autocompleteItemProps,
            classNames: {
                title: "text-base font-normal",
                base: "py-2 px-3 text-xl gap-x-3 rounded-none",
                ...(autocompleteItemProps?.classNames ?? {}),
            },
        } as Omit<AutocompleteItemProps, "children">
    };

    if (!isLoaded) return null;

    return (
        <Autocomplete
            isDisabled={!isLoaded}
            placeholder={placeholder}
            className={cn(className)}
            aria-label="Map search"
            allowsCustomValue
            onSelectionChange={handleSelected}
            onValueChange={(v) => {
                if (!v) {
                    handleResetValue();
                    return;
                }
                setInputState((s) => ({
                    ...s,
                    inputValue: v,
                    selectedItem: null,
                    isLoading: false
                }))
            }}
            classNames={{
                selectorButton: cn(!isLoading && "hidden"),
                popoverContent: "p-0 rounded-lg",
            }}
            radius={isFocused ? "md" : "full"}
            inputProps={{
                startContent: <MapPin size={32} />,
                size: "lg",
                variant: "bordered",
                ...inputProps,
                classNames: {
                    inputWrapper: "h-[65px] px-6 border-[transparent] hover:border-[transparent] bg-white dark:bg-default-100",
                    innerWrapper: cn("gap-x-1"),
                    input: "font-medium",
                    ...(inputProps?.classNames ?? {}),
                    base: cn(isDisabled && "opacity-90"),
                },
                isDisabled
            }}
            listboxProps={{
                className: "p-0",
            }}
            onFocus={() => {
                setValueInputState("isFocused", true)
            }}
            onBlur={() => {
                setValueInputState("isFocused", false)
            }}
            clearButtonProps={{
                onPressChange(isPressed) {
                    if (isPressed) {
                        handleResetValue();
                    }
                },
            }}
            isLoading={isLoading}
            inputValue={inputValue}
            errorMessage="test"
            items={data}
            inputMode='text'
        >
            {
                (isLoading || !isMenu || selectKey === "local") ? []
                    : ([
                        <AutocompleteItem
                            {...autocompleteItemDefaultProps()}
                            startContent={<span className="rounded-full bg-default-100">
                                <Icons.locationArrow className="m-3" height="15" width="15" />
                            </span>}
                            className={cn((!!inputValue) && "hidden")}
                            key={"local"}
                            textValue={"Use my current location"}
                            translate='yes'
                        >
                            Use my current location
                        </AutocompleteItem>,
                        <AutocompleteItem
                            {...autocompleteItemDefaultProps()}
                            startContent={<span className="rounded-full bg-default-100">
                                <Icons.locationArrow className="m-3" height="15" width="15" />
                            </span>}
                            className={cn((!inputValueDebounce || data.length !== 0) && "hidden")}
                            key={"empty"}
                            textValue={"No data."}
                            translate='yes'
                        >
                            No data.
                        </AutocompleteItem>
                    ]).concat
                        (data.map((item) => (
                            <AutocompleteItem
                                {...autocompleteItemDefaultProps()}
                                startContent={<span className="rounded-full bg-default-100">
                                    <Icons.highRiseBuilding className="m-3" height="15" width="15" />
                                </span>}
                                key={[item.x, item.y].join(',')}
                                textValue={item.label}
                                translate='no'
                            >
                                <>
                                    <p className='block font-medium'>
                                        {item.raw?.name}
                                    </p>
                                    <p className='block text-sm font-normal text-default-600'>
                                        {item.raw?.display_name}
                                    </p>
                                </>
                            </AutocompleteItem>
                        ))).concat([
                            <AutocompleteItem
                                {...autocompleteItemDefaultProps()}
                                variant='light'
                                className={cn((!inputValue) && "hidden", "underline")}
                                key={"enter-address"}
                                textValue={"Enter address manually"}
                                translate='yes'
                            >
                                Enter address manually
                            </AutocompleteItem>
                        ])
            }
        </Autocomplete>
    )
};

export default MapSearch;