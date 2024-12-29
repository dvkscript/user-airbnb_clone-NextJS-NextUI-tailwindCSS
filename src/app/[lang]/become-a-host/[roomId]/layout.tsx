import React from 'react';
import LayoutClient from './LayoutClient';
import { getUserRoom } from '@/services/user.service';

interface LayoutProps {
    children: React.ReactNode;
    params: {
        roomId: string;
    }
}

const Layout = async ({
    children,
    params: {
        roomId
    }
}: LayoutProps) => {
    
    const result = await getUserRoom(roomId);

    if (!result.ok) {
        throw new Error(result.status.toString());
    }

    const room = result.data;

    return (
        <LayoutClient room={room} roomId={roomId}>
            {children}
        </LayoutClient>
    );
};

export default Layout;