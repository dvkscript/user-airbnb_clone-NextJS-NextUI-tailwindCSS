"use client"
import Icons from "@/components/Common/Icons";
import MapBox from "@/components/Map/MapBox";
import MapController from "@/components/Map/MapController";
import MapMarker from "@/components/Map/MapMarker";
import { locationSelector } from "@/hooks/selectors/systemSelector";
import useDictionary from "@/hooks/useDictionary";
import useSystemStore from "@/hooks/useSystemStore";
import { GetRoomDetail } from "@/services/room.service";
import { cn } from "@/utils/dom.util";
import { Spacer } from "@nextui-org/react";
import React, { useMemo } from "react"

interface LocationProps {
    address: GetRoomDetail["address"]
}

const Location: React.FC<LocationProps> = ({
    address
}) => {
    const t = useDictionary("rooms", d => d.location).t;
    const { countries } = useSystemStore(locationSelector);

    const description = useMemo(() => {
        const texts = [
            address.district,
            address.province,
            countries[address.country_code as keyof typeof countries].native
        ]
        return texts.filter((a) => a).join(", ")
    }, [address.country_code, address.district, address.province, countries]);

    return (
        <section id="location" className="py-[inherit]">
            <h2 className="text-subtitle">
                {t("title")}
            </h2>
            <Spacer y={6} />
            <p>
                {description}
            </p>
            <Spacer y={6} />
            <div className="h-[480px] w-full">
                <div
                    className={cn(
                        "w-full h-full max-h-full max-w-full overflow-hidden relative z-0 rounded-lg",
                    )}
                >
                    <MapBox
                        center={{
                            lat: address.lat,
                            lng: address.lng
                        }}
                        zoom={14}
                    >
                        <MapController
                            isFullScreenControl
                            isZoomControl
                            isGeolocateControl
                        />
                        <MapMarker

                        >
                            <div
                                className={cn(
                                    "size-12 grid content-center rounded-full bg-primary relative mb-1 after:-bottom-[1px] shadow shadow-black/20",
                                    "after:content-[''] after:absolute after:w-4 after:h-4 after:bg-inherit",
                                    "after:rotate-45",
                                    "after:left-1/2 after:-translate-x-1/2",
                                )}
                            >
                                <Icons.house className="text-white mx-auto" height={20} width={20}></Icons.house>
                            </div>
                        </MapMarker>
                    </MapBox>
                </div>
            </div>
        </section>
    );
};

export default Location;