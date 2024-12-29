"use client"
import Button from '@/components/Button';
import { roomCreationSelector } from '@/hooks/selectors/roomSelector';
import useDictionary from '@/hooks/useDictionary';
import useRoomStore from '@/hooks/useRoomStore';
import useUrl from '@/hooks/useUrl';
import { Dictionary } from '@/libs/dictionary.lib';
import { cn } from '@/utils/dom.util';
import { Progress, ProgressProps } from '@nextui-org/react';
import { useParams } from 'next/navigation';
import React, { useCallback } from 'react';

const Default = ({ }) => {
    const {
        isBackDisabled,
        isBackLoading,
        setBackRoomCreationTask,
        setNextRoomCreationTask,
        isNextDisabled,
        isNextLoading,
        roomCreationPathnames: { tasks, currentTask }
    } = useRoomStore(roomCreationSelector);
    const { t } = useDictionary<"become-a-host", Dictionary["become-a-host"]["buttons"]>("become-a-host", d => d.buttons);
    const { pathnames } = useUrl();
    const { roomId } = useParams();

    const progressValue = useCallback((step: number) => {
        if (!roomId || !currentTask) {
            return 0;
        }

        const stepCurrents = tasks.filter(s => s.step === step);

        if (stepCurrents.length === 0) {
            return 0;
        }

        if (step < currentTask.step) return 100;

        if (step !== currentTask.step) return 0;

        return ((currentTask.task - 1) / stepCurrents.length) * 100;
    }, [currentTask, tasks, roomId]);

    const progressProps = (value: number): ProgressProps => {
        return ({
            classNames: {
                track: "rounded-none",
                indicator: "rounded-none dark:bg-white bg-black",
            },
            className: "max-w-full bg-inherit h-[6px] top-[50%]",
            value: progressValue(value),
        })
    }

    return (
        <footer className='w-full z-1 max-w-full flex flex-col'>
            <div className='flex gap-x-2'>
                <Progress
                    aria-label="Downloading..."
                    {...progressProps(1)}
                />
                <Progress
                    aria-label="Downloading..."
                    {...progressProps(2)}
                />
                <Progress
                    aria-label="Downloading..."
                    {...progressProps(3)}
                />
            </div>
            <div className='flex justify-end items-center max-w-full px-3 sm:px-10 h-16 sm:h-20'>
                {
                    !pathnames.includes("overview") && (
                        <Button
                            size='lg'
                            className='text-default-900 underline bg-inherit mr-auto text-sm sm:text-base font-medium'
                            onPress={setBackRoomCreationTask}
                            isDisabled={isBackDisabled}
                            isLoading={isBackLoading}
                            loaderProps={{
                                color: undefined
                            }}
                        >
                            {
                                !isBackLoading && t("back")
                            }
                        </Button>
                    )
                }
                {
                    pathnames.includes("overview") ? (
                        <Button
                            size='lg'
                            className='rounded-lg w-full md:w-auto text-sm sm:text-base font-medium'
                            onPress={setNextRoomCreationTask}
                            isDisabled={isNextLoading}
                            color='primary'
                            isLoading={isNextLoading}
                        >
                            {
                                !isNextLoading && t("get started")
                            }
                        </Button>
                    ) : (
                        <Button
                            size='lg'
                            className={cn(
                                'rounded-lg text-sm sm:text-base font-medium',
                                !!(isNextLoading || isNextDisabled) && "bg-default-400"
                            )}
                            onPress={setNextRoomCreationTask}
                            isDisabled={isNextDisabled}
                            color='secondary'
                            isLoading={isNextLoading}
                        >
                            {
                                !isNextLoading && t("next")
                            }
                        </Button>
                    )
                }
            </div>
        </footer>
    );
};

export default Default;