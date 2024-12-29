"use client"
import Button from "@/components/Button";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import { Dot, Search } from "lucide-react";
import React from "react"

const HeaderSearchModal = ({ }) => {

    const { t } = useDictionary<"common", Dictionary["common"]["header"]["search"]>("common", (d) => d.header.search);


    return (
        <>
            <Button
                fullWidth
                size="lg"
                className="h-fit py-[7px] border bg-default-50 shadow-md justify-start text-left gap-x-4 max-w-full"
                variant="shadow"
                radius="full"
                disableRipple
                data-pressed="false"
                startContent={<Search size={20} className="flex-shrink-0" strokeWidth={3} />}
            >
                <div className="max-w-full">
                    <span className="block text-sm font-medium">
                        {t("where_to")}
                    </span>
                    <div className="text-accent leading-3 font-normal text-xs flex justify-start items-center mr-8">
                        <span className="truncate">
                            {t("anywhere")}
                        </span>
                        <Dot size={18} />
                        <span className="truncate">
                            {t("any week")}
                        </span>
                        <Dot size={18} />
                        <span className="truncate">
                            {t("add guests")}
                        </span>
                    </div>
                </div>
            </Button>
        </>
    );
};

export default HeaderSearchModal;