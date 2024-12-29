"use client"
import Image from "@/components/Common/Image";
import Translate from "@/components/Common/Translate";
import BreakpointConfig from "@/configs/breakpoints.config";
import { Amenity } from "@/enum/room";
import useDictionary from "@/hooks/useDictionary";
import useWindowEvent from "@/hooks/useWindowEvent";
import { GetAmenityAndCountAll } from "@/services/amenity.service";
import { cn } from "@/utils/dom.util";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import React, { useCallback, useMemo } from "react"

interface ModalAmenityProps {
    isOpen: boolean;
    setIsOpen: (isOpen: ModalAmenityProps["isOpen"]) => void;
    amenities: (GetAmenityAndCountAll["rows"][number] & { isActive: boolean })[]
}

const ModalAmenity: React.FC<ModalAmenityProps> = ({
    isOpen,
    setIsOpen,
    amenities
}) => {
    const { screen } = useWindowEvent();
    const { t } = useDictionary("rooms", d => d.amenities)
    const data = useMemo(() => {
        return amenities.reduce<Record<string, any>>((acc, amenity) => {
            if (!acc[amenity.category]) {
                acc[amenity.category] = [];
            }
            acc[amenity.category].push(amenity);
            return acc;
        }, {})
    }, [amenities])

    const handleClose = useCallback(() => {
        setIsOpen(false)
    }, [setIsOpen]);

    const Item = ({ amenity, title }: { amenity: ModalAmenityProps["amenities"], title: string }) => {

        return (
            <div>
                <h2 className="text-lg font-medium py-4">
                    {title}
                </h2>
                <Translate
                    isTrans
                    isExcLocaleSystem={false}
                    className="flex flex-col"
                >
                    {amenity.map((a) => (
                        <div
                            key={a.id}
                            className="flex justify-start items-center gap-x-3 border-b-1.5 py-4"
                        >
                            <Image
                                src={a.url}
                                alt={a.name}
                                height={40}
                                width={40}
                                className="min-w-10 min-h-10"
                                classNames={{
                                    wrapper: "inline-block",
                                    img: "dark:invert"
                                }}
                            />
                            <span
                                className={cn(
                                    "inline align-middle",
                                    !a.isActive && "line-through"
                                )}
                            >
                                {a.name}
                            </span>
                        </div>
                    ))}
                </Translate>
            </div>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            classNames={{
                wrapper: "overflow-hidden",
                body: "pt-6 px-6 pb-6",
                closeButton: "hover:bg-white/5 active:bg-white/10 top-8 -translate-y-1/2 right-3",
                base: "dark:bg-default-100"
            }}
            scrollBehavior="inside"
            size={(screen && screen?.minWidth > BreakpointConfig.md.minWidth) ? "3xl" : "full"}
        >
            <Translate isExcLocaleSystem isTrans>
                <ModalContent>
                    <ModalHeader className="py-5 text-xl">
                        <h1>
                            Nơi này có những gì cho bạn
                        </h1>
                    </ModalHeader>
                    <ModalBody className="pt-0">
                        <Item
                            amenity={data[Amenity.CATEGORY_STANDOUT]}
                            title={t(Amenity.CATEGORY_STANDOUT)}
                        />
                        <Item
                            amenity={data[Amenity.CATEGORY_FAVORITE]}
                            title={t(Amenity.CATEGORY_FAVORITE)}
                        />
                        <Item
                            amenity={data[Amenity.CATEGORY_SAFETY]}
                            title={t(Amenity.CATEGORY_SAFETY)}
                        />
                    </ModalBody>
                </ModalContent>
            </Translate>
        </Modal>
    );
};

export default ModalAmenity;