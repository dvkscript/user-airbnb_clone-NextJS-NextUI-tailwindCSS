"use client"
import Button from "@/components/Button";
import Image from "@/components/Common/Image";
import { Dictionary } from "@/libs/dictionary.lib";
import { useRouter } from "next-nprogress-bar";
import React from "react"

interface NoDataProps {
    msg: Dictionary["hosting"]["listings"]["no-data"]
}

const NoData: React.FC<NoDataProps> = ({
    msg
}) => {
    const router = useRouter();

    return (
        <div className="flex flex-col justify-center items-center gap-y-2">
            <Image
                src={"/images/hosting/listings/no-data.jpg"}
                alt="no data"
                radius="lg"
                className="max-w-[21.5rem] w-full object-cover"
            />
            <span className="font-medium">
                {msg.title}
            </span>
            <span className="text-default-500">
                {msg.description}
            </span>
            <Button
                variant="bordered"
                className="mt-4 font-medium border border-default-800"
                size="lg"
                onPress={() => {
                    router.push("/become-a-host")
                }}
            >
                {msg.button}
            </Button>
        </div>
    );
};

export default NoData;