import { cn } from '@/utils/dom.util';
import React, { useContext, useEffect, useRef } from 'react';
import { MapContext } from './MapBox';
import { ControlPosition, FullscreenControl, GeolocateControl, GeolocateControlOptions, NavigationControl } from 'maplibre-gl';

interface MapControllerProps {
  children?: React.ReactNode;
  className?: string;
  isZoomControl?: boolean;
  isFullScreenControl?: boolean;
  isGeolocateControl?: boolean;
  position?: ControlPosition;
  geolocateOptions?: GeolocateControlOptions;
}


const MapController: React.FC<MapControllerProps> = ({
  children,
  className,
  isZoomControl = false,
  isFullScreenControl = false,
  isGeolocateControl = false,
  geolocateOptions,
  position
}) => {
  const map = useContext(MapContext);
  const controlWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map) return;
    const navigationControl = new NavigationControl();
    const fullscreenControl = new FullscreenControl();
    const geolocateControl = new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      ...geolocateOptions
    });

    if (isZoomControl) {
      map.addControl(navigationControl, position)
    }
    if (isGeolocateControl) {
      map.addControl(geolocateControl, position)
    }
    if (isFullScreenControl) {
      map.addControl(fullscreenControl, position)
    };

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (!controlWrapRef.current) return;
      if (isZoomControl) map.removeControl(navigationControl)
      if (isFullScreenControl) map.removeControl(fullscreenControl)
      if (isGeolocateControl) map.removeControl(geolocateControl)
    }
  }, [
    map,
    isZoomControl,
    isFullScreenControl,
    position,
    isGeolocateControl,
    geolocateOptions
  ]);

  return (
    <div
      ref={controlWrapRef}
      className={cn('absolute z-10', className)}
    >
      {children}
    </div>
  );
};

export default MapController;