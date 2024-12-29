"use client"
import { DictionaryProvider } from '@/hooks/useDictionary';
import useSystemStore from '@/hooks/useSystemStore';
import { Dictionary, Locale, LocaleSystems } from '@/libs/dictionary.lib';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider } from 'next-themes';
import { ThemeProviderProps } from 'next-themes/dist/types';
import React, { useEffect } from 'react';
import TranslateProvider from './TranslateProvider';
import useUserStore from '@/hooks/useUserStore';
import { profileSelector } from '@/hooks/selectors/userSelector';
import { loaderSelector } from '@/hooks/selectors/systemSelector';
import { HeaderValue } from '@/configs/header.config';
import { useRouter } from 'next/navigation';
import { I18nProvider } from '@react-aria/i18n';

interface ProviderProps extends Omit<ThemeProviderProps, "children"> {
    children?: React.ReactNode;
    dictionary: Dictionary;
    localeSystems: LocaleSystems;
    profile: HeaderValue<"user">;
    isAuthorization: HeaderValue<"isAuthorization">;
    lang: Locale;
}

const Provider: React.FC<ProviderProps> = ({
    children,
    dictionary,
    localeSystems,
    profile,
    isAuthorization,
    lang,
    ...props
}) => {

    const { setIsLoaded } = useSystemStore(loaderSelector);
    const { setProfile } = useUserStore(profileSelector);
    const router = useRouter();

    useEffect(() => {
        setIsLoaded(true);
        return () => {
            setIsLoaded(false);
        }
    }, [
        setProfile,
        setIsLoaded
    ]);

    useEffect(() => {
        if (isAuthorization) {
            if (profile) {
                setProfile(profile);
            } else {
                router.refresh();
            }
        } else if (!profile) {
            setProfile(null);
        }
    }, [isAuthorization, profile, setProfile, router])

    return (
        <ThemeProvider
            {...props}
        >
            <NextUIProvider className='w-full h-full bg-inherit'>
                <I18nProvider locale={lang}>
                    <DictionaryProvider value={{ dictionary }}>
                        <TranslateProvider localeSystems={localeSystems}>
                            {children}
                        </TranslateProvider>
                    </DictionaryProvider>
                </I18nProvider>
            </NextUIProvider>
        </ThemeProvider>
    );
};

export default Provider;