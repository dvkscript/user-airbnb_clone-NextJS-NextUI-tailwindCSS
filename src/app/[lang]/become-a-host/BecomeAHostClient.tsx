"use client"
import { useRouter } from 'next-nprogress-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { motion } from "framer-motion";
import useUrl from '@/hooks/useUrl';
import { Button } from '@nextui-org/react';
import { ChevronRight, House, X } from 'lucide-react';
import useModal from '@/hooks/useModal';
import { deleteUserRooms, GetUserRoomAndCountAll } from '@/services/user.service';
import { useParams } from 'next/navigation';
import useDictionary from '@/hooks/useDictionary';
import { Dictionary } from '@/libs/dictionary.lib';
import { slideUpContainer, slideUpItem } from '@/animations/slideUp.animation';
import { ModalMode } from '@/enum/modalMode';
import { profileSelector } from '@/hooks/selectors/userSelector';
import useUserStore from '@/hooks/useUserStore';
import useRoomStore from '@/hooks/useRoomStore';
import { roomCreationSelector } from '@/hooks/selectors/roomSelector';
import { roomCreationPathnames } from '@/hooks/stores/roomStore';
import { RoomStatus } from '@/enum/room';
import { toast } from 'sonner';
import useToast from '@/hooks/useToast';

interface BecomeAHostClientProps {
    rooms: GetUserRoomAndCountAll;
}

const BecomeAHostClient: React.FC<BecomeAHostClientProps> = ({
    rooms,
}) => {
    const route = useRouter();
    const { replacePath } = useUrl()
    const { profile } = useUserStore(profileSelector);
    const [isShow, setIsShow] = useState<boolean>(false);
    const { lang } = useParams();
    const { onModal, setIsLoading, onClose } = useModal();
    const { t, p } = useDictionary<"become-a-host", Dictionary["become-a-host"]["home"]["items"]>("become-a-host", (d) => d.home.items);
    const { } = useRoomStore(roomCreationSelector);
    const router = useRouter();
    const { toastRes } = useToast()

    const handleToRoomCreation = useCallback((room: GetUserRoomAndCountAll["rows"][number]) => {
        if (!room.statusText.startsWith(`${RoomStatus.CREATING}-`)) {
            return toast.error("Error")
        }
        const roomId = room.id;
        const tasks = roomCreationPathnames(roomId);
        const roomStatus = room.statusText.replace(`${RoomStatus.CREATING}-`,"");
        const task = tasks.find((t) => t.name === roomStatus);
        if (!task) {
            return toast.error("Error")
        };
        router.push(task.pathname);
    }, [router]);

    const handleDeleteRooms = useCallback(async (roomId: string) => {
        setIsLoading(true);
        const res = await deleteUserRooms([roomId]);
        toastRes(res)
        if (res?.ok) {
            onClose();
        }
        setIsLoading(false);
    }, [setIsLoading, onClose, toastRes]);

    const listingEl = useMemo(() => {
        if (rooms && Array.isArray(rooms.rows)) {
            if (rooms.rows.length > 3 && isShow) {
                return rooms.rows;
            } else {
                return rooms.rows.slice(0, 3);
            }
        }
        return [];
    }, [rooms, isShow]);

    return (
        <motion.div
            className='max-w-[623px] mx-auto flex flex-col gap-y-8'
            variants={slideUpContainer}
            initial="hidden"
            animate="visible"
        >
            <motion.h1
                className='text-3xl text-title'
                variants={slideUpItem}
            >
                {p?.home.title.replace("{{name}}", profile?.full_name || "")}
            </motion.h1>
            {
                rooms && rooms.rows?.length > 0 && (
                    <motion.div
                        className='flex flex-col gap-y-3'
                        variants={slideUpItem}
                    >
                        <h2 className='text-2xl text-subtitle'>
                            {t("finish your listing")}
                        </h2>
                        <div>
                            <div className='flex flex-col gap-y-3'>
                                {
                                    listingEl.map((room) => (
                                        <div
                                            key={room.id}
                                            className='relative overflow-hidden rounded-xl group'
                                        >
                                            <Button
                                                href='/!#'
                                                variant='bordered'
                                                startContent={<span className='bg-default-200 p-2 rounded-lg overflow-hidden'>
                                                    <House size={28} strokeWidth={1.5} />
                                                </span>}
                                                className='p-6 h-fit border-1 hover:bg-default-100 hover:opacity-100 hover:border-default-800 gap-x-4 font-medium w-full peer'
                                                size='lg'
                                                onPress={() => handleToRoomCreation(room)}
                                            >
                                                <span className='flex-1 block text-left text-wrap'>
                                                    {
                                                        t("your house listing started date", new Date(room.created_at).toLocaleDateString(lang, {
                                                            day: 'numeric', month: 'long', year: 'numeric'
                                                        }))
                                                    }
                                                </span>
                                            </Button>
                                            <Button
                                                className='z-1 absolute top-2 right-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 peer-active:invisible'
                                                isIconOnly
                                                size='sm'
                                                variant='light'
                                                onPress={() => {
                                                    onModal({
                                                        mode: ModalMode.CONFIRM,
                                                        title: p.home.messages.delete.title,
                                                        content: p.home.messages.delete.description,
                                                        onConfirm: () => {
                                                            handleDeleteRooms(room.id);
                                                        }
                                                    })
                                                }}
                                            >
                                                <X size={20} />
                                            </Button>
                                        </div>
                                    ))
                                }
                            </div>
                            {
                                rooms?.rows?.length > 3 && (
                                    <button
                                        type='button'
                                        className='mt-4 font-medium underline decoration-1'
                                        onClick={() => setIsShow(!isShow)}
                                    >
                                        {
                                            isShow ? "Show less" : "Show all"
                                        }
                                    </button>
                                )
                            }
                        </div>
                    </motion.div>
                )
            }
            <motion.div
                className='flex flex-col gap-y-3'
                variants={slideUpItem}
            >
                <h2 className='text-2xl text-subtitle'>
                    {t("start a new listing")}
                </h2>
                <div className='flex flex-col'>
                    <button
                        type='button'
                        onClick={() => route.push(replacePath("", "/overview"))}
                        className='flex justify-between items-center gap-x-4 py-6'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-[32px] h-[32px] dark:invert' viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false">
                            <path d="M31.7 15.3 29 12.58 18.12 1.7a3.07 3.07 0 0 0-4.24 0L3 12.59l-2.7 2.7 1.4 1.42L3 15.4V28a2 2 0 0 0 2 2h22a2 2 0 0 0 2-2V15.41l1.3 1.3ZM27 28H5V13.41L15.3 3.12a1 1 0 0 1 1.4 0L27 13.42ZM17 12v5h5v2h-5v5h-2v-5h-5v-2h5v-5Z"></path>
                        </svg>
                        <span className='flex-1 block text-left'>
                            {t("create a new listing")}
                        </span>
                        <ChevronRight strokeWidth={2} />
                    </button>
                    {/* <button
                        type='button'
                        className='flex justify-between items-center gap-x-4 py-6 border-b-1.5'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className='w-[32px] h-[32px] dark:invert' viewBox="0 0 32 32" aria-hidden="true" role="presentation" focusable="false">
                            <path d="M25 5a4 4 0 0 1 4 4v17a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5h13zm0 2H12a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9a2 2 0 0 0-2-2zm-3-6v2H11a6 6 0 0 0-6 5.78V22H3V9a8 8 0 0 1 7.75-8H22z"></path>
                        </svg>
                        <span className='flex-1 block text-left'>
                            {t("create form an existing listing")}
                        </span>
                        <ChevronRight strokeWidth={2} />
                    </button> */}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BecomeAHostClient;