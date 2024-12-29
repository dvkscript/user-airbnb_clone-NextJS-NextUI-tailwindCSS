"use client"
import LoaderPulse from "@/components/Loader/LoaderPulse";
import { roomEditorSelector } from "@/hooks/selectors/roomSelector";
import useRoomStore from "@/hooks/useRoomStore";
import { GetUserRoom } from "@/services/user.service";
import React, { useEffect } from "react"

interface LayoutClientProps {
    children: React.ReactNode;
    room: GetUserRoom | null;
}

const LayoutClient: React.FC<LayoutClientProps> = ({
    children,
    room
}) => {
    const { room: roomState, setRoom } = useRoomStore(roomEditorSelector)

    useEffect(() => {
        setRoom(room)
    }, [setRoom, room]);

    if (!roomState) {
        return <div className="w-full h-full min-h-full grid content-center">
            <LoaderPulse className="w-fit mx-auto" />
        </div>
    }

    return (
        <>
            <main className="h-full w-full overflow-x-hidden overflow-y-auto bg-white dark:bg-neutral-800">
                <section className="h-full relative bg-inherit flex flex-col">
                    {children}
                </section>
            </main>
        </>
    );
};

export default LayoutClient;