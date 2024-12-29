"use client"
import CardAuth from "@/components/Card/CardAuth";
import CookieConfig from "@/configs/cookie.config";
import useToast from "@/hooks/useToast";
import { setCookies } from "@/libs/cookies.server";
import { signIn, signUp } from "@/services/auth.service";
import { ResponseUtil } from "@/utils/response.util";
import { TSignInValidator, TSignUpValidator } from "@/validators/auth.validator";
import { addDays } from "date-fns";
import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useState } from "react"
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

const BookAuth = ({ }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formMode, setFormMode] = useState<"login" | "register">("login");
    const router = useRouter();
    const { toastRes } = useToast();
    const [emailRegister, setEmailRegister] = useState<string>("");

    const handleLoginSubmit = useCallback(async (formData: TSignInValidator, reset: UseFormReturn<TSignInValidator>["reset"]) => {
        setIsLoading(true);
        const result = await signIn(formData);

        if (result.ok) {
            reset();
            router.refresh();
        } else {
            toast.error(result.message, { position: "top-center" });
        }
        setIsLoading(false);
    }, [
        setIsLoading,
        router
    ]);

    const handleRegisterSubmit = useCallback(async (formData: TSignUpValidator, reset: UseFormReturn<TSignUpValidator>["reset"]) => {
        setIsLoading(true);
        const result = await signUp(formData);

        if (result.ok) {
            toastRes(result);
            setEmailRegister(formData.email);
            reset();
        } else {
            toast.error(result.message, { position: "top-center" })
        }
        setIsLoading(false)
    }, [
        setIsLoading,
        toastRes
    ]);

    const handleWinDownMessage = useCallback((response: ResponseUtil<any>) => {
        setIsLoading(true);
        if (response?.ok) {
            setCookies([
                { name: CookieConfig.accessToken.name, value: response.data?.accessToken },
                { name: CookieConfig.refreshToken.name, value: response.data?.refreshToken },
            ], {
                httpOnly: true,
                expires: addDays(new Date(), 30)
            });
            router.refresh()
        } else {
            toast.error(response.message);
        }
        setIsLoading(false)
    }, [setIsLoading, router]);

    return (
        <CardAuth
            onSignInSubmit={handleLoginSubmit}
            onSignUpSubmit={handleRegisterSubmit}
            onWindowMessage={handleWinDownMessage}
            isLoading={isLoading}
            formMode={formMode}
            toFormLogin={() => setFormMode("login")}
            toFormRegister={() => setFormMode("register")}
            usernameDefault={emailRegister}
        />
    );
};

export default BookAuth;