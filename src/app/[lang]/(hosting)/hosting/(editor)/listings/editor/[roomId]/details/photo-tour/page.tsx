
"use client";
import Button from "@/components/Button";
import Image from "@/components/Common/Image";
import DndDragOverlay from "@/components/Dnd/DndDragOverlay";
import DndItem from "@/components/Dnd/DndItem";
import DndProvider from "@/components/Dnd/DndProvider";
import DndSortableItem from "@/components/Dnd/DndSortableItem";
import DndWrap from "@/components/Dnd/DndWrap";
import { roomEditorSelector } from "@/hooks/selectors/roomSelector";
import useDictionary from "@/hooks/useDictionary";
import useRoomStore from "@/hooks/useRoomStore";
import { Dictionary } from "@/libs/dictionary.lib";
import { GetUserRoom, updateUserRoom } from "@/services/user.service";
import { cn } from "@/utils/dom.util";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ArrowLeft, ImageIcon, Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react"
import PhotoAction from "./_components/PhotoAction";
import ModalUpload from "@/components/Modal/ModalUpload";
import { deletePhoto } from "@/services/photo.service";
import useToast from "@/hooks/useToast";
import { useRouter } from "next-nprogress-bar";
import { ExternalToast, toast } from "sonner";

interface PageProps {
    params: {
        roomId: string;
        lang: string
    }
}

type Photo = GetUserRoom["photos"][number];

const PhotoEl = ({ item }: { item: Photo }) => {

    return (
        <>
            <Image
                src={item.url}
                alt={"room-photo" + item.position}
                className={"rounded-inherit"}
                classNames={{
                    wrapper: "w-full h-full !max-w-full min-h-[inherit]",
                    img: "w-full h-full min-h-[inherit]",
                }}
            />
        </>
    )
}
const requiredPhotoCount = 5;

const Page: React.FC<PageProps> = ({
    params: {
        roomId,
        lang
    }
}) => {
    const { d } = useDictionary<"hosting", Dictionary["hosting"]["listings"]["editor"]["photo-tour"]>("hosting", d => d.listings.editor["photo-tour"]);
    const { room } = useRoomStore(roomEditorSelector);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [dragPhoto, setDragPhoto] = useState<Photo | null>(null);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const { toastRes } = useToast();
    const router = useRouter();

    const handleOnCloseModal = useCallback(() => {
        setIsOpenModal(false);
    }, []);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const id = event.active?.id as string;
        const data = photos.find((i) => i.id === id);
        if (!data) return;
        setDragPhoto(data);
    }, [photos]);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = photos.findIndex((i) => i.id === active.id);
            const newIndex = photos.findIndex((i) => i.id === over?.id);
            const newPhotos = arrayMove(photos, oldIndex, newIndex).map((d, i) => ({ ...d, position: i }));
            setPhotos(newPhotos);
            const toastOptions = {
                position: "top-center"
            } as ExternalToast;
            const toastId = toast.loading("Loading...", toastOptions);
            const res = await updateUserRoom(roomId, {
                photos: newPhotos
            });
            toast.dismiss(toastId);
            toastRes(res, toastOptions as any);
        }

        setDragPhoto(null);
    }, [photos, roomId, toastRes]);

    const handleDragCancel = useCallback(() => {
        setDragPhoto(null);
    }, []);

    useEffect(() => {
        if (room?.photos) {
            setPhotos(room?.photos)
        } else {
            setPhotos([])
        }
    }, [room]);

    return (
        <>
            <div className="2xl:w-[53rem] mx-10 2xl:mx-auto pb-40">
                <div className="mt-5 lg:mt-11 mb-5 flex justify-start items-center flex-col-reverse lg:flex-row gap-y-3 lg:gap-y-0">
                    <h2 className="text-title text-left w-full">
                        {d?.title}
                    </h2>
                    <div className="ml-0 lg:ml-auto w-full lg:w-auto flex gap-x-2">
                        <Button
                            isIconOnly
                            variant="flat"
                            radius="full"
                            className="mr-auto flex lg:hidden bg-default-100 hover:bg-default-200 dark:bg-default-200 dark:hover:bg-default-300"
                            onPress={() => {
                                router.push(`/${lang}/hosting/listings/editor/${roomId}/details`)
                            }}
                            disableRipple
                        >
                            <ArrowLeft />
                        </Button>
                        <Button
                            isIconOnly
                            variant="flat"
                            radius="full"
                            disableRipple
                            onPress={() => setIsOpenModal(true)}
                            className="bg-default-100 hover:bg-default-200 dark:bg-default-200 dark:hover:bg-default-300"
                        >
                            <Plus />
                        </Button>
                    </div>
                </div>
                <div className="w-full mx-auto text-left text-base text-accent mb-12">
                    <p className="max-w-[28.25rem]">
                        {d?.description}
                    </p>
                </div>
                <div className="w-full mx-auto">
                    {
                        photos.length === 0 ? (
                            <div
                                className={"bg-[#F7F7F7] rounded-lg w-full min-h-[500px] h-full flex flex-col justify-center items-center border-2 border-dashed"}
                            >

                                <Image
                                    src={"/images/become-a-host/photos/camera.avif"}
                                    alt={d?.title}
                                    height={182}
                                    width={182}
                                />
                                <Button type={"button"} variant={"bordered"} radius={"sm"} >
                                    {/* {d?.buttons.add_photo} */}
                                </Button>
                            </div>
                        ) : (
                            <DndProvider
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDragCancel={handleDragCancel}
                            >
                                <DndWrap
                                    items={photos}
                                    className={"sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 sm:gap-3"}
                                >
                                    {photos.map((item, i) => (
                                        <DndSortableItem
                                            key={item.id}
                                            className={cn(
                                                "w-full rounded-xl h-auto relative min-h-[228px] sm:h-[228px]",
                                                i % 3 === 0 ? "sm:row-span-2 sm:col-span-2 lg:row-span-1 lg:col-span-1 xl:row-span-2 xl:col-span-2 xl:h-[466px] sm:h-[350px] md:h-[400px] lg:h-auto" : ""
                                            )}
                                            data={item}
                                        >
                                            <PhotoEl item={item} />
                                            <PhotoAction
                                                photo={item}
                                                index={i}
                                                photos={photos}
                                                setPhotos={setPhotos}
                                            />
                                        </DndSortableItem>
                                    ))}
                                    {
                                        Array.from({ length: photos.length < requiredPhotoCount ? requiredPhotoCount - photos.length : 1 }).map((_, i, arr) => (
                                            <Button
                                                type={"button"}
                                                variant={"bordered"}
                                                key={i}
                                                fullWidth
                                                className={cn(
                                                    "flex-col text-default-600 font-semibold rounded-xl",
                                                    "border-2 border-dotted hover:border-solid hover:border-default-500",
                                                    "min-h-[228px] sm:h-[228px]",
                                                    (i + 1) % 3 === 0 ? "sm:row-span-2 sm:col-span-2 lg:row-span-1 lg:col-span-1 xl:row-span-2 xl:col-span-2 xl:h-[466px] sm:h-[350px] md:h-[400px] lg:h-auto" : ""
                                                )}
                                                onPress={() => setIsOpenModal(true)}
                                            >
                                                {
                                                    i === arr.length - 1 ? (
                                                        <>
                                                            <Plus size={50} />
                                                            <span>Add More</span>
                                                        </>
                                                    ) : (
                                                        <ImageIcon
                                                            size={40}
                                                            strokeWidth={1.5}
                                                        />
                                                    )
                                                }

                                            </Button>
                                        ))
                                    }
                                </DndWrap>
                                <DndDragOverlay dragData={dragPhoto}>
                                    <DndItem isDragging className={cn(
                                        "rounded-xl min-h-[228px] sm:h-[228px]",
                                        (dragPhoto?.position || 0) % 3 === 0 ? "sm:row-span-2 sm:col-span-2 lg:row-span-1 lg:col-span-1 xl:row-span-2 xl:col-span-2 xl:h-[466px] sm:h-[350px] md:h-[400px] lg:h-auto" : ""
                                    )}>
                                        <PhotoEl item={dragPhoto!} />
                                    </DndItem>
                                </DndDragOverlay>
                            </DndProvider>
                        )
                    }
                </div>
            </div>
            <ModalUpload
                isOpen={isOpenModal}
                fileName={"rooms"}
                onClose={handleOnCloseModal}
                onUpload={async (result) => {
                    if (result.ok && result.data) {
                        const photos = result.data.map(p => ({
                            id: p.id,
                        }));

                        const updateRoom = await updateUserRoom(roomId, {
                            photos
                        });

                        if (!updateRoom.ok) {
                            const photoIds = result.data.map((p) => p.id);
                            deletePhoto(photoIds);
                            toastRes(updateRoom);
                        } else {
                            handleOnCloseModal()
                        }
                    }
                }}
            />
        </>
    );
};

export default Page;