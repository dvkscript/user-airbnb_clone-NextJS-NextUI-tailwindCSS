"use client"
import React, { createContext, ReactNode, useEffect, useRef, useState } from "react"
import { Map, MapOptions } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAPTILER_KEY } from "@/configs/env.config";
import { cn } from "@/utils/dom.util";
import { toast } from "sonner";
import LoaderPulse from "../Loader/LoaderPulse";

export interface MapBoxProps extends Omit<MapOptions, "container" | "style" | "center"> {
    children?: ReactNode;
    className?: string;
    center: {
        lng: number,
        lat: number
    };
    isLoading?: boolean;
    loading?: boolean;
};

export const MapContext = createContext<Map | null>(null);

const MapBox = ({
    children,
    className,
    center,
    zoom = 14,
    maplibreLogo = false,
    attributionControl = false,
    scrollZoom = true,
    doubleClickZoom = true,
    dragPan = true,
    dragRotate = true,
    minZoom,
    maxZoom,
    isLoading = false,
    loading,
}: MapBoxProps) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);


    useEffect(() => {
        const mapContainer = mapContainerRef.current;
        if (mapContainer && !map) {
            const newMap = new Map({
                center: [center.lng, center.lat],
                zoom: zoom,
                maplibreLogo,
                attributionControl,
                style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
                container: mapContainer,
                scrollZoom,
                doubleClickZoom,
                dragPan,
                dragRotate,
                minZoom,
                maxZoom,
            });
            newMap.on('load', () => {
                setIsLoaded(true);
            });

            newMap.on('error', (e) => {
                setIsLoaded(true);
                toast.error(e.message)
            });
            setMap(newMap);
        }
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            if (map && !mapContainerRef.current) {
                map.remove();
                setMap(null);
            };
        };
    }, [
        center,
        zoom,
        attributionControl,
        maplibreLogo,
        scrollZoom,
        doubleClickZoom,
        dragPan,
        dragRotate,
        minZoom,
        maxZoom,
        map,
    ]);

    return (
        <MapContext.Provider value={map}>
            <div
                ref={mapContainerRef}
                className={cn(
                    "relative text-neutral-800",
                    className
                )}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            >
                {isLoaded && children}
                {(loading && (!isLoaded || isLoading)) && (
                    <span
                        className={cn(
                            "absolute top-5 left-1/2 -translate-x-1/2 z-10 bg-white py-3 px-4 flex items-center rounded-md shadow-md transition-opacity",
                        )}
                    >
                        <LoaderPulse color='black' />
                    </span>
                )}
            </div>
        </MapContext.Provider>
    );
};

export default MapBox;
