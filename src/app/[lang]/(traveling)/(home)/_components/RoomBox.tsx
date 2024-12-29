"use client"
import { Button, Card, CardBody, CardFooter } from "@nextui-org/react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react"
import SlideImage from "./SlideImage";
import { Heart } from "lucide-react";
import { cleanStr, cn, formatPrice } from "@/utils/dom.util";
import { GetRoomAndCountAll } from "@/services/room.service";
import Translate from "@/components/Common/Translate";
import useUserStore from "@/hooks/useUserStore";
import { profileSelector } from "@/hooks/selectors/userSelector";
import useModal from "@/hooks/useModal";
import { ModalMode } from "@/enum/modalMode";
import useSystemStore from "@/hooks/useSystemStore";
import { locationSelector } from "@/hooks/selectors/systemSelector";
import { wishlistAddOrRemoveRoom } from "@/services/user.service";
import { toast } from "sonner";
import Image from "@/components/Common/Image";
import useToast from "@/hooks/useToast";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import useUrl from "@/hooks/useUrl";
import { useParams } from "next/navigation";

interface RoomBoxProps {
    room: GetRoomAndCountAll["rows"][number];
    setIsOpenModal: (isOpen: RoomBoxProps["isOpenModal"]) => void;
    isOpenModal: boolean;
    roomSelected: GetRoomAndCountAll["rows"][number] | null;
    setRoomSelected: (roomSelected: RoomBoxProps["roomSelected"]) => void;
}

const RoomBox: React.FC<RoomBoxProps> = ({
    room,
    setIsOpenModal,
    setRoomSelected
}) => {

    const { profile } = useUserStore(profileSelector);
    const { onModal } = useModal();
    const { countries } = useSystemStore(locationSelector);
    const { toastRes } = useToast();
    const t = useDictionary<"common", Dictionary["common"]["modal"]["wishlists"]["toast"]>("common", d => d.modal.wishlists.toast).t;
    const [isFavorite, setIsFavorite] = useState(!!room.wishlists);
    const { search } = useUrl();
    const params = useParams()
    const href = useMemo(() => (`${params.lang}/rooms/${room.id}${search}`), [room, search, params])

    const title = useMemo(() => {
        if (!room.address) return "Title"
        const key = room.address?.country_code.toUpperCase() as keyof typeof countries;
        return [room.address?.province, countries[key]?.native].filter(a => a).join(", ")
    }, [countries, room?.address])

    const handleFavorite = useCallback(async () => {
        if (!profile) {
            return onModal({
                mode: ModalMode.AUTH_SIGN_IN,
            })
        }
        if (room.wishlists) {
            setIsFavorite(false);
            const res = await wishlistAddOrRemoveRoom(room.wishlists.id, {
                action: "remove",
                roomId: room.id
            });
            
            if (!res.ok) {
                return toastRes(res);
            }

            return toast(
                <div className="w-full flex items-center justify-start gap-x-3 text-base">
                    <Image
                        src={room.photos[0].url}
                        alt={room.title || ""}
                        width={40}
                        height={40}
                        className="rounded-lg object-cover"
                    />

                    <span
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{
                            __html: t("remove", `<b class="font-medium notranslate">${cleanStr(room.wishlists.name)}</b>`),
                        }}
                    />
                </div>
                , {
                    position: "bottom-left",
                    className: "p-2 rounded-xl w-80",
                    closeButton: false,
                }
            )
        };
        setRoomSelected(room);
        setIsOpenModal(true)
    }, [profile, room, setRoomSelected, setIsOpenModal, onModal, t, toastRes]);

    useEffect(() => {
        setIsFavorite(!!room.wishlists);
    }, [room]);

    return (
        <Card
            shadow="none"
            className="w-full relative"
            radius="sm"
            data-focus="false"
            data-focus-visible="false"
        >
            <Link
                href={href}
                className="absolute inset-0 z-10"
                target="_blank"
            />
            <CardBody className="px-0 pb-0 relative pt-[83.8%] h-full z-10">
                <div className="absolute inset-0 h-full w-full">
                    <SlideImage photos={room.photos} href={href} className="rounded-lg" />
                </div>
                <Button
                    onPress={handleFavorite}
                    variant="bordered"
                    isIconOnly
                    size="sm"
                    disableRipple
                    className="absolute top-3 right-3 border-none hover:scale-110 p-1 w-fit h-fit text-white"
                    data-focus="false"
                    data-focus-visible="false"
                >
                    <Heart
                        size={24}
                        strokeWidth={1.8}
                        className={cn(
                            isFavorite ? "fill-red-600" : "fill-neutral-800/50"
                        )}
                    />
                </Button>
            </CardBody>
            <CardFooter className="z-0 text-small justify-between flex-col items-start px-0 pt-2 pb-8">
                <Translate as={"b"} className="font-medium">
                    {title}
                </Translate>
                <p className="font-medium">
                    {formatPrice(room.original_price)} <Translate as={"span"} isTrans isExcLocaleSystem={false} className="font-normal">/ night</Translate>
                </p>
            </CardFooter>
        </Card>
    );
};

export default RoomBox;