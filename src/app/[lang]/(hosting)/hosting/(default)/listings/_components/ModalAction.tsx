"use client"
import Button from "@/components/Button";
import Image from "@/components/Common/Image";
import Translate from "@/components/Common/Translate";
import { RoomStatus } from "@/enum/room";
import { roomCreationPathnames } from "@/hooks/stores/roomStore";
import useToast from "@/hooks/useToast";
import { Dictionary } from "@/libs/dictionary.lib";
import { deleteUserRooms, GetUserRoomAndCountAll } from "@/services/user.service";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spacer } from "@nextui-org/react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import React, { memo, useCallback, useState } from "react"

interface ModalActionProps {
    onClose: () => void;
    titleNull: string;
    room: GetUserRoomAndCountAll["rows"][number] | null;
    dictionary: Dictionary["hosting"]["listings"]["modal"]
}

const ModalAction: React.FC<ModalActionProps> = ({
    onClose,
    titleNull,
    room,
    dictionary
}) => {
    const [layout, setLayout] = useState<"default" | "delete">("default");
    const router = useRouter();
    const { toastRes } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = useCallback(() => {
        onClose();
        setLayout("default");
    }, [onClose])

    const handleDelete = useCallback(async () => {
        if (!room) return;
        setIsLoading(true)
        const res = await deleteUserRooms([room.id]);
        setIsLoading(false);
        if (!res.ok) {
            return toastRes(res);
        };
        handleClose();
    }, [room, toastRes, handleClose])


    return (
        <Modal
            isOpen={!!room}
            onClose={handleClose}
            closeButton
            size='sm'
        >
            <Translate isExcLocaleSystem isTrans>
                <ModalContent className="p-6 gap-y-6">
                    {
                        layout === "default" ? (
                            <Spacer y={0} />
                        ) : (
                            <ModalHeader className="flex-col gap-y-3 text-center p-0 mt-1">
                                <h1 className="text-2xl font-medium">
                                    {dictionary.title.delete}
                                </h1>
                                <span className="text-base font-normal text-default-600">
                                    {dictionary.description.delete}
                                </span>
                            </ModalHeader>
                        )
                    }
                    <ModalBody className="p-0 flex-col items-center gap-y-3">
                        <div className="size-[8.75rem] bg-default-200 rounded-md overflow-hidden">
                            {
                                room?.photos[0] && (
                                    <Image
                                        width={"100%"}
                                        className="min-w-[8.75rem] w-full object-cover z-0 inset-0 h-full"
                                        classNames={{
                                            wrapper: "w-full h-full"
                                        }}
                                        radius="none"
                                        alt={room.title || titleNull}
                                        src={room.photos[0].url}
                                    />
                                )
                            }
                        </div>
                        <p className="text-sm font-medium text-wrap">
                            {titleNull}
                        </p>
                    </ModalBody>
                    <ModalFooter className="flex-col gap-y-4 p-0 text-base">
                        {
                            layout === "default" ? (
                                <>
                                    <Button
                                        color="secondary"
                                        className="font-medium text-base"
                                        radius="sm"
                                        disableRipple
                                        onPress={() => {
                                            if (!room) return;
                                            if (room.statusText.startsWith(RoomStatus.CREATING + "-")) {
                                                const taskName = room.statusText.replace(`${RoomStatus.CREATING}-`, "");
                                                const tasks = roomCreationPathnames(room.id);
                                                const task = tasks.find(t => t.name === taskName);
                                                
                                                if (!task) return;
                                                router.push(task.pathname)
                                            } else {
                                                router.push("/hosting/listings/editor/" + room.id + "/details/photo-tour")
                                            }
                                        }}
                                    >
                                        {dictionary?.buttons.edit}
                                    </Button>
                                    <Button
                                        variant="light"
                                        className="font-medium text-base"
                                        radius="sm"
                                        startContent={<Trash2 size={16} strokeWidth={2.5} />}
                                        disableRipple
                                        onPress={() => {
                                            setLayout("delete")
                                        }}
                                    >
                                        {dictionary?.buttons.remove}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        color="secondary"
                                        className="font-medium text-base"
                                        radius="sm"
                                        disableRipple
                                        onPress={handleDelete}
                                        isLoading={isLoading}
                                    >
                                        {!isLoading && dictionary?.buttons.yes}
                                    </Button>
                                    <Button
                                        variant="light"
                                        className="font-medium text-base"
                                        radius="sm"
                                        disableRipple
                                        onPress={() => {
                                            setLayout("default")
                                        }}
                                        isDisabled={isLoading}
                                    >
                                        {dictionary?.buttons.cancel}
                                    </Button>
                                </>
                            )
                        }
                    </ModalFooter>
                </ModalContent>
            </Translate>
        </Modal>
    );
};

export default memo(ModalAction);