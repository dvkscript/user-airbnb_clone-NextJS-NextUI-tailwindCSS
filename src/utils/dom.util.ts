import { CalendarDate, parseDate as parseDateDefault } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import { format, FormatOptions, isValid, parse } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function cleanStr(str: string) {
    return str
        .split('\n')
        .map(line => line
            .trim()
            .replace(/\s+/g, ' ')
        )
        .filter(line => line !== '')
        .join('\n');
}

export function capitalize(str: string) {
    return str
        .trim()
        .split(" ")
        .map((char) => char.charAt(0).toUpperCase() + char.slice(1))
        .join(" ");
}

export function parseDateTime(dateTimeString: string | Date) {
    const dateObject = new Date(dateTimeString);

    const day = dateObject.getDate();
    const month = dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    const hour = dateObject.getHours();
    const minute = dateObject.getMinutes();
    const second = dateObject.getSeconds();

    return { day, month, year, hour, minute, second };
}

export function formatPrice(value: number, option?: Intl.NumberFormatOptions & { locale?: string }) {
    const { locale, ...rest } = option ?? {};
    const result = new Intl.NumberFormat(locale ?? 'en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...rest,
    });
    return result.format(value);
}

export function formatDate(value: string, formatStr: string, option?: FormatOptions) {
    const date = parse(value, formatStr, new Date());

    if (!isValid(date)) {
        return null;
    }

    return format(date, formatStr, option);
}

/**
 * Parses a date string in the format YYYY-MM-DD.
 *
 * @param value - A string representing a date in the format YYYY-MM-DD.
 * @returns A `CalendarDate` object if the string is valid, otherwise `null`.
 */

export function parseDate(value: string): CalendarDate | null {
    try {
        const date = parseDateDefault(value);
        return date;
    } catch {
        return null;
    }
}