"use client"
import MapBox from "@/components/Map/MapBox";
import MapController from "@/components/Map/MapController";
import MapMarker from "@/components/Map/MapMarker";
import { GetRoomAndCountAll } from "@/services/room.service";
import { cn, formatPrice } from "@/utils/dom.util";
import { Button } from "@nextui-org/react";
import React, { memo, useCallback } from "react"
import SlideImage from "./SlideImage";
import Translate from "@/components/Common/Translate";
import { Heart, X } from "lucide-react";
import useUrl from "@/hooks/useUrl";
import { useParams } from "next/navigation";

interface MapSearchProps {
    rooms: GetRoomAndCountAll["rows"];
    className?: string;
}

const MapSearch: React.FC<MapSearchProps> = ({
    rooms = [],
    className
}) => {
    const { search } = useUrl();
    const params = useParams()
    const href = useCallback((room: MapSearchProps["rooms"][number]) => (`${params.lang}/rooms/${room.id}${search}`), [search, params])

    return (
        <div
            className={cn(
                className,
                "w-full max-w-full overflow-hidden relative top-0 bottom-0 z-0",
            )}
            style={{
                height: "calc(100vh - 80px - 79px)"
            }}
        >
            <MapBox
                center={{
                    lat: 21.012427488927628,
                    lng: 105.78179486331814
                }}
                loading
            >
                <MapController
                    isFullScreenControl
                    isZoomControl
                    isGeolocateControl
                />
                {
                    rooms?.length > 0 && rooms.map((r) => (
                        <MapMarker
                            key={r.id}
                            position={{
                                lat: r.address.lat,
                                lng: r.address.lng,
                            }}
                            popup={({ onClose }) => (
                                <div className="w-[327px] relative">
                                    <div className="w-full h-[212px]">
                                        <SlideImage photos={r.photos} href={href(r)} />
                                    </div>
                                    <a href={href(r)} target="_blank" >
                                        <div className="p-3 text-neutral-700 block">
                                            <Translate as={"b"} className="text-[17px]">
                                                {r.title}
                                            </Translate>
                                            <p className="font-semibold text-[15px]">
                                                {formatPrice(r.original_price)} <Translate as={"span"} isTrans isExcLocaleSystem={false} className="font-normal">/ night</Translate>
                                            </p>
                                        </div>
                                        <div className="absolute top-3 flex gap-x-3 right-3">
                                            <Button
                                                variant="solid"
                                                isIconOnly
                                                size="sm"
                                                disableRipple
                                                className="bg-white"
                                                radius="full"
                                            >
                                                <Heart size={18} strokeWidth={3} />
                                            </Button>
                                            <Button
                                                variant="solid"
                                                isIconOnly
                                                size="sm"
                                                disableRipple
                                                className="bg-white"
                                                onPress={onClose}
                                                radius="full"
                                            >
                                                <X size={18} strokeWidth={3} />
                                            </Button>
                                        </div>
                                    </a>
                                </div>
                            )}
                            popupOptions={{
                                className: "overflow-hidden !rounded-lg"
                            }}
                        >
                            <span className="shadow-[0_1px_6px_2px_rgba(0,0,0,0.3)] bg-white rounded-full px-3 py-2 z-10 font-semibold">
                                {formatPrice(r.original_price)}
                            </span>
                        </MapMarker>
                    ))
                }
            </MapBox>
        </div>
    );
};

export default memo(MapSearch);