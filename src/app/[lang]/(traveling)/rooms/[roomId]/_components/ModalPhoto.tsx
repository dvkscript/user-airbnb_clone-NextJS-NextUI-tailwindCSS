"use client"
import Button from "@/components/Button";
import Translate from "@/components/Common/Translate";
import useDictionary from "@/hooks/useDictionary";
import useUrl from "@/hooks/useUrl";
import { GetRoomDetail } from "@/services/room.service";
import { Modal, ModalBody, ModalContent, ModalHeader, Spacer } from "@nextui-org/react";
import { ChevronLeft, ChevronRight, Heart, Share, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "@/components/Common/Image";
import { toast } from "sonner";
import { cleanStr, cn } from "@/utils/dom.util";
import useToast from "@/hooks/useToast";
import useModal from "@/hooks/useModal";
import { ModalMode } from "@/enum/modalMode";
import useUserStore from "@/hooks/useUserStore";
import { profileSelector } from "@/hooks/selectors/userSelector";
import { wishlistAddOrRemoveRoom } from "@/services/user.service";

const variants = {
    enter: (direction: number) => {
        return {
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        };
    },
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => {
        return {
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        };
    }
};

const swipeConfidenceThreshold = 10000;

const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

interface ModalPhotoProps {
    room: GetRoomDetail;
    setIsOpenModal: (isOpenModal: boolean) => void
}

const ModalPhoto: React.FC<ModalPhotoProps> = ({
    room,
    setIsOpenModal
}) => {
    const [isFavorite, setIsFavorite] = useState(!!room.wishlists);
    const { toastRes } = useToast();
    const { profile } = useUserStore(profileSelector)
    const { onModal } = useModal();
    const { searchParamsRef, searchParams } = useUrl();
    const photoId = searchParams.get("modalPhoto");
    const isOpen = useMemo(() => !!photoId, [photoId]);
    const photoIds = useMemo(() => (room.photos.map((p) => p.id)), [room.photos])
    const router = useRouter();
    const { t } = useDictionary("common", d => d.buttons);
    const toastMsg = useDictionary("common", d => d.modal.wishlists.toast).t;
    const [direction, setDirection] = useState(0);
    const photos = useMemo(() => (room.photos || []), [room]);
    const photoIndex = useMemo(() => {
        const index = photoIds.findIndex(p => p === photoId);
        if (index === -1) {
            return direction > 0 ? 0 : photoIds.length - 1
        };
        return index;
    }, [photoId, photoIds, direction]);

    const handleShare = useCallback(async () => {
        try {
            await navigator.share({
                title: room.title!,
                text: room.description!,
                url: `${window.location.origin}/rooms/${room.id}`,
            })
        } catch (error: any) {
            toast.error(error.message)
        }
    }, [room]);

    const handleFavorite = useCallback(async () => {
        if (!profile) {
            return onModal({
                mode: ModalMode.AUTH_SIGN_IN
            })
        };
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
                            __html: toastMsg("remove", `<b class="font-medium notranslate">${cleanStr(room.wishlists.name)}</b>`),
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
        setIsOpenModal(true)
    }, [profile, room.wishlists, room.id, room.photos, room.title, setIsOpenModal, onModal, toastMsg, toastRes])

    const paginate = useCallback((newDirection: number) => {
        setDirection(newDirection);
        const search = new URLSearchParams(searchParamsRef.current);
        const newIndex = photoIndex + newDirection;

        search.set("modalPhoto", photoIds[newIndex] || (newDirection > 0 ? photoIds[0] : photoIds[photoIds.length - 1]));
        router.replace(`?${search.toString()}`)
    }, [photoIndex, router, searchParamsRef, photoIds]);

    const handleClose = useCallback(() => {
        const q = new URLSearchParams(searchParamsRef.current);
        q.delete("modalPhoto");

        router.replace("?" + q.toString())
    }, [router, searchParamsRef]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;
        switch (e.key) {
            case "ArrowRight":
                paginate(1);
                break;
            case "ArrowLeft":
                paginate(-1);
                break;
            default:
                break;
        }
    }, [paginate, isOpen])

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [handleKeyDown]);

    useEffect(() => {
        setIsFavorite(!!room.wishlists);
    }, [room]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            classNames={{
                wrapper: "overflow-hidden",
                body: "pt-6 px-6 pb-6",
                closeButton: "hover:bg-white/5 active:bg-white/10",
                base: "dark:bg-default-100"
            }}
            scrollBehavior="inside"
            size='full'
            hideCloseButton
        >
            <Translate isExcLocaleSystem isTrans>
                <ModalContent className='bg-black text-white h-full relative'>
                    <ModalHeader
                        className="lg:mt-10 lg:mx-10 md:mx-5 md:mt-5 md:mb-5 py-3 px-2 items-center flex-shrink-0"
                    >
                        <div className="flex-1 text-inherit">
                            <Button
                                radius="sm"
                                variant="light"
                                className="text-inherit text-sm font-medium hidden md:inline-flex"
                                startContent={<X size={20} />}
                                disableRipple
                                onPress={handleClose}
                            >
                                {t("Close")}
                            </Button>
                            <Button
                                className="text-inherit text-sm font-medium md:hidden"
                                onPress={handleClose}
                                isIconOnly
                                variant="light"
                                disableRipple
                                radius="full"
                                size="lg"
                            >
                                <ChevronLeft />
                            </Button>
                        </div>
                        <div className="text-inherit">
                            <span className="text-inherit text-base">
                                {photoIndex + 1} / {room.photos.length}
                            </span>
                        </div>
                        <div className="flex-1 text-inherit flex justify-end items-center gap-x-3">
                            <Button
                                radius="full"
                                variant="light"
                                className="text-inherit text-sm font-medium"
                                startContent={<Share size={20} />}
                                disableRipple
                                isIconOnly
                                onPress={handleShare}
                            />
                            <Button
                                radius="full"
                                variant="light"
                                className="text-inherit text-sm font-medium hidden md:inline-flex"
                                startContent={<Heart
                                    size={20}
                                    className={cn(
                                        isFavorite ? "fill-red-500 text-red-500" : ""
                                    )}
                                />}
                                disableRipple
                                isIconOnly
                                onPress={handleFavorite}
                            />
                        </div>
                    </ModalHeader>
                    <ModalBody className="p-0 md:mt-8 h-full w-full md:px-24 lg:px-40 bg-inherit">
                        <div className="w-full h-full overflow-hidden">
                            <div className="max-w-full h-full w-full relative flex justify-center items-center">
                                <AnimatePresence initial={false} custom={direction}>
                                    <motion.div
                                        key={photos[photoIndex].id}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 }
                                        }}
                                        drag="x"
                                        className="h-full max-h-full absolute w-fit cursor-grab active:cursor-grabbing"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={1}
                                        onDragEnd={(e, { offset, velocity }) => {
                                            const swipe = swipePower(offset.x, velocity.x);

                                            if (swipe < -swipeConfidenceThreshold) {
                                                paginate(1);
                                            } else if (swipe > swipeConfidenceThreshold) {
                                                paginate(-1);
                                            }
                                        }}
                                    >
                                        <Image
                                            src={photos[photoIndex]?.url}
                                            alt="test"
                                            onDragStart={(e) => {
                                                e.preventDefault()
                                            }}
                                            classNames={{
                                                wrapper: "w-full h-full max-h-full max-w-full",
                                                img: "h-full max-h-full w-fit max-w-full object-contain"
                                            }}
                                            radius="none"
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                        <Button
                            className="absolute text-inherit top-1/2 -translate-y-1/2 left-[2%] z-10 bg-inherit hidden md:inline-flex"
                            onPress={() => paginate(-1)}
                            isIconOnly
                            variant="bordered"
                            disableRipple
                            radius="full"
                            size="lg"
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            className="absolute text-inherit top-1/2 -translate-y-1/2 right-[2%] z-10 bg-inherit hidden md:inline-flex"
                            onPress={() => paginate(1)}
                            isIconOnly
                            variant="bordered"
                            disableRipple
                            radius="full"
                            size="lg"
                        >
                            <ChevronRight />
                        </Button>
                        <Spacer y={8} />
                    </ModalBody>
                </ModalContent>
            </Translate>
        </Modal>
    );
};

export default ModalPhoto;