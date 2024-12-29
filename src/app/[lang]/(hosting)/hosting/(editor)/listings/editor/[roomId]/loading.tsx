import LoaderPulse from "@/components/Loader/LoaderPulse";
import React from "react"

const Loading = ({ }) => {
    return (
        <div className="w-full h-full min-h-full grid content-center">
            <LoaderPulse className="w-fit mx-auto" />
        </div>
    );
};

export default Loading;