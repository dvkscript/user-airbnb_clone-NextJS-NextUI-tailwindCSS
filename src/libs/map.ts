import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { getLocale } from "./dictionary.lib";
import { OpenStreetMapProviderOptions } from "leaflet-geosearch/dist/providers/openStreetMapProvider.js";
import { SearchResult } from "leaflet-geosearch/dist/providers/provider.js";

export type MapSearchResult = SearchResult<any>

export const mapSearch = async (value: string, searchParams?: Params & { locale?: string }): Promise<MapSearchResult[]> => {
    const { OpenStreetMapProvider } = await import("leaflet-geosearch");
    const option: OpenStreetMapProviderOptions = {
        params: {
            'accept-language': searchParams?.locale || await getLocale(),
        },
    };
    if (searchParams) {
        delete searchParams.locale;
        option.params = {
            ...searchParams,
            ...option.params
        }
    }
    try {
        const provider = new OpenStreetMapProvider(option);
        const results = await provider.search({
            query: value,
        });
        return results as any
    } catch (error) {
        console.error(error)
        return [];
    }
}