"use client"
import useModal from '@/hooks/useModal';
import { Divider, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next-nprogress-bar';
import { toast } from 'sonner';
import useDictionary from '@/hooks/useDictionary';
import { signIn, signUp } from '@/services/auth.service';
import { ModalMode } from '@/enum/modalMode';
import Translate from '../Common/Translate';
import { TSignInValidator, TSignUpValidator } from '@/validators/auth.validator';
import { UseFormReturn } from 'react-hook-form';
import useToast from '@/hooks/useToast';
import CardAuth from '../Card/CardAuth';
import { ResponseUtil } from '@/utils/response.util';

const ModalAuth = ({
}) => {
    const { isOpen, isLoading, onClose, setIsLoading, mode, onModal } = useModal();
    const router = useRouter();
    const [emailRegister, setEmailRegister] = useState<string>("");
    const { d } = useDictionary("auth", d => d);
    const { toastRes } = useToast();

    const handleWinDownMessage = useCallback((response: ResponseUtil<any>) => {
        setIsLoading(true);
        
        if (response?.ok) {
            onClose();
            router.refresh()
        } else {
            toast.error(response.message);
        }
        setIsLoading(false)
    }, [setIsLoading, router, onClose]);

    const handleLoginSubmit = useCallback(async (formData: TSignInValidator, reset: UseFormReturn<TSignInValidator>["reset"]) => {
        setIsLoading(true);
        const result = await signIn(formData);

        if (result.ok) {
            onClose();
            reset();
            router.refresh();
        } else {
            toast.error(result.message, { position: "top-center" });
        }
        setIsLoading(false);
    }, [
        setIsLoading,
        onClose,
        router
    ]);

    const handleRegisterSubmit = useCallback(async (formData: TSignUpValidator, reset: UseFormReturn<TSignUpValidator>["reset"]) => {
        setIsLoading(true);
        const result = await signUp(formData);

        if (result.ok) {
            toastRes(result);
            setEmailRegister(formData.email);
            reset();
            onModal({
                mode: ModalMode.AUTH_SIGN_IN
            })
        } else {
            toast.error(result.message, { position: "top-center" })
        }
        setIsLoading(false)
    }, [
        setIsLoading,
        onModal,
        toastRes
    ]);

    useEffect(() => {
        if (!isOpen) {
            setEmailRegister('')
        }
    }, [isOpen])

    return (
        <Modal
            isOpen={isOpen}
            scrollBehavior='inside'
            classNames={{
                wrapper: "overflow-hidden",
                base: "overflow-hidden min-h-40 dark:bg-default-100"
            }}
            onClose={() => {
                onClose();
                localStorage.removeItem("isAuth");
            }}
            size={"xl"}
            backdrop='opaque'

        >
            <Translate isExcLocaleSystem isTrans>
                <ModalContent className='h-auto'>
                    {() => (
                        <>
                            <ModalHeader>
                                <h2 className='text-center text-title-accent mx-auto'>
                                    {mode === ModalMode.AUTH_SIGN_IN && d?.login.title}
                                    {mode === ModalMode.AUTH_SIGN_UP && d?.register.title}
                                </h2>
                            </ModalHeader>
                            <Divider />
                            <ModalBody className='pb-6 pt-3'>
                                <CardAuth
                                    formMode={mode === ModalMode.AUTH_SIGN_IN ? "login" : "register"}
                                    onSignInSubmit={handleLoginSubmit}
                                    onSignUpSubmit={handleRegisterSubmit}
                                    onWindowMessage={handleWinDownMessage}
                                    toFormLogin={() => {
                                        onModal({
                                            mode: ModalMode.AUTH_SIGN_IN
                                        })
                                    }}
                                    toFormRegister={() => {
                                        onModal({
                                            mode: ModalMode.AUTH_SIGN_UP
                                        })
                                    }}
                                    isLoading={isLoading}
                                    usernameDefault={emailRegister}
                                    formSignInTitle={d?.login.subtitle}
                                    formSignUpTitle={d?.register.subtitle}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Translate>
        </Modal>
    )
}

export default ModalAuth