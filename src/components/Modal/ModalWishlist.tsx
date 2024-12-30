"use client"
import { Card, CardBody, CardFooter, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Translate from "../Common/Translate";
import { GetRoomAndCountAll, GetRoomDetail } from "@/services/room.service";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import { createWishlist, GetWishlists, wishlistAddOrRemoveRoom } from "@/services/user.service";
import useToast from "@/hooks/useToast";
import Image from "../Common/Image";
import Button from "../Button";
import { Heart } from "lucide-react";
import { ExternalToast, toast } from "sonner";
import { cleanStr } from "@/utils/dom.util";
import { useSearchParams } from "next/navigation";

interface ModalWishlistProps {
    wishlists: GetWishlists;
    setIsOpenModal: (isOpen: ModalWishlistProps["isOpenModal"]) => void;
    isOpenModal: boolean;
    roomSelected: GetRoomAndCountAll["rows"][number] | null;
    setRoomSelected?: (roomSelected: ModalWishlistProps["roomSelected"]) => void;
}

const ModalWishlist = ({
    wishlists,
    isOpenModal,
    setIsOpenModal,
    roomSelected,
    setRoomSelected,
}: ModalWishlistProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [layout, setLayout] = useState<"save" | "create">("create");
    const wishlistsMsg = useDictionary<"common", Dictionary["common"]["modal"]["wishlists"]>("common", d => d.modal.wishlists).d;
    const toastMsg = useDictionary<"common", Dictionary["common"]["modal"]["wishlists"]["toast"]>("common", d => d.modal.wishlists.toast).t;
    const btnMsg = useDictionary<"common", Dictionary["common"]["buttons"]>("common", d => d.buttons).t;
    const buttonsMsg = useDictionary<"common", Dictionary["common"]["buttons"]>("common", d => d.buttons).d;
    const { toastRes } = useToast();
    const searchParams = useSearchParams();
    const structure = searchParams.get("structure")
    const structureRef = useRef<HTMLSpanElement | null>(null);
    const [wishlistId, setWishlistId] = useState("");

    const toastOption: ExternalToast = useMemo(() => ({
        position: "bottom-left",
        className: "p-2 rounded-xl bg-content1 shadow-[0_0_10px_0px] shadow-black/10 w-80",
    }), []);

    const toastCustom = useCallback((t: string | number, name: string, room: GetRoomAndCountAll["rows"][number] | GetRoomDetail) => (
        <div className="w-full flex items-center justify-start gap-x-3 text-base">
            <Image
                src={room.photos[0].url}
                alt={room.title || ""}
                width={40}
                height={40}
                className="rounded-lg object-cover"
                classNames={{
                    wrapper: "flex-shrink-0"
                }}
            />
            <span
                className="line-clamp-2"
                dangerouslySetInnerHTML={{
                    __html: toastMsg("save", `<b class="font-medium notranslate">${cleanStr(name)}</b>`),
                }}
            />
            <button
                type="button"
                className="ml-auto cursor-pointer p-2 underline w-fit min-w-fit flex-shrink-0"
                onClick={() => {
                    toast.dismiss(t);
                    setIsOpen(true);
                    setIsOpenModal(true);
                    if (setRoomSelected) setRoomSelected(roomSelected);
                }}
            >
                {btnMsg("Change")}
            </button>
        </div>
    ), [toastMsg, btnMsg, setIsOpen, setRoomSelected, roomSelected, setIsOpenModal]);


    const handleClose = useCallback(() => {
        if (layout === "create" && wishlists && wishlists.length > 0) {
            return setLayout("save");
        }
        setIsOpenModal(false);
        setIsOpen(false);
    }, [layout, wishlists, setIsOpenModal]);

    const handleSubmit = useCallback(async (e: any) => {
        e.preventDefault();
        if (inputValue.length === 0 || !roomSelected) return;
        setIsLoading(true)
        const res = await createWishlist(inputValue);
        if (res.ok) {
            const updateRes = await wishlistAddOrRemoveRoom(res.data!.id, {
                action: "add",
                roomId: roomSelected.id
            });
            if (!updateRes?.ok) {
                return toastRes(res, {
                    position: toastOption.position
                });
            };
            setWishlistId(res.data!.id);
            toast.custom((t) => toastCustom(t, inputValue, roomSelected), {
                ...toastOption,
            })
        }
        setIsLoading(false);

        if (!res?.ok) {
            return toastRes(res);
        }
        handleClose()
    }, [
        inputValue,
        roomSelected,
        toastRes,
        setIsLoading,
        toastOption,
        toastCustom,
        handleClose,
    ]);

    const handleAddRoomWishlist = useCallback(async (w: GetWishlists[number]) => {
        if (!roomSelected) return;

        const res = await wishlistAddOrRemoveRoom(w.id, {
            action: "add",
            roomId: roomSelected.id
        });
        if (!res.ok) {
            return toastRes(res, {
                position: toastOption.position
            });
        }
        setWishlistId(w.id);
        toast.custom((t) => toastCustom(t, w.name, roomSelected), {
            ...toastOption,
        });
        handleClose()
    }, [roomSelected, toastRes, handleClose, toastOption, toastCustom])

    useEffect(() => {
        if (wishlists && wishlists?.length > 0) {
            setLayout("save")
        }
    }, [wishlists]);

    useEffect(() => {
        if (roomSelected && structureRef.current && layout === "create") {
            setInputValue(structureRef.current.innerText)
        }
    }, [layout, roomSelected]);

    useEffect(() => {
        setWishlistId("");
    }, [structure]);

    useEffect(() => {
        if (isOpenModal && !isOpen) {
            if (wishlistId) {
                const wishlist = wishlists.find(w => w.id === wishlistId);
                if (wishlist) {
                    (async () => {
                        const toastId = toast.loading("Loading...", {
                            position: toastOption.position,
                            className: "w-80"
                        })
                        await handleAddRoomWishlist(wishlist);
                        toast.dismiss(toastId);
                    })();
                } else {
                    setIsOpen(true);
                }
            } else {
                 setIsOpen(true);
            }
        }
    }, [isOpen, wishlistId, wishlists, handleAddRoomWishlist, setIsOpen, toastOption.position, isOpenModal])

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            classNames={{
                wrapper: "overflow-hidden",
                body: "pt-6 px-6 pb-6 gap-y-2",
                closeButton: "hover:bg-white/5 active:bg-white/10",
            }}
            scrollBehavior="inside"
            size="xl"
        >
            <Translate isExcLocaleSystem isTrans className="absolute bottom-0 left-0 translate-y-full opacity-0">
                <span ref={structureRef}>
                    {`${structure} ${!!roomSelected ? new Date(roomSelected.created_at).getFullYear() : ""}`}
                </span>
            </Translate>
            <Translate isExcLocaleSystem={false} isTrans>
                <ModalContent
                    className='h-auto'
                    as={layout === "create" ? "form" : "div"}
                    onSubmit={layout === "create" ? handleSubmit : undefined}
                >
                    <ModalHeader className="py-5 px-5 text-center">
                        <h1 className="mx-auto text-base">
                            {
                                wishlistsMsg?.title[layout]
                            }
                        </h1>
                    </ModalHeader>
                    <Divider />
                    <ModalBody>
                        {
                            layout === "create" ? (<>
                                <Input
                                    type="text"
                                    label={wishlistsMsg?.form.name.label}
                                    variant="bordered"
                                    classNames={{
                                        label: "text-default-600"
                                    }}
                                    size="lg"
                                    onValueChange={setInputValue}
                                    value={inputValue}
                                />
                                <span className="text-default-500 text-[12px] ml-1">
                                    {wishlistsMsg?.form.name.message.replace("{{value}}", `${inputValue.length}/50`)}
                                </span>
                            </>) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {
                                        wishlists.map((w) => (
                                            <Card
                                                shadow="none"
                                                className="w-full relative dark:bg-default-100"
                                                radius="none"
                                                data-focus="false"
                                                data-focus-visible="false"
                                                key={w.id}
                                            >
                                                <CardBody className="px-0 pb-0 relative pt-[82.7%] h-full z-0">
                                                    <div className="absolute inset-0 p-1.5 h-full w-full border rounded-3xl">
                                                        {
                                                            w.thumbnail ? (
                                                                <Image
                                                                    src={w.thumbnail}
                                                                    alt={w.name}
                                                                    radius="none"
                                                                    width="100%"
                                                                    className="w-full object-cover z-0 inset-0 h-full rounded-[inherit]"
                                                                    classNames={{
                                                                        wrapper: "w-full h-full rounded-2xl shadow-xl z-0"
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-neutral-300 rounded-2xl grid content-center">
                                                                    <Heart className="mx-auto text-white" size={70} strokeWidth={1.5} />
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </CardBody>
                                                <CardFooter className="z-0 text-small grid grid-cols-1 px-0 pt-1 pb-8 text-left">
                                                    <Translate
                                                        as={"span"}
                                                        className="h-full w-full line-clamp-2 overflow-clip text-title-accent"
                                                    >
                                                        {w.name}
                                                    </Translate>
                                                    <p className="text-accent h-full w-full line-clamp-1 overflow-clip">
                                                        {wishlistsMsg?.table.message.replace("{{value}}", w.roomCount.toString())}
                                                    </p>
                                                </CardFooter>
                                                <button
                                                    type="button"
                                                    className="absolute inset-0 bg-none"
                                                    onClick={() => handleAddRoomWishlist(w)}
                                                />
                                            </Card>
                                        ))
                                    }
                                </div>
                            )
                        }
                    </ModalBody>
                    <Divider />
                    <ModalFooter className='py-3.5 px-5'>
                        {
                            layout === "create" ? (
                                <>
                                    <Button
                                        variant="light"
                                        className="mr-auto"
                                        type="button"
                                        onPress={() => setInputValue("")}
                                    >
                                        {buttonsMsg?.Clear}
                                    </Button>
                                    <Button
                                        color="secondary"
                                        type="submit"
                                        isDisabled={inputValue.length === 0}
                                        isLoading={isLoading}
                                        translate="no"
                                    >
                                        <Translate isTrans isExcLocaleSystem>
                                            {!isLoading && buttonsMsg?.Create}
                                        </Translate>
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    color="secondary"
                                    size="lg"
                                    fullWidth
                                    onPress={() => setLayout("create")}
                                >
                                    {buttonsMsg?.["Create new wishlist"]}
                                </Button>
                            )
                        }
                    </ModalFooter>
                </ModalContent>
            </Translate>
        </Modal>
    );
};

export default ModalWishlist;