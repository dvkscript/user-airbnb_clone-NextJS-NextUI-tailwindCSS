"use client"
import React, { ReactNode, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Translate from './Common/Translate';
import { LocaleSystem, LocaleSystems } from '@/libs/dictionary.lib';
import { defaultLocale } from '@/configs/valueDefault.config';
import useSystemStore from '@/hooks/useSystemStore';
import { locationSelector } from '@/hooks/selectors/systemSelector';
import CookieConfig from '@/configs/cookie.config';

interface TranslateProviderProps {
    children?: ReactNode;
    localeSystems: LocaleSystems;
}

const TranslateProvider: React.FC<TranslateProviderProps> = ({
    children,
    localeSystems
}) => {

    const { lang } = useParams();

    const setCookie = (cName: string, cValue: string, exDays: number | "Session") => {
        const d = new Date()
        let expires;
        if (typeof exDays === 'number') {
            d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
            expires = "expires=" + d.toUTCString();
        }
        document.cookie = cName + "=" + cValue + ";" + expires + ";path=/";
    };

    const { setLocaleSystems } = useSystemStore(locationSelector)

    useEffect(() => {
        setLocaleSystems(localeSystems)
    }, [localeSystems, setLocaleSystems]);

    useEffect(() => {
        setCookie(CookieConfig.googleTranslate.name, `/${defaultLocale}/${lang === "zh" ? 'zh-CN' : lang}`, 30);
        if (!(window as any).TranslateProviderElementInit) {
            (window as any).TranslateProviderElementInit = () => {
                new (window as any).google.translate.TranslateElement(
                    {
                        pageLanguage: defaultLocale,
                        layout: (window as any).google.translate.TranslateElement.InlineLayout.TOP_LEFT,
                    },
                    "google_translate_element",
                );
            };
        }

        const script = document.createElement("script");
        if (!document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=TranslateProviderElementInit"]')) {
            script.type = "text/javascript";
            script.src = "//translate.google.com/translate_a/element.js?cb=TranslateProviderElementInit";
            document.head.appendChild(script);
        }
        // if (script) {
        //     script.onload = () => {
        //         setIsLoaded(true);
        //     }
        // }

        if (!document.querySelector("style[data-google-translate-style]")) {
            const style = document.createElement("style");
            style.setAttribute("data-google-translate-style", "true");
            style.innerHTML = `
                    body .skiptranslate { display: none !important; }
                    body { top: 0px !important; }
                    .goog-te-gadget-simple {background-color:#FFF;border:none;font-size:11px;}
                    .goog-te-gadget-simple img {display:none;}
                    .goog-te-gadget-icon { display: none !important; }
                    .goog-te-combo { display: none !important; }
                    .goog-logo-link { display: none !important; }
                    .goog-te-gadget { color: transparent !important; }
                    font font { background-color: inherit !important; box-shadow: inherit !important; }
                    body > [class^="VIpgJd-"] { display: none !important; }
                `;
            document.head.appendChild(style);
        }
    }, [lang]);

    return (
        <>
            <Translate isTrans={!localeSystems.includes(lang as LocaleSystem)} className='w-full h-full bg-inherit'>
                {children}
            </Translate>
            <div id="google_translate_element" style={{ display: 'none' }}></div>
        </>
    );
};

export default TranslateProvider;