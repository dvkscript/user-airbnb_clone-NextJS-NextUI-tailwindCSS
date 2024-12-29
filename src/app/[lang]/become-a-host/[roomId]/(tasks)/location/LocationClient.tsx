"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useUrl from '@/hooks/useUrl';
import { toast } from 'sonner';
import { Divider, Input, InputProps, Select, Selection, SelectItem } from '@nextui-org/react';
import { TCountries } from 'countries-list';
import useRoomStore from '@/hooks/useRoomStore';
import { roomCreationSelector } from '@/hooks/selectors/roomSelector';
import { slideUpContainer, slideUpItem } from '@/animations/slideUp.animation';
import { TUpdateUserRoomValidator } from '@/validators/user.validator';
import { Dictionary, getCountryAlpha2Code } from '@/libs/dictionary.lib';
import useDictionary from '@/hooks/useDictionary';
import MapSearch from '@/components/Map/MapSearch';
import { mapSearch, MapSearchResult } from '@/libs/map';
import useSystemStore from '@/hooks/useSystemStore';
import { loaderSelector, locationSelector } from '@/hooks/selectors/systemSelector';
import Translate from '@/components/Common/Translate';
import { updateUserRoom } from '@/services/user.service';
import useToast from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import Motion from "@/components/Common/Motion";
import { RoomStatus } from '@/enum/room';
import MapBox, { MapBoxProps } from '@/components/Map/MapBox';
import MapController from '@/components/Map/MapController';
import MapMarker from '@/components/Map/MapMarker';

type FormData = NonNullable<TUpdateUserRoomValidator["address"]>

interface LocationClientProps {
    roomId: string;
};

interface LngLat {
    lng: number;
    lat: number;
};

const initialFormData: FormData = {
    country_code: "VN",
    country: "",
    province: "",
    extras: "",
    district: "",
    street: "",
    lat: 0,
    lng: 0,
}

const LocationClient: React.FC<LocationClientProps> = ({
    roomId,
}) => {
    // common
    const {
        d,
        p
    } = useDictionary<"become-a-host", Dictionary["become-a-host"]["location"]>("become-a-host", d => d.location)
    const {
        setValues,
        onResetRoomCreation,
        setIsBackLoading,
        setIsNextLoading,
        roomCreationPathnames: { backTask, nextTask }
    } = useRoomStore(roomCreationSelector);
    const route = useRouter();
    const { pathnames, replacePath } = useUrl();
    const [layout, setLayout] = useState<"search" | "form" | "map">("search");
    const mapCenterRef = useRef<LngLat>({
        lat: 16.9266657,
        lng: 106.7650855,
    });

    const currentPageName = useMemo(() => (
        pathnames[pathnames.length - 1]
    ), [pathnames]);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const { countries } = useSystemStore(locationSelector);
    const { isLoaded } = useSystemStore(loaderSelector);

    const { toastRes } = useToast()

    const isNext = useMemo(() => (!!formData?.country && !!formData?.province && !!formData?.district && !!formData?.street), [formData])

    const setFormValue = useCallback(<T extends FormData, K extends keyof T>(name: K, value: T[K]) => {
        setFormData({
            ...formData,
            [name]: value
        })
    }, [formData]);

    const handleSearchSelected = useCallback(async (select: MapSearchResult) => {
        if (!select) {
            return toast.error("Error...");
        }
        ;

        const position = [select.y, select.x].join(",");

        const toastId = toast.loading("Loading...", {
            position: "top-center"
        })
        const dataValidate = await mapSearch(position, {
            locale: "en"
        });

        if (!dataValidate || dataValidate.length === 0) {
            return toast.error("Error...");
        }
        ;

        const countryCode = await getCountryAlpha2Code(dataValidate[0]?.label.split(", ").pop() || "");

        const addressArr = select?.label?.split(", ") || [];
        const country = addressArr.pop();

        if (!isNaN(Number(addressArr[addressArr.length - 1]))) {
            addressArr.splice(addressArr.length - 1, 1); // remove zip code 
        }

        const lngLat = {
            lat: select.y,
            lng: select.x,
        };

        const updateData = {
            country_code: countryCode,
            country,
            province: addressArr[addressArr.length - 1] || "",
            district: addressArr[addressArr.length - 2] || "",
            street: addressArr[addressArr.length - 3] || "",
            ...lngLat
        } as FormData;

        mapCenterRef.current = lngLat;

        if (addressArr.length > 3) {
            updateData.street = addressArr[addressArr.length - 3] || "";
            updateData.extras = addressArr.slice(0, addressArr.length - 3).join(", ") || "";
        }

        setFormData(updateData);
        setLayout("form");
        toast.dismiss(toastId);
    }, []);

    useEffect(() => {
        setValues({
            isNextDisabled: !isNext,
            setNextRoomCreationTask: async () => {
                if (!nextTask) return;
                if (layout === "form") {
                    if (formData.lat === 0 && formData.lng === 0) {
                        setIsNextLoading(true);
                        const search = [formData.extras, formData.street, formData.district, formData.province, formData.country].filter((s) => s).join(", ");
                        const dataByFormData = await mapSearch(search);
                        if (!dataByFormData || dataByFormData.length === 0) {
                            const dataByCountries = await mapSearch(`${countries[formData.country_code as keyof typeof countries].name}`);
                            if (dataByFormData?.length > 0) {
                                setFormData((s) => ({
                                    ...s,
                                    lat: dataByCountries[0].y,
                                    lng: dataByCountries[0].x,
                                }))
                            }
                            toast.error("Error...");
                        } else {
                            setFormData((s) => ({
                                ...s,
                                lat: dataByFormData[0].y,
                                lng: dataByFormData[0].x,
                            }))
                        }
                        setIsNextLoading(false);
                    }
                    return setLayout("map");
                }
                setIsNextLoading(true);

                const result = await updateUserRoom(roomId, {
                    address: formData,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });

                if (result.ok) {
                    route.push(nextTask.pathname);
                } else {
                    setIsNextLoading(false);
                    toastRes(result);
                }
            },
            setBackRoomCreationTask: () => {
                switch (layout) {
                    case "form":
                        setLayout("search");
                        setFormData(initialFormData);
                        break;
                    case "map":
                        setLayout("form");
                        break;
                    default:
                        if (!backTask) return;
                        setIsBackLoading(true);
                        route.push(backTask.pathname);
                        break;
                }
            },
        });
        return () => {
            onResetRoomCreation();
        };
    }, [
        setValues,
        onResetRoomCreation,
        replacePath,
        currentPageName,
        route,
        setIsBackLoading,
        setIsNextLoading,
        roomId,
        isNext,
        formData,
        backTask,
        nextTask,
        layout,
        countries,
        toastRes
    ]);

    const handleSelectKeyChange = useCallback((key: React.Key | null) => {
        if (key === "enter-address") {
            setLayout("form")
            setFormData((s) => ({
                ...s,
                country_code: "VN",
                country: countries["VN"]?.name
            }))
        }
    }, [countries])

    const formContentEl = useMemo(() => {
        const inputProps = (label: string) => ({
            isDisabled: !(!!formData),
            type: "text",
            variant: "bordered",
            fullWidth: true,
            className: "",
            size: "lg",
            radius: "none",
            classNames: {
                inputWrapper: "border-0 px-3",
                label: "text-default-500"
            },
            autoComplete: "off",
            label: <Translate isTrans as={"span"} isExcLocaleSystem>{label}</Translate>,
            translate: "no"
        } as InputProps)
        return (
            <div className='flex-1 w-full max-w-full overflow-hidden'>
                <Select
                    isDisabled={!isLoaded}
                    label={<Translate isTrans as={"span"}>Country / region</Translate>}
                    placeholder="Select an animal"
                    selectionMode='single'
                    fullWidth
                    variant='bordered'
                    size='lg'
                    radius='md'
                    translate='no'
                    selectedKeys={formData?.country_code && new Set([formData?.country_code])}
                    onSelectionChange={(keys: Selection) => {
                        const value = Array.from(keys).join("");
                        if (!value) return;
                        const country_code = value;
                        const country = countries[country_code as keyof TCountries].native;
                        setFormData((prevState) => ({
                            ...(prevState ?? initialFormData),
                            country_code: value,
                            country
                        }))
                    }}
                    aria-modal="true"
                >
                    {
                        Object.keys(countries).map((c) => (
                            <SelectItem key={c} translate='no'>
                                {`${countries[c as keyof TCountries].native} - ${c}`}
                            </SelectItem>
                        ))
                    }
                </Select>
                <div className='mt-4 overflow-hidden rounded-lg border-2'>
                    <Input
                        {...inputProps(d?.form.street ?? "")}
                        value={formData.street}
                        onValueChange={(v: string) => setFormValue("street", v)}
                    />
                    <Divider />
                    <Input
                        {...inputProps(d?.form.extras ?? "")}
                        value={formData.extras}
                        onValueChange={(v: string) => setFormValue("extras", v)}
                    />
                    <Divider />
                    <Input
                        {...inputProps(d?.form.district ?? "")}
                        value={formData.district}
                        onValueChange={(v: string) => setFormValue("district", v)}
                    />
                    <Divider />
                    <Input
                        {...inputProps(d?.form.province ?? "")}
                        value={formData.province}
                        onValueChange={(v: string) => setFormValue("province", v)}
                    />
                </div>
            </div>
        )
    }, [
        countries,
        formData,
        setFormValue,
        d,
        isLoaded
    ]);
    const handleMarkerDrag = useCallback((latLng: LngLat) => {
        setFormData((prevState) => ({
            ...prevState,
            ...latLng
        }));
    }, []);

    const mapProps = (): Omit<MapBoxProps, "center"> => {
        if (layout === "search") {
            return {
                zoom: 4.8,
                doubleClickZoom: false,
                scrollZoom: false,
                dragPan: false,
                dragRotate: false
            }
        }
        return {
            zoom: 14,
            minZoom: 12
        }
    }

    return (
        <div className={"max-w-[640px] w-full h-full flex flex-col gap-y-7"}>
            <Motion
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
                className='h-fit'
            >
                <Motion
                    as={"h1"}
                    className='text-wrap text-title'
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                >
                    {p.location.title[layout]}
                </Motion>
                <Motion
                    as={"span"}
                    className='text-description text-default-400'
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                >
                    {p.location.description}
                </Motion>
            </Motion>

            <Motion
                variants={slideUpItem}
                className='w-full h-full max-h-[630px] min-h-[400px] relative overflow-hidden rounded-2xl'
                initial="hidden"
                animate="visible"
            >
                {
                    layout === "form" ?
                        formContentEl :
                        <Translate className='w-full h-full'>
                            <MapBox
                                center={mapCenterRef.current}
                                {...mapProps()}

                            >
                                {
                                    layout === "search" ? (
                                        <MapController className='w-full top-8 px-8'>
                                            <MapSearch
                                                onSelectItemChange={handleSearchSelected}
                                                onSelectKeyChange={handleSelectKeyChange}
                                            />
                                        </MapController>
                                    ) : (
                                        <>
                                            <MapController
                                                isZoomControl
                                                isFullScreenControl
                                            />
                                            <MapMarker
                                                isDraggable
                                                onDragEnd={handleMarkerDrag}
                                                isDragEndFlyTo
                                                popup={<span>{d?.map.tooltip.inactive}</span>}
                                                popupOptions={{
                                                    subpixelPositioning: true,
                                                    focusAfterOpen: true,
                                                }}
                                            />
                                        </>
                                    )
                                }
                            </MapBox>
                        </Translate>
                }
            </Motion>
        </div>
    )
};

export default LocationClient;
