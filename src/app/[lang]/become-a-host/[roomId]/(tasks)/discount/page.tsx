"use client";
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {slideUpContainer, slideUpItem} from "@/animations/slideUp.animation";
import Motion from "@/components/Common/Motion";
import useDictionary from "@/hooks/useDictionary";
import {Dictionary} from "@/libs/dictionary.lib";
import {Checkbox, CheckboxProps, Input, InputProps} from "@nextui-org/react";
import {Discount, RoomStatus} from "@/enum/room";
import useRoomStore from "@/hooks/useRoomStore";
import {roomCreationSelector} from "@/hooks/selectors/roomSelector";
import {useRouter} from "next/navigation";
import {updateUserRoom} from "@/services/user.service";
import useToast from "@/hooks/useToast";
import Translate from '@/components/Common/Translate';

const initialFormData = {
    [Discount.NEW_USER]: {
        percent: 20,
        checked: true,
    },
    [Discount.WEEKLY]: {
        percent: 8,
        checked: true,
    },
    [Discount.MONTHLY]: {
        percent: 15,
        checked: true,
    }
}

const Page = ({params: {roomId}}: { params: { roomId: string } }) => {
    const {
        t,
        d
    } = useDictionary<"become-a-host", Dictionary["become-a-host"]["discount"]>("become-a-host", d => d.discount);
    const {
        roomCreationPathnames: {nextTask, backTask},
        setIsBackLoading,
        setIsNextLoading,
        setValues,
        onResetRoomCreation,
        room,
    } = useRoomStore(roomCreationSelector)
    const router = useRouter();
    const [formData, setFormData] = useState<Record<string, { percent: number, checked: boolean }>>(initialFormData);
    const [inputFocus, setInputFocus] = useState<keyof typeof formData | null>(null);


    const errors = useMemo(() => {
        const { percent: percentWeekly, checked: checkedWeekly } = formData[Discount.WEEKLY];
        const { checked: checkedMonthly, percent: percentMonthly } = formData[Discount.MONTHLY];

        if (inputFocus === Discount.WEEKLY) {
            if (
                checkedMonthly && checkedMonthly &&
                (percentWeekly >= percentMonthly)
            ) {
                return {
                        [Discount.WEEKLY]: `Your weekly discount must be lower than your monthly discount of ${percentMonthly}%`
                }
            }
        }

        if (inputFocus === Discount.MONTHLY) {
            if (
                checkedWeekly && checkedMonthly &&
                (percentMonthly <= percentWeekly)
            ) {
                return {
                    [Discount.MONTHLY]: `Your monthly discount must be higher than your weekly discount of ${percentWeekly}%`
                }
            }
        }
        return null;
    },[formData, inputFocus])


    const setFormValue = useCallback(<T extends typeof formData, K extends keyof T>(
        name: K,
        value: T[K],
    ) => {
        setFormData({
            ...formData,
            [name]: value,
        })
    }, [formData]);

    const {toastRes} = useToast()

    useEffect(() => {
        setValues({
            isNextDisabled: !!errors,
            async setNextRoomCreationTask() {
                if (!nextTask) return;
                setIsNextLoading(true);
                const discounts = Object.keys(formData)
                    .map((key) => ({
                        ...formData[key],
                        conditions: key,
                    }))
                    .filter(f => f.checked)
                    .map(({percent, conditions}) => ({
                        percent: percent / 100,
                        conditions: conditions,
                    }));
                const res = await updateUserRoom(roomId, {
                    discounts,
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                
                if (!res.ok) {
                    return toastRes(res);
                }
                router.push(nextTask.pathname)
            },
            setBackRoomCreationTask() {
                if (!backTask) return
                setIsBackLoading(true);
                router.push(backTask.pathname)
            }
        })
        return () => {
            onResetRoomCreation()
        }
    }, [
        errors,
        nextTask,
        toastRes,
        formData,
        roomId,
        router,
        onResetRoomCreation,
        setValues,
        backTask,
        setIsNextLoading,
        setIsBackLoading,
    ]);

    useEffect(() => {
        const discounts = room?.discounts ?? [];
        if (discounts.length > 0) {
            const data = discounts.reduce((acc: Partial<typeof initialFormData>, { percent, conditions }) => {
                const keys = Object.keys(initialFormData);
                if (keys.includes(conditions)) {
                    acc[conditions as keyof typeof initialFormData] = {
                        percent: percent * 100,
                        checked: true,
                    }; 
                }
                
                return acc;
            }, {});

            Object.keys(initialFormData).forEach((key) => {
                if (!data[key as keyof typeof data]) {
                    data[key as keyof typeof data] = {
                    ...initialFormData[key as keyof typeof data],
                    checked: false
                  };
                }
            });
            setFormData(data);
        }
    },[room])

    const checkboxProps = useCallback((name: keyof typeof formData, value: string,) => {
        return {
            value,
            radius: "sm",
            size: "lg",
            color: "secondary",
            className: "ml-auto",
            onValueChange: (checked) => {
                setFormValue(name, {
                    ...formData[name],
                    checked
                })
            },
            isSelected: formData[name].checked,
            onFocus: () => {
                setInputFocus(name)
            },
        } as CheckboxProps;
    },[formData, setFormValue]);

    const inputProps = useCallback((name: keyof typeof formData) => {
        return ({
            className: "font-semibold mx-1 sm:mx-2 text-lg w-[54px] min-w-[54px] h-fit bg-default-50",
            variant: "bordered",
            radius: "sm",
            classNames: {
                input: "p-0 w-full text-lg font-semibold text-right",
                inputWrapper: "px-1 flex items-center justify-center",
                base: "p-0",
            },
            value: formData[name].percent.toString(),
            onValueChange: (v) => {
                let percent = parseInt(v);
                if (!percent || percent < 0) {
                    percent = 0;
                } else if (percent > 99) {
                    return
                }
                setFormValue(name, {
                    ...formData[name],
                    percent
                })
            },
            onFocus: () => {
                setInputFocus(name)
            },
            endContent: <span className={"-ml-1 mr-0.5 pointer-events-none"}>%</span>,
            isDisabled: !formData[name].checked,
        }) as InputProps;
    },[formData, setFormValue])

    return (
        <div className={"max-w-[640px] w-full"}>
            <Motion
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
            >
                <Motion
                    as={"h1"}
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                    className='text-wrap text-title'
                >
                    {t("title")}
                </Motion>
                <Motion
                    as={"h3"}
                    initial="hidden"
                    animate="visible"
                    variants={slideUpItem}
                    className='text-description text-default-400 mt-1'
                >
                    {t("description")}
                </Motion>
            </Motion>
            <Motion
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
                className={"w-full mt-10 flex flex-col gap-y-5"}
            >
                <Motion
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                    className={'flex gap-x-3 justify-start items-center border-2 bg-default-100 px-2 py-5 sm:px-4 sm:py-7 rounded-lg'}
                >
                    <span
                        className={"px-1 sm:px-2 py-2 font-semibold mx-2 text-xl"}>{formData[Discount.NEW_USER].percent}%</span>
                    <div>
                        <span className={"block text-title-accent"}>
                            {d?.form.new_user.title}
                        </span>
                        <span className={"block text-description-accent text-default-500"}>
                            {d?.form.new_user.description}
                        </span>
                    </div>
                    <Checkbox
                        {...checkboxProps(Discount.NEW_USER, "NEW_USER")}
                    />
                </Motion>
                <Motion
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                    className={'flex gap-x-3 justify-start items-center border-2 bg-default-100 px-2 py-5 sm:px-4 sm:py-7 rounded-lg'}
                >
                    <Input
                        {...inputProps(Discount.WEEKLY)}
                    />
                    <div>
                        <span className={"block text-title-accent"}>
                            {d?.form.seven_nights.title}
                        </span>
                        <span className={"block text-description-accent text-default-500"}>
                            {d?.form.seven_nights.description}
                        </span>
                    </div>
                    <Checkbox
                        {...checkboxProps(Discount.WEEKLY, "WEEKLY")}
                    />
                </Motion>
                {errors?.[Discount.WEEKLY] && <Translate isTrans className='-mt-4'>
                    <span className='text-danger-400 text-sm'>{errors?.[Discount.WEEKLY]}</span>
                </Translate>}
                <Motion
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                    className={'flex gap-x-3 justify-start items-center border-2 bg-default-100 px-2 py-5 sm:px-4 sm:py-7 rounded-lg'}
                >
                    <Input
                        {...inputProps(Discount.MONTHLY)}
                    />
                    <div>
                        <span className={"block text-title-accent"}>
                            {d?.form.one_month.title}
                        </span>
                        <span className={"block text-description-accent text-default-500"}>
                            {d?.form.one_month.description}
                        </span>
                    </div>
                    <Checkbox
                         {...checkboxProps(Discount.MONTHLY, "MONTHLY")}
                    />
                </Motion>
                {errors?.[Discount.MONTHLY] && <Translate isTrans className='-mt-4'>
                    <span className='text-danger-400 text-sm'>{errors?.[Discount.MONTHLY]}</span>
                </Translate>}
            </Motion>
        </div>
    );
};

export default Page;