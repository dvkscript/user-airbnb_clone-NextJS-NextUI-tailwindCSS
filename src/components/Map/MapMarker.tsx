import { LngLat, LngLatLike, Marker, MarkerOptions, Popup, PopupOptions } from "maplibre-gl";
import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react"
import { MapContext } from "./MapBox";
import { createRoot } from "react-dom/client";

interface MapMarkerProps extends Omit<MarkerOptions, "element" | "draggable"> {
    isDraggable?: boolean;
    onDragEnd?: (lngLat: LngLat) => void;
    onDragStart?: (lngLat: LngLat) => void;
    position?: {
        lng: number;
        lat: number;
    },
    isDragEndFlyTo?: boolean;
    children?: ReactNode;
    popup?: ReactNode | (({ onClose }: { onClose: () => void }) => ReactNode);
    popupOptions?: PopupOptions;
    autoFocus?: boolean;
    onPopupChange?: (isOpen: boolean) => void
}

const MapMarker = ({
    isDraggable = false,
    onDragEnd,
    onDragStart,
    position,
    color = "red",
    scale,
    isDragEndFlyTo = false,
    children,
    popup: PopupComponent,
    popupOptions,
    autoFocus,
    onPopupChange,
    ...props
}: MapMarkerProps) => {
    const iconWrapRef = useRef<HTMLDivElement | null>(null);
    const map = useContext(MapContext);
    const [center, setCenter] = useState<LngLatLike | null>(null);

    const handleDragEnd = useCallback((marker: Marker) => {
        const lngLat = marker.getLngLat();
        setCenter(lngLat)
        if (onDragEnd) onDragEnd(lngLat);
        if (!map || !isDragEndFlyTo) return;
        map.flyTo({
            center: lngLat,
            zoom: map.getZoom(),
            essential: true,
        });
    }, [onDragEnd, map, isDragEndFlyTo]);

    const handleDragStart = useCallback((marker: Marker) => {
        const lngLat = marker.getLngLat();
        if (onDragStart) onDragStart(lngLat);
    }, [onDragStart]);

    useEffect(() => {
        if (!map || !center) return;
        let iconElement: HTMLElement | null = null;

        if (children) {
            iconElement = document.createElement('div');
            const root = createRoot(iconElement);
            root.render(children);
        }

        const marker = new Marker({
            color,
            scale,
            ...props,
            draggable: isDraggable,
            element: children && iconElement ? iconElement : undefined,
        })

        marker.setLngLat(center).addTo(map);

        if (PopupComponent) {
            const popupContainer = document.createElement('div');

            const root = createRoot(popupContainer);

            const renderPopup =
                typeof PopupComponent === "function"
                    ? <PopupComponent onClose={() => marker.togglePopup()} />
                    : PopupComponent;

            root.render(renderPopup);

            const popup = new Popup({
                offset: 25,
                closeButton: false,
                ...popupOptions,
                className: "!max-w-fit",
            }).setDOMContent(popupContainer);

            const popupContent = popupContainer.parentNode as HTMLDivElement;
            if (popupContent) {
                popupContent.style.padding = "0";
                if (popupOptions?.className) {
                    const classNames = popupOptions.className.split(" ");
                    popupContent.classList.add(...classNames);
                }
            }

            marker.setPopup(popup);
            if (onPopupChange) {
                onPopupChange(popup.isOpen())
                popup.on("open", () => onPopupChange(true));
                popup.on("close", () => onPopupChange(false));
            }
        };

        marker.on("dragend", () => handleDragEnd(marker));
        marker.on("dragstart", () => handleDragStart(marker));

        if (autoFocus) {
            marker.togglePopup();
        }


        return () => {
            if (!map || !marker) return;
            marker.remove();
            if (iconWrapRef.current) {
                iconWrapRef.current.remove()
                iconWrapRef.current = null;
            }
        };
    }, [
        map,
        isDraggable,
        props,
        children,
        position,
        color,
        scale,
        handleDragEnd,
        handleDragStart,
        center,
        PopupComponent,
        popupOptions,
        autoFocus,
        onPopupChange
    ]);

    useEffect(() => {
        if (!map) return;
        const center = position ? position : map.getCenter()
        setCenter(center)
    }, [map, position]);

    return null
};

export default MapMarker;