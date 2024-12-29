import { LocaleSystems } from "@/libs/dictionary.lib";
import { countries, TCountries } from "countries-list";
import { Map } from "maplibre-gl";
import { createStore, StateCreator } from "zustand";

const locationSystemStore = (set: Set) => ({
    localeSystems: [] as LocaleSystems,
    setLocaleSystems(localeSystems: typeof this.localeSystems) {
        set({
            localeSystems
        })
    },
    countries: countries as TCountries,
});

const loaderSystemStore = (set: Set) => ({
    isLoaded: false,
    isLoading: false,
    setIsLoaded(isLoaded: typeof this.isLoaded) {
        set({
            isLoaded
        })
    },
    setIsLoading(isLoading: typeof this.isLoading) {
        set({
            isLoading
        })
    },
});


const mapSystemStore = (set: Set) => ({
    map: null as Map | null,
    setMap(map: typeof this.map) {
        set({
            map
        })
    },
    onResetMap(map: typeof this.map) {
        if (map) {
            map.remove()
        }
        set({
            map: null
        })
    },
});

const stores: StateCreator<SystemStore> = (set) => ({
    ...locationSystemStore(set),
    ...loaderSystemStore(set),
    ...mapSystemStore(set),
});

export const systemStore = createStore<SystemStore>(stores);

export type MapSystemStore = ReturnType<typeof mapSystemStore>;
export type LocationSystemStore = ReturnType<typeof locationSystemStore>;
export type LoaderSystemStore = ReturnType<typeof loaderSystemStore>;

export interface SystemStore extends 
    LocationSystemStore, 
    LoaderSystemStore, 
    MapSystemStore {
}

type StoresParams = Parameters<typeof stores>;

type Set = StoresParams["0"];
// type Get = StoresParams["1"]

