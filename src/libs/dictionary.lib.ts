"use server";
import { getCountryCode, languages as languageCodes, TLanguages } from "countries-list";
import dictionaries from "../../locales";
import { getCookie } from './cookies.server';
import isoCountries from "i18n-iso-countries";
import languages, { LocalizedLanguageNames } from "@cospired/i18n-iso-languages";
import { defaultLocale } from "@/configs/valueDefault.config";
import CookieConfig from "@/configs/cookie.config";

export type LocaleSystem = keyof typeof dictionaries
export type Dictionary = Awaited<ReturnType<typeof dictionaries[LocaleSystem]>>;
export type LocaleSystems = LocaleSystem[]

export type PageLocales = keyof Dictionary;

export type Locale = keyof TLanguages;
export type Locales = Locale[];

export const getLocales = async () => {
    return Object.keys(languageCodes) as Locales;
}

export const getLocale = async () => {
    const locale = await getCookie(CookieConfig.locale.name) ?? defaultLocale;

    if ((await getLocales()).includes(locale as any)) {
        return defaultLocale;
    }
    return locale as Locale;
}


export const getLocaleSystems = async () => Object.keys(dictionaries) as LocaleSystems;

export const getDictionary = async (
    locale: Locale,
    page?: PageLocales
): Promise<Dictionary | Dictionary[PageLocales]> => {
    let data;
    const localeSystems = await getLocaleSystems();
    const isLocaleSystems = localeSystems.includes(locale as LocaleSystem);

    if (isLocaleSystems) {
        data = await dictionaries[locale as LocaleSystem]();
    } else {
        data = await dictionaries[defaultLocale]();
    }

    if (page === undefined) {
        return data as Dictionary
    }
    return data[page] as Dictionary[PageLocales]
}


export const getLanguageNames = async (locale?: Locale): Promise<LocalizedLanguageNames> => {
    const data = languages.getNames(locale || await getLocale());
    if (Object.keys(data).length < 1) {
        return languages.getNames(defaultLocale);
    }
    return data;
}

export type LanguageNames = Awaited<ReturnType<typeof getLanguageNames>>

export const getCountryNames = async (locale: Locale) => {
    const data = isoCountries.getNames(locale || await getLocale())
    if (Object.keys(data).length < 1) {
        return isoCountries.getNames(defaultLocale);
    }
    return data
}

export type CountryNames = Awaited<ReturnType<typeof getCountryNames>>

export const getCountryAlpha2Code = async (countryName: string) => {
    return getCountryCode(countryName)
}