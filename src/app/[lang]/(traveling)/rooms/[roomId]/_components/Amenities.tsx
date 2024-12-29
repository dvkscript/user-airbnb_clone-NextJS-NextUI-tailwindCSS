"use client"
import Button from "@/components/Button";
import Image from "@/components/Common/Image";
import useDictionary from "@/hooks/useDictionary";
import { GetAmenityAndCountAll } from "@/services/amenity.service";
import { GetRoomDetail } from "@/services/room.service";
import { cn } from "@/utils/dom.util";
import React, { useMemo, useState } from "react"
import ModalAmenity from "./ModalAmenity";

interface AmenitiesProps {
    amenities: GetAmenityAndCountAll;
    roomAmenities: GetRoomDetail["amenities"];
}

const Amenities: React.FC<AmenitiesProps> = ({
    amenities,
    roomAmenities
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { count, rows } = useMemo(() => amenities, [amenities]);
    const data = useMemo(() => {
        return rows.map((a) => {
            if (!!roomAmenities.find((ra) => ra === a.id)) {
                return {
                    ...a,
                    isActive: true
                }
            }
            return {
                ...a,
                isActive: false
            }
        })
    }, [rows, roomAmenities])

    const { d } = useDictionary("rooms", d => d.amenities)
    return (
        <section id="amenities" className="flex flex-col gap-y-4 py-[inherit]">
            <h2 className="text-subtitle">
                {d?.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {
                    data.slice(0, 10).map((amenity, i) => (
                        <div
                            key={amenity.id}
                            className={cn(
                                i > 7 - 1 && "hidden md:block"
                            )}
                        >
                            <span className="align-middle mr-2 inline-block">
                                <Image
                                    src={amenity.url}
                                    alt={amenity.name}
                                    height={40}
                                    width={40}
                                    className="min-w-10 min-h-10 dark:invert"
                                    classNames={{
                                        img: ""
                                    }}
                                />
                            </span>
                            <span
                                className={cn(
                                    "inline-block",
                                    !amenity.isActive && "line-through"
                                )}
                            >{amenity.name}</span>
                        </div>
                    ))
                }
            </div>
            <div className="py-2 w-full">
                <Button
                    variant="bordered"
                    className="border border-default-800 font-medium text-base w-full md:w-fit"
                    radius="sm"
                    onPress={() => setIsOpen(true)}
                >
                    Hiển thị tất cả {count} tiện nghi
                </Button>
            </div>
            <ModalAmenity
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                amenities={data}
            />
        </section>
    );
};

export default Amenities;