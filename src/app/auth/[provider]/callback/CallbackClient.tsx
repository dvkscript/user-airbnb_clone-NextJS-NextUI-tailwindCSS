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
            (async () => {
                await window.opener?.postMessage({ type: "authentication", data }, window.location.origin);
            })();
            window.close();
        }

    }, [data]);
    return (
        <>
        </>
    )
}

export default CallbackClient