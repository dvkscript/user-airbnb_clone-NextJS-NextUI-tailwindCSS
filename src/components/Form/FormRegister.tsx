"use client";
import useDictionary from '@/hooks/useDictionary';
import { cn } from '@/utils/dom.util';
import { SignUpValidator, TSignUpValidator } from '@/validators/auth.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, InputProps } from '@nextui-org/react';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form';
import Translate from '../Common/Translate';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import Button from '../Button';
import { passwordRegex } from '@/utils/regex.util';

interface FormRegisterProps {
    onSubmit: (formData: TSignUpValidator, reset: UseFormReturn<TSignUpValidator>["reset"]) => void;
    isLoading?: boolean;
    onLayoutChange?: () => void;
    title?: string;
}

const initialFormData: TSignUpValidator = {
    full_name: "",
    email: "",
    password: "",
    re_password: ""
}

const FormRegister: FC<FormRegisterProps> = ({
    onSubmit,
    isLoading,
    onLayoutChange,
    title,
}) => {
    const btnMsg = useDictionary("common", (d) => d.buttons).t;
    const formMsg = useDictionary("common", (d) => d.forms).d;
    const { d, p } = useDictionary("auth", (d) => d.register);
    const passwordMsgRef = useRef<HTMLDivElement | null>(null)

    const [formData, setFormData] = useState<TSignUpValidator>(initialFormData);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TSignUpValidator>({
        resolver: zodResolver(SignUpValidator),
    });

    const setValueState = useCallback((key: keyof typeof formData, value: string) => {
        setFormData({
            ...formData,
            [key]: value
        })
    }, [formData]);

    const [isShowPass, setIsShowPass] = useState<boolean>(false);

    const inputProps = (name: keyof typeof formData): InputProps => {
        return {
            type: "text",
            variant: "bordered",
            value: formData[name],
            ...register(name),
            isInvalid: !!errors?.[name]?.message,
            errorMessage: name !== "password" ? <Translate isTrans isExcLocaleSystem={false}>
                {errors?.[name]?.message || ""}
            </Translate> : "",
            isDisabled: isLoading,
            onValueChange: (v) => setValueState(name, v),
            radius: "sm"
        }
    }

    const passwordMsgEl = useMemo(() => {
        if (!formMsg) return null;

        return Object.keys(formMsg.password.massages).map((key) => {
            const msg = formMsg.password.massages[key as keyof typeof formMsg.password.massages];
            const isError = !passwordRegex[key as keyof typeof passwordRegex].test(formData.password);

            return (
                <p className={cn(
                    'block',
                    isError ? "text-danger-500" : "text-default-500 line-through"
                )} key={key}>
                    {
                        isError ? (
                            <X className='inline-block ml-1 mr-2' size={18} />
                        ) : (
                            <Check className='inline-block ml-2 mr-3 text-green-500' size={16} />
                        )
                    }
                    {msg}
                </p>
            )
        })
    }, [formMsg, formData.password])

    return (
        <>

            {
                !!title && (
                    <h3 className='text-xl font-medium pb-1'>
                        {title}
                    </h3>
                )
            }
            <form
                onSubmit={handleSubmit((data) => onSubmit(data, reset))}
                className='flex flex-col gap-y-3'
            >
                <Input
                    autoFocus
                    {...inputProps("full_name")}
                    label={formMsg?.full_name.label}
                />
                <Input
                    {...inputProps("email")}
                    label={formMsg?.email.label}
                />
                <Input
                    {...inputProps("password")}
                    label={formMsg?.password.label}
                    type={isShowPass ? "text" : "password"}
                    endContent={(
                        <Button
                            className={cn(
                                'bg-transparent text-xl absolute top-[50%] right-1.5 translate-y-[-50%]',
                                !!errors?.password?.message && "text-danger-500"
                            )}
                            isIconOnly
                            onPress={() => {
                                setIsShowPass(!isShowPass)
                            }}
                        >
                            {
                                isShowPass ?
                                    <EyeOff className='pointer-events-none' strokeWidth={1.8} /> :
                                    <Eye className='pointer-events-none' strokeWidth={1.8} />
                            }
                        </Button>
                    )}
                />
                <div
                    className='overflow-hidden transition-height'
                    style={{
                        height: !!errors.password?.message ? `${(passwordMsgRef.current?.offsetHeight || 0)}px` : "0"
                    }}
                >
                    <div ref={passwordMsgRef} className='text-sm'>
                        {passwordMsgEl}
                    </div>
                </div>
                <Input
                    {...inputProps("re_password")}
                    label={formMsg?.['re-password'].label}
                    type={isShowPass ? "text" : "password"}
                />

                {
                    !!onLayoutChange && (
                        <div className='text-[13px] px-1'>
                            <p>
                                {d?.link}
                                {" "}
                                <Button
                                    variant='light'
                                    size='sm'
                                    type='button'
                                    className='underline decoration-1 hover:bg-default-50'
                                    onPress={onLayoutChange}
                                    disableRipple
                                    disableAnimation
                                >
                                    {p.login.title}
                                </Button>
                            </p>

                        </div>
                    )
                }
                <Button
                    type='submit'
                    className='bg-rose-600 text-gray-50 text-md font-bold h-12'
                    isLoading={isLoading}
                >
                    {!isLoading &&btnMsg("Continue")}
                </Button>

            </form>
        </>
    )
}

export default FormRegister