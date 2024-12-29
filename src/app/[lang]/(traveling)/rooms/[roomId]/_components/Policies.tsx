"use client"
import useDictionary from "@/hooks/useDictionary";
import { Divider } from "@nextui-org/react";
import React from "react"

const Policies = ({ }) => {
    const { d } = useDictionary("rooms", d => d.policies);

    const GridItem = ({
        name,
        description
    }: {
        name?: string,
        description?: string
    }) => {
        return (
            <div className="py-[inherit]">
                <h3 className="font-medium">
                    {name}
                </h3>
                <div>
                    <p className="text-accent text-sm lg:text-base">
                        {description}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <section className="py-[inherit]">
            <h2 className="text-subtitle pb-6 hidden lg:block">
                {d?.title}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 py-6 -my-6 gap-x-5">
                <GridItem
                    name={d?.subtitles.houseRules}
                    description="Đi chơi mút chỉ lúc nào về cũng được, không phải rén"
                />
                <Divider className="lg:hidden" />
                <GridItem
                    name={d?.subtitles.safetyAndProperty}
                    description="Chộm cắp liên tọi không ngày nào yên bình"
                />
                <Divider className="lg:hidden" />
                <GridItem
                    name={d?.subtitles.cancellationPolicy}
                    description="Hủy thoải mái Admin bảo kê :v"
                />
            </div>
        </section>
    );
};

export default Policies;