"use client"
import React, { Key, useCallback, useEffect, useState } from 'react';
import { slideUpContainer, slideUpItem } from "@/animations/slideUp.animation";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import Motion from "@/components/Common/Motion";
import Image from "@/components/Common/Image";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownItemProps,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/react";
import ModalUpload from "@/components/Modal/ModalUpload";
import { GetUserRoom, updateUserRoom } from "@/services/user.service";
import useToast from "@/hooks/useToast";
import { roomCreationSelector } from "@/hooks/selectors/roomSelector";
import useRoomStore from "@/hooks/useRoomStore";
import { deletePhoto } from "@/services/photo.service";
import { cn } from "@/utils/dom.util";
import DndItem from "@/components/Dnd/DndItem";
import DndWrap from "@/components/Dnd/DndWrap";
import DndSortableItem from "@/components/Dnd/DndSortableItem";
import DndProvider from "@/components/Dnd/DndProvider";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import DndDragOverlay from "@/components/Dnd/DndDragOverlay";
import { Ellipsis, Image as ImageIcon, Plus } from "lucide-react"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RoomStatus } from '@/enum/room';
import Translate from '@/components/Common/Translate';

interface PhotoClientProps {
    roomId: string
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
                    wrapper: "w-full h-full !max-w-full",
                    img: "w-full h-full",
                }}
            />
        </>
    )
}

const PhotoClient: React.FC<PhotoClientProps> = ({
    roomId
}) => {
    const {
        t,
        d
    } = useDictionary<"become-a-host", Dictionary["become-a-host"]["photos"]>("become-a-host", d => d.photos);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const { toastRes } = useToast();
    const { room } = useRoomStore(roomCreationSelector);
    const [photos, setPhotos] = useState<GetUserRoom["photos"]>([]);
    const [dragPhoto, setDragPhoto] = useState<Photo | null>(null);
    const { setValues, roomCreationPathnames: { nextTask, backTask }, setIsBackLoading, onResetRoomCreation, setIsNextLoading } = useRoomStore(roomCreationSelector);
    const requiredPhotoCount = 5;
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

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPhotos((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);

                const newData = arrayMove(items, oldIndex, newIndex);
                return newData.map((d, i) => ({ ...d, position: i }))
            });
        }

        setDragPhoto(null);
    }, []);
    const handleDragCancel = useCallback(() => {
        setDragPhoto(null);
    }, []);

    useEffect(() => {
        if (!room?.photos) return;
        setPhotos(room.photos)
    }, [room]);

    useEffect(() => {
        setValues({
            isNextDisabled: photos.length < requiredPhotoCount,
            async setNextRoomCreationTask() {
                if (!nextTask) return;
                setIsNextLoading(true);
                const result = await updateUserRoom(roomId, {
                    photos: photos.map((p) => ({ id: p.id, position: p.position })),
                    statusText: `${RoomStatus.CREATING}-${nextTask.name}`
                });
                if (!result?.ok) {
                    toastRes(result);
                } else {
                    router.push(nextTask.pathname)
                }
            },
            setBackRoomCreationTask() {
                if (!backTask) return;
                setIsBackLoading(true);
                router.push(backTask.pathname);
            }
        })
        return () => {
            onResetRoomCreation()
        }
    }, [
        router,
        setValues,
        photos,
        toastRes,
        roomId,
        setIsBackLoading,
        nextTask,
        backTask,
        onResetRoomCreation,
        setIsNextLoading
    ]);

    const PhotoAction = ({
        photo,
        index
    }: {
        photo: Photo;
        index: number;
    }) => {

        const handleAction = useCallback(async (key: Key) => {
            const newPhotos = [...photos];

            const swapPhotos = (activeIndex: number, overIndex: number) => {
                const activePhoto = { ...photo, position: newPhotos[activeIndex].position };
                const overPhoto = { ...newPhotos[overIndex], position: photo.position };
                newPhotos.splice(overIndex, 1, activePhoto);
                newPhotos.splice(activeIndex, 1, overPhoto);
                setPhotos(newPhotos);
            };

            switch (key) {
                case "top":
                    if (index < 1) return;
                    swapPhotos(index, 0);
                    break;
                case "up":
                    if (index < 1) return;
                    swapPhotos(index, index - 1);
                    break;
                case "down":
                    if (index >= photos.length - 1) return;
                    swapPhotos(index, index + 1);
                    break;
                case "delete":
                    const toastId = toast.loading("Loading...", {
                        position: "top-center"
                    });
                    const result = await deletePhoto([photo.id]);
                    if (!result?.ok) {
                        toastRes(result);
                    }
                    toast.dismiss(toastId);
                    break;
                default:
                    break;
            }
        }, [index, photo])

        const itemProps = (): Omit<DropdownItemProps, "key"> => ({
            className: "rounded-none px-4 py-3",
        });

        return <Dropdown
            placement={"bottom-end"}
            showArrow
            classNames={{
                content: "px-0 py-1.5",
            }}
            radius={"sm"}
        >
            <DropdownTrigger>
                <Button
                    isIconOnly
                    radius={"full"}
                    variant={"flat"}
                    className={"absolute top-2 right-2 z-10 bg-default-50"}
                    size={"sm"}
                >
                    <Ellipsis size={20} />
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                className={"p-0"}
                onAction={handleAction}
            >
                {
                    [
                        ...(index !== 0 ? ([
                            <DropdownItem key={"top"} {...itemProps()}>
                                <Translate as={"span"} isTrans isExcLocaleSystem>
                                    {d?.buttons.make_cover_photo}
                                </Translate>
                            </DropdownItem>,
                            <DropdownItem key={'up'} {...itemProps()}>
                                <Translate as={"span"} isTrans isExcLocaleSystem>
                                    {d?.buttons.move_forward}
                                </Translate>
                            </DropdownItem>
                        ]) : []),
                        ...(photos.length - 1 !== index ? ([
                            <DropdownItem key={'down'} {...itemProps()}>
                                <Translate as={"span"} isExcLocaleSystem isTrans>
                                    {d?.buttons.move_backward}
                                </Translate>
                            </DropdownItem>
                        ]) : []),
                        <DropdownItem key={'delete'} {...itemProps()}>
                            <Translate as={"span"} isTrans isExcLocaleSystem>
                                {d?.buttons.delete}
                            </Translate>
                        </DropdownItem>
                    ]
                }
            </DropdownMenu>
        </Dropdown>
    }

    return (
        <div className={"max-w-[700px] w-full"}>
            <Motion
                variants={slideUpContainer}
                initial="hidden"
                animate="visible"
                className={"relative"}
            >
                <Motion
                    as={"h1"}
                    className='text-title text-wrap'
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                >
                    {
                        photos.length === 0 ?
                            t("title")
                            : photos.length < 5 ?
                                t("title2")
                                :
                                t("title3")
                    }
                </Motion>
                <Motion
                    as={"span"}
                    className='text-description text-default-500 inline-block py-3'
                    variants={slideUpItem}
                    initial="hidden"
                    animate="visible"
                >
                    {
                        photos.length > 1 ? t("description2") : t("description")
                    }
                </Motion>
                {
                    photos.length !== 0 && (
                        <Button
                            type={"button"}
                            isIconOnly
                            variant={"light"}
                            radius={"full"}
                            className={"h-fit w-fit p-2 bg-default-100 absolute right-0 top-1/2 -translate-y-1/2"}
                            onPress={() => setIsOpenModal(true)}
                        >
                            <Plus size={25} />
                        </Button>
                    )
                }
            </Motion>
            <div className={"w-full mt-4"}>
                {
                    photos.length === 0 ? (
                        <Motion
                            variants={slideUpItem}
                            initial="hidden"
                            animate="visible"
                            className={"bg-[#F7F7F7] rounded-lg w-full min-h-[500px] h-full flex flex-col justify-center items-center border-2 border-dashed"}
                        >

                            <Image
                                src={"/images/become-a-host/photos/camera.avif"}
                                alt={t("title")}
                                height={182}
                                width={182}
                            />
                            <Button type={"button"} variant={"bordered"} radius={"sm"} onPress={() => {
                                setIsOpenModal(true)
                            }}>
                                {d?.buttons.add_photo}
                            </Button>
                        </Motion>
                    ) : (
                        <DndProvider
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                        >
                            <DndWrap
                                items={photos}
                                className={"md:grid-cols-2"}
                            >
                                {photos.map((item, i) => (
                                    <DndSortableItem
                                        key={item.id}
                                        className={cn(
                                            "w-full rounded-xl h-auto relative",
                                            i === 0 ? "md:row-span-2 md:col-span-2 md:h-[466px]" : "md:h-[228px]"
                                        )}
                                        data={item}
                                    >
                                        <PhotoEl item={item} />
                                        <PhotoAction photo={item} index={i} />
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
                                                "h-[228px] sm:h-[380px] md:h-[228px]"
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
                                    "rounded-xl",
                                    dragPhoto?.position === 0 ? "md:row-span-2 md:col-span-2 md:h-[466px]" : "md:h-[228px]"
                                )}>
                                    <PhotoEl item={dragPhoto!} />
                                </DndItem>
                            </DndDragOverlay>
                        </DndProvider>
                    )
                }
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
        </div>
    );
};

export default PhotoClient;