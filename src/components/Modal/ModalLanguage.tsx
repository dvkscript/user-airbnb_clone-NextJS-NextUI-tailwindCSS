"use client"
import useModal from '@/hooks/useModal'
import { Divider, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation';
import { languages, TLanguageCode, TLanguages } from "countries-list";
import useDictionary from '@/hooks/useDictionary';
import { Dictionary, getLanguageNames, LanguageNames } from '@/libs/dictionary.lib';
import LoaderSpinner from '../Loader/LoaderSpinner';
import Translate from '../Common/Translate';
import ButtonTranslate from '../Button/ButtonTranslate';

const ModalLanguage = () => {
    const { isOpen, onClose } = useModal();
    const params = useParams();
    const { t } = useDictionary<"common", Dictionary["common"]["modal"]["languages"]>("common", d => d.modal.languages);

    const [languageNames, setLanguageNames] = useState<LanguageNames | null>(null);
    

    useEffect(() => {
        (async () => {
            setLanguageNames(await getLanguageNames())
        })();
    }, []);

    const contentEl = useMemo(() => {
        const browserLanguage = navigator.language;
        const languageCode = browserLanguage.substring(0, 2);

        if (!languageNames) {
            return (
                <div className='text-center my-60'>
                    <LoaderSpinner />
                </div>
            )
        };

        return (
            <div>
                <h2 className='text-subtitle mb-4'>
                    {t("suggested languages and regions")}
                </h2>
                <Translate>
                    <div
                        className='flex flex-wrap justify-start items-center gap-3'
                    >
                        <ButtonTranslate
                            size='lg'
                            className='flex-[0_0_180px] h-fit px-3 py-2'
                            variant={params.lang === languageCode ? "bordered" : 'light'}
                            radius='sm'
                            langValue={languageCode as any}
                        >
                            <div className='text-left w-full'>
                                <span className='block text-md font-medium'>{languageNames[languageCode]}</span>
                                <span className='block text-xs text-default-500'>{languages[languageCode as keyof TLanguages]?.native}</span>
                            </div>
                        </ButtonTranslate>
                        <ButtonTranslate
                            size='lg'
                            className='flex-[0_0_180px] h-fit px-3 py-1'
                            variant={params.lang === 'en' ? "bordered" : 'light'}
                            radius='sm'
                            langValue={"en"}
                        >
                            <div className='text-left w-full'>
                                <span className='block text-md'>{languageNames['en']}</span>
                                <span className='block text-xs text-default-500'>{languages['en']?.native}</span>
                            </div>
                        </ButtonTranslate>
                    </div>
                </Translate>
                <h2 className='text-subtitle my-4'>
                    {t("choose a language and region")}
                </h2>
                <Translate>
                    <div
                        className='grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3'
                    >
                        {
                            Object.keys(languageNames).map((key) => {
                                const text = languageNames[key];
                                if (key === "ae") {
                                    return null
                                }
                                return (
                                    <ButtonTranslate
                                        size='lg'
                                        key={key}
                                        className='h-fit px-3 py-1'
                                        variant={params.lang === key ? "bordered" : 'light'}
                                        radius='sm'
                                        langValue={key as TLanguageCode}
                                    >
                                        <div className='text-left w-full'>
                                            <span className='block text-md'>{text}</span>
                                            <span className='block text-xs text-default-500'>{languages[key as keyof TLanguages]?.native}</span>
                                        </div>
                                    </ButtonTranslate>
                                )
                            })
                        }
                    </div>
                </Translate>
            </div>
        )
    }, [languageNames, params.lang, t]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
                wrapper: "overflow-hidden",
                body: "py-4",
                base: "overflow-hidden min-h-52 dark:bg-default-100",
            }}
            size='5xl'
            scrollBehavior="inside"
        >
            <Translate isTrans isExcLocaleSystem>
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 py-5 px-8">
                                <h1 className='text-2xl font-medium'>
                                    {t("language and region")}
                                </h1>
                            </ModalHeader>
                            <Divider />
                            <ModalBody>
                                {contentEl}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Translate>
        </Modal>
    )
}

export default ModalLanguage