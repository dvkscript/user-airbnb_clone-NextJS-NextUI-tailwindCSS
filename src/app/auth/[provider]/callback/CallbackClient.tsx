"use client"
import React, { FC, useEffect } from 'react'

interface CallbackClientProps {
    data: any;
}
const CallbackClient: FC<CallbackClientProps> = ({
    data
}) => {

    useEffect(() => {
        if (data) {
            window.close();
        }

        return () => {
            if (data) {
                (async () => {
                    await window.opener?.postMessage({ type: "authentication", data }, window.location.origin);
                })();
            }
        }
    }, [data]);
    return (
        <>
        </>
    )
}

export default CallbackClient