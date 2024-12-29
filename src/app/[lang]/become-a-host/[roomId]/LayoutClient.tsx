"use client"
import { roomCreationSelector } from '@/hooks/selectors/roomSelector';
import useRoomStore from '@/hooks/useRoomStore';
import useUrl from '@/hooks/useUrl';
import { GetUserRoom } from '@/services/user.service';
import React, { useEffect } from 'react';

interface LayoutClientProps {
    children: React.ReactNode;
    room: GetUserRoom | null;
    roomId: string
}

const LayoutClient: React.FC<LayoutClientProps> = ({
    children,
    room, 
    roomId
}) => {
    const { setRoom,
        setRoomCreationPathnames,
        room: roomState
    } = useRoomStore(roomCreationSelector);
    const {pathnames} = useUrl();

    useEffect(() => {
        setRoom(room);
    }, [room, setRoom]);

    useEffect(() => {
        setRoomCreationPathnames(roomId, `/${pathnames.slice(1).join("/")}`)
    },[roomId, pathnames, setRoomCreationPathnames])

    return (
        <>
            {roomState && children}
        </>
    );
};

export default LayoutClient;