import { useRouter } from 'next-nprogress-bar';
import React, { useEffect, useMemo } from 'react';
import { Button } from '@nextui-org/react';
import useDictionary from '@/hooks/useDictionary';
import NotFound from './NotFound';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

const Error: React.FC<ErrorProps> = ({
    error,
}) => {
    const route = useRouter();
    const msgStatus = useDictionary("message-status").p;
    const msgError = useDictionary("error").p;
    const msg = useMemo(() => msgStatus[error.message as keyof typeof msgStatus], [msgStatus, error]);


    useEffect(() => {
        console.error(error);
    }, [error, route]);

    if (error.message === "404") {
        return <NotFound />
    }

    return (
        <div className='flex flex-col items-center justify-center gap-y-3 p-5 h-full w-full'>
            <span className='text-5xl'>
                😔
            </span>
            <h1 className='font-bold text-4xl text-center'>
                {msgError.title}
            </h1>
            {
                !!msg ? (
                    <>
                        <h4 className='mt-2'>
                            {msg?.title}
                        </h4>
                        <h4 className='mt-2'>
                            {msg?.description}
                        </h4>
                    </>
                ) : (
                    <h4 className='mt-2'>
                        {error.message}
                    </h4>
                )
            }
            <Button
                onPress={
                    () => window.location.reload()
                }
                color='primary'
                type='button'
            >
                {msgError.buttons.try_again}
            </Button>
            <button
                type='button'
                onClick={() => {
                    route.back();
                }}
                className='underline'
            >
                {msgError.buttons.go_back}
            </button>
        </div>
    );
};

export default Error;