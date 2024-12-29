"use client";
import React, { useState } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form';
import { Input } from '@nextui-org/react';
import useDictionary from '@/hooks/useDictionary';
import { SignInValidator, TSignInValidator } from '@/validators/auth.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import Translate from '../Common/Translate';
import { Eye, EyeOff, Mail } from 'lucide-react';
import Button from '../Button';

interface FormLoginProps {
    usernameDefault?: string;
    onSubmit: (formData: TSignInValidator, reset: UseFormReturn<TSignInValidator>["reset"]) => void;
    onLayoutChange?: () => void;
    isLoading?: boolean;
    title?: string;
}

const FormLogin: React.FC<FormLoginProps> = ({
    usernameDefault,
    onLayoutChange,
    onSubmit,
    isLoading,
    title,
}) => {
    const { d, p } = useDictionary("auth", (d) => d.login);
    const btnMsg = useDictionary("common", (d) => d.buttons).t;
    const formMsg = useDictionary("common", (d) => d.forms).d;
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TSignInValidator>({
        resolver: zodResolver(SignInValidator),
    });

    const [passwordType, setPasswordType] = useState<"text" | "password">("password");

    return (
        <>
            {
                !!title && (
                    <h3 className='text-xl font-medium pb-3'>
                        {title}
                    </h3>
                )
            }
            <form
                onSubmit={handleSubmit((data) => onSubmit(data, reset))}
                className='flex flex-col gap-y-3'
            >
                <Input
                    autoFocus={!(!!usernameDefault)}
                    label={formMsg?.email.label}
                    variant="bordered"
                    {...register("email")}
                    isInvalid={!!errors?.email?.message}
                    errorMessage={<Translate isTrans isExcLocaleSystem={false}>{errors?.email?.message || ""}</Translate>}
                    isDisabled={isLoading}
                    defaultValue={usernameDefault}
                    endContent={<Mail size={30} className='text-default-600 mx-1 mb-0.5 pointer-events-none' strokeWidth={1.5} />}
                    radius='sm'
                />
                <Input
                    autoFocus={!!usernameDefault}
                    label={formMsg?.password.label}
                    isDisabled={isLoading}
                    variant="bordered"
                    className='relative'
                    {...register("password")}
                    type={passwordType}
                    isInvalid={!!errors?.password?.message}
                    errorMessage={!!errors?.password?.message ? <>
                        <Translate isTrans>
                            {formMsg?.password.massages[errors.password.message as keyof typeof formMsg.password.massages]}
                        </Translate>
                    </> : undefined}
                    endContent={(
                        <Button
                            className="focus:outline-none max-h-full text-default-600"
                            isIconOnly
                            variant='light'
                            disableRipple
                            onPress={() => {
                                setPasswordType(passwordType === "text" ? "password" : "text")
                            }}
                        >
                            {
                                passwordType === "text" ?
                                    <EyeOff className='pointer-events-none align-middle' size={28} strokeWidth={1.5} /> :
                                    <Eye className='pointer-events-none align-middle' size={28} strokeWidth={1.5} />
                            }
                        </Button>
                    )}
                    radius='sm'
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
                                    className='underline decoration-1'
                                    onPress={onLayoutChange}
                                >
                                    {p.register.title}
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
                    {!isLoading && btnMsg("Continue")}
                </Button>
            </form>
        </>
    )
}

export default FormLogin