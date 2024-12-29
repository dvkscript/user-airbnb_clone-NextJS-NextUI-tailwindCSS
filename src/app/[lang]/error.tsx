'use client';

import Error from "@/components/Common/Error";

export default function ErrorMain({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-y-3">
            <Error
                error={error}
                reset={reset}
            />
        </div>
    );
}