"use client"
import Button from "@/components/Button";
import ImageEl from "@/components/Common/Image";
import Translate from "@/components/Common/Translate";
import { ModalMode } from "@/enum/modalMode";
import { profileSelector } from "@/hooks/selectors/userSelector";
import useDictionary from "@/hooks/useDictionary";
import useModal from "@/hooks/useModal";
import useToast from "@/hooks/useToast";
import useUrl from "@/hooks/useUrl";
import useUserStore from "@/hooks/useUserStore";
import { Dictionary } from "@/libs/dictionary.lib";
import { GetRoomDetail } from "@/services/room.service";
import { wishlistAddOrRemoveRoom } from "@/services/user.service";
import { cleanStr, cn } from "@/utils/dom.util";
import { Modal, ModalBody, ModalContent, ModalHeader, Spacer } from "@nextui-org/react";
import { ChevronLeft, Heart, Share } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner";

interface ModalPhotosProps {
    room: GetRoomDetail;
    setIsOpenModal: (isOpenModal: boolean) => void
}

type ImageLayouts = {
    type: "single_large" |
    "two_horizontal" |
    "two_vertical" |
    "two_horizontal_one_vertical";
    photos: (GetRoomDetail["photos"][number] & { orientation: "horizontal" | "vertical" })[]
}[]

const ModalPhotos: React.FC<ModalPhotosProps> = ({
    room,
    setIsOpenModal
}) => {
    const { searchParamsRef, searchParams } = useUrl();
    const isOpen = JSON.parse(searchParams.get("modalPhotos") === "true" ? "true" : "false");
    const router = useRouter();
    const { onModal } = useModal();
    const { profile } = useUserStore(profileSelector)
    const { t } = useDictionary<"common", Dictionary["common"]["buttons"]>("common", d => d.buttons);
    const toastMsg = useDictionary<"common", Dictionary["common"]["modal"]["wishlists"]["toast"]>("common", d => d.modal.wishlists.toast).t;
    const photos = useMemo(() => room.photos, [room]);
    const [imageLayouts, setImageLayouts] = useState<ImageLayouts>([]);
    const [isFavorite, setIsFavorite] = useState(!!room.wishlists);
    const { toastRes } = useToast();

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

    const handleSave = useCallback(async () => {
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
                    <ImageEl
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

    }, [onModal, profile, room.id, room.photos, room.title, room.wishlists, setIsOpenModal, toastMsg, toastRes])

    const handleClose = useCallback(() => {
        const q = new URLSearchParams(searchParamsRef.current);
        q.delete("modalPhotos");

        router.replace("?" + q.toString())
    }, [router, searchParamsRef]);

    const handleImageClick = useCallback((photoId: string) => {
        const search = new URLSearchParams(searchParamsRef.current);
        search.set("modalPhoto", photoId);
        router.push(`?${search.toString()}`)
    }, [searchParamsRef, router])

    useEffect(() => {
        const processPhotos = async () => {
            const photosWithAspectRatio = await Promise.all(
                photos.map(
                    (photo) =>
                        new Promise((resolve) => {
                            const img = new Image();
                            img.src = photo.url;
                            img.onload = () => {
                                const aspectRatio = img.naturalWidth / img.naturalHeight;
                                resolve({
                                    ...photo,
                                    orientation: aspectRatio < 1 ? "vertical" : "horizontal",
                                });
                            };
                        })
                )
            ) as ImageLayouts[number]["photos"];

            const layouts: ImageLayouts = [];
            let currentGroup: typeof photosWithAspectRatio = [];

            photosWithAspectRatio.forEach((photo, index) => {
                if (index === 0) {
                    layouts.push({
                        type: "single_large",
                        photos: [photo],
                    });
                } else {
                    currentGroup.push(photo);

                    if (currentGroup.length === 2 && currentGroup[0].orientation === currentGroup[1].orientation) {
                        layouts.push({
                            type: currentGroup[0].orientation === "vertical" ? "two_vertical" : "two_horizontal",
                            photos: currentGroup,
                        });
                        currentGroup = [];
                    } else if (currentGroup.length === 3) {
                        const verticalPhotos = currentGroup.filter((p) => p.orientation === "vertical");

                        if (verticalPhotos.length > 1) {
                            const singlePhoto = currentGroup.splice(
                                currentGroup[0].orientation === "horizontal" ? 0 : 1,
                                1
                            );
                            layouts.push({
                                type: "single_large",
                                photos: singlePhoto,
                            });
                            layouts.push({
                                type: "two_vertical",
                                photos: currentGroup,
                            });
                        } else {
                            const [verticalPhoto, ...horizontalPhotos] =
                                currentGroup[0].orientation === "vertical"
                                    ? currentGroup
                                    : [currentGroup[1], currentGroup[0], currentGroup[2]];

                            layouts.push({
                                type: "two_horizontal_one_vertical",
                                photos: [verticalPhoto, ...horizontalPhotos],
                            });
                        }
                        currentGroup = [];
                    }
                }
            });

            if (currentGroup.length > 0) {
                if (currentGroup.length === 1) {
                    layouts.push({
                        type: "single_large",
                        photos: currentGroup,
                    });
                } else if (currentGroup[0].orientation === currentGroup[1].orientation) {
                    layouts.push({
                        type: currentGroup[0].orientation === "vertical" ? "two_vertical" : "two_horizontal",
                        photos: currentGroup,
                    });
                }
            }
            setImageLayouts(layouts);
        };

        processPhotos();
    }, [photos]);

    useEffect(() => {
        setIsFavorite(!!room.wishlists);
    }, [room]);

    const GridItem = useCallback(({ item }: { item: ImageLayouts[number] }) => {

        if (item.type === "single_large") {
            return (
                <div
                    style={{
                        gridArea: "1 / 1",
                    }}
                >
                    <button
                        className="w-full h-full cursor-pointer"
                        type="button"
                        onClick={() => handleImageClick(item.photos[0].id)}
                    >
                        <div className={cn(
                            "relative h-full group",
                            item.photos[0].orientation === "vertical" ? "pt-[133%]" : "pt-[67%]"
                        )}>
                            <ImageEl
                                src={item.photos[0]?.url}
                                alt={item.photos[0].id}
                                classNames={{
                                    wrapper: "absolute inset-0 !max-w-full",
                                    img: "object-cover h-full w-full"
                                }}
                                radius="none"
                            />
                            <div className="absolute inset-0 bg-black/20 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity" />
                        </div>
                    </button>
                </div>
            )
        };

        if (item.type === "two_horizontal_one_vertical") {
            return (
                <div
                    style={{
                        display: "grid",
                        gridAutoColumns: "1fr",
                        gridAutoRows: "1fr",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px"
                    }}
                >
                    {
                        item.photos.map((photo, index) => (
                            <div
                                style={{
                                    gridArea: photo.orientation === "horizontal" ? `${index} / 1` : "1 / 2 / span 2",
                                }}
                                key={photo.id}
                            >
                                <button
                                    className="w-full h-full cursor-pointer"
                                    type="button"
                                    onClick={() => handleImageClick(photo.id)}
                                >
                                    <div className="relative pt-[67%] h-full group">
                                        <ImageEl
                                            src={photo.url}
                                            alt={photo.id}
                                            classNames={{
                                                wrapper: "absolute inset-0 !max-w-full",
                                                img: "object-cover h-full w-full"
                                            }}
                                            radius="none"
                                        />
                                        <div className="absolute inset-0 bg-black/20 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            </div>
                        ))
                    }
                </div>
            )
        }

        return (
            <div
                style={{
                    display: "grid",
                    gridAutoColumns: "1fr",
                    gridAutoRows: "1fr",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px"
                }}
            >
                {item.photos.map((photo, index) => (
                    <div
                        style={{
                            gridArea: `1 / ${index + 1}${photo.orientation === "vertical" ? `` : ""}`
                        }}
                        key={photo.id}
                    >
                        <button
                            className="w-full h-full cursor-pointer"
                            type="button"
                            onClick={() => handleImageClick(photo.id)}
                        >
                            <div
                                className={cn(
                                    "relative h-full w-full group",
                                    photo.orientation === "vertical" ? "pt-[133%] " : "pt-[67%]"
                                )}
                            >
                                <ImageEl
                                    src={photo.url}
                                    alt={photo.id}
                                    width={"100%"}
                                    classNames={{
                                        wrapper: "absolute inset-0 !max-w-full",
                                        img: "object-cover h-full w-full"
                                    }}
                                    radius="none"
                                />
                                <div className="absolute inset-0 bg-black/20 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        );
    }, [handleImageClick])

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
                <ModalContent className='h-auto'>
                    <ModalHeader>
                        <Button
                            isIconOnly
                            onPress={handleClose}
                            variant="light"
                            radius="full"
                        >
                            <ChevronLeft strokeWidth={2} size={20} />
                        </Button>
                        <Button
                            variant="light"
                            className="ml-auto md:hidden"
                            disableRipple
                            onPress={handleShare}
                            isIconOnly
                            radius="full"
                        >
                            <Share size={16} strokeWidth={2.2} />
                        </Button>
                        <Button
                            variant="light"
                            className="ml-auto hidden md:inline-flex"
                            disableRipple
                            onPress={handleShare}
                        >
                            <Share size={16} strokeWidth={2.2} />
                            <span className="hidden md:inline-block underline">
                                {t("Share")}
                            </span>
                        </Button>
                        <Button
                            variant="light"
                            disableRipple
                            onPress={handleSave}
                            className="hidden md:inline-flex"
                        >
                            <Heart
                                size={16}
                                strokeWidth={2.2}
                                className={cn(
                                    isFavorite ? "fill-red-500 text-red-500" : ""
                                )}
                            />
                            <span className="hidden md:inline-block md:ml-2 underline">
                                {t("Save")}
                            </span>
                        </Button>
                    </ModalHeader>
                    <ModalBody className="p-0 md:p-6">
                        <div className="max-w-[900px] mx-auto w-full">
                            <div className="grid grid-cols-1 gap-y-2">
                                {
                                    imageLayouts.map((item, i) => (
                                        <div
                                            style={{
                                                display: "grid",
                                                gridArea: `${i + 1} / 1`,
                                            }}
                                            key={i}
                                        >
                                            <GridItem item={item} />
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <Spacer y={8} />
                    </ModalBody>
                </ModalContent>
            </Translate>
        </Modal>
    );
};

export default ModalPhotos;