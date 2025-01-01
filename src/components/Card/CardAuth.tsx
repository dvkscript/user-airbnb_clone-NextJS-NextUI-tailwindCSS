"use client"
import React, { useCallback, useEffect } from "react"
import FormLogin from "../Form/FormLogin";
import FormRegister from "../Form/FormRegister";
import { ApiProviders } from "@/configs/apiRouter.config";
import Icons from "../Common/Icons";
import Button from "../Button";
import { Divider } from "@nextui-org/react";
import { getSocialRedirectLink } from "@/services/auth.service";
import { toast } from "sonner";
import { ResponseUtil } from "@/utils/response.util";
import { TSignInValidator, TSignUpValidator } from "@/validators/auth.validator";
import useDictionary from "@/hooks/useDictionary";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/utils/dom.util";
import { setCookies } from "@/libs/cookies.server";
import CookieConfig from "@/configs/cookie.config";
import { addDays } from "date-fns";

interface CardAuthProps {
    formMode?: "login" | "register";
    toFormLogin?: () => void;
    toFormRegister?: () => void;
    isLoading?: boolean;
    usernameDefault?: string;
    onWindowMessage: (response: ResponseUtil<any>) => void;
    onSignInSubmit: (formData: TSignInValidator, reset: UseFormReturn<TSignInValidator>["reset"]) => void;
    onSignUpSubmit: (formData: TSignUpValidator, reset: UseFormReturn<TSignUpValidator>["reset"]) => void;
    formSignInTitle?: string;
    formSignUpTitle?: string;
}

const CardAuth: React.FC<CardAuthProps> = ({
    formMode = "login",
    toFormLogin,
    toFormRegister,
    isLoading,
    usernameDefault,
    onWindowMessage,
    onSignInSubmit,
    onSignUpSubmit,
    formSignInTitle,
    formSignUpTitle
}) => {
    const { t } = useDictionary("auth", d => d);

    const handleRedirect = useCallback(async (provider: any) => {
        const result = await getSocialRedirectLink(provider);

        if (result.ok) {
            const width = 500;
            const height = 600;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 3;
            window.open(
                result.data?.urlRedirect,
                provider,
                `toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},left=${left},top=${top}`
            );
        } else {
            toast.error(result.message);
        }
    }, []);

    const handleWinDownMessage = useCallback(async (event: MessageEvent<any>) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type !== "authentication") return;
        const response = event.data?.data || {};
        setCookies([
            { name: CookieConfig.accessToken.name, value: response.data?.accessToken },
            { name: CookieConfig.refreshToken.name, value: response.data?.refreshToken },
        ], {
            httpOnly: true,
            expires: addDays(new Date(), 30)
        });
        onWindowMessage(response);
    }, [onWindowMessage]);

    useEffect(() => {
        window.addEventListener('message', handleWinDownMessage);
        return () => {
            if (window) {
                window.removeEventListener('message', handleWinDownMessage);
            }
        };
    }, [handleWinDownMessage]);

    return (
        <div className="inline-flex flex-col gap-y-3 w-full">
            {formMode === "login" && <FormLogin
                usernameDefault={usernameDefault}
                onSubmit={onSignInSubmit}
                isLoading={isLoading}
                onLayoutChange={toFormRegister}
                title={formSignInTitle}
            />}
            {formMode === "register" && <FormRegister
                onSubmit={onSignUpSubmit}
                isLoading={isLoading}
                onLayoutChange={toFormLogin}
                title={formSignUpTitle}
            />}
            <div className='flex justify-center items-center gap-x-3'>
                <Divider className='flex-1' />
                <p>or</p>
                <Divider className='flex-1' />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                {
                    ApiProviders.map((provider, index) => {
                        const IconComponent = Icons[provider as keyof typeof Icons];
                        return (
                            <Button
                                key={`${provider}-${index}`}
                                onPress={() => handleRedirect(provider)}
                                variant='bordered'
                                size='lg'
                                isLoading={isLoading}
                                className={cn(
                                    'min-h-11 px-2 grow border-1.5 w-full',
                                )}
                                startContent={!!IconComponent && <IconComponent className='absolute left-5 top-[50%] translate-y-[-50%] text-default-600' />}
                            >
                                {t("provider", provider)}
                            </Button>
                        )
                    })
                }
            </div>
        </div>
    );
};

export default CardAuth;