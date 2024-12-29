import { Selector } from "zustand/type";
import { LoaderSystemStore, LocationSystemStore, MapSystemStore, SystemStore } from "../stores/systemStore";

export const locationSelector: Selector<SystemStore, LocationSystemStore> = (s) => ({
    localeSystems: s.localeSystems,
    setLocaleSystems: s.setLocaleSystems,
    countries: s.countries,
});

export const loaderSelector: Selector<SystemStore, LoaderSystemStore> = (s) => ({
    isLoaded: s.isLoaded,
    setIsLoaded: s.setIsLoaded,
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
});

export const mapSelector: Selector<SystemStore, MapSystemStore> = (s) => ({
    map: s.map,
    setMap: s.setMap,
    onResetMap: s.onResetMap
})