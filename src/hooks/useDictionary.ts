import { Dictionary, PageLocales } from '@/libs/dictionary.lib';
import { createContext, useCallback, useContext, useMemo } from 'react';

type InitialDictionary = {
    dictionary: Dictionary | null;
}

const initialDictionary: InitialDictionary = {
    dictionary: null,
};

const DictionaryContext = createContext<InitialDictionary>(initialDictionary);
export const DictionaryProvider = DictionaryContext.Provider;

type Obj = {
    [key: string]: string | Obj
}

const useDictionary = <K extends PageLocales, T extends Dictionary[K] | Obj>(page: K, callback?: (d: Dictionary[K]) => T) => {
    const { dictionary } = useContext(DictionaryContext);

    const p = useMemo(() => dictionary?.[page] as Dictionary[K], [page, dictionary]);

    const d = useMemo(() => callback && callback(p), [p, callback]);

    const t = useCallback((key: typeof d extends undefined ? keyof typeof p : keyof T, value?: string): string => {
        if (!d) {
            const text = p[key as keyof typeof p];
            if (typeof text === "string") {
                if (value) return text.replace(/{{(.+)}}/g, value);
                return text;
            }
            return key as string;
        }
        const text = d[key as keyof T];
        if (typeof text === "string") {
            if (value) return text.replace(/{{(.+)}}/g, value);
            return text;
        }
        return key as string;
    }, [d, p]);

    return {
        t,
        d,
        p,
        dictionary
    }
}

export default useDictionary;

