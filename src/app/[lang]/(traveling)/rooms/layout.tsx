import React from "react"

interface RoomDetailLayoutProps { 
    children: React.ReactNode;
}

const RoomDetailLayout: React.FC<RoomDetailLayoutProps> = ({ 
    children,
}) => {
    return (
        <>
            <main className='flex-1 bg-inherit'>
                {children}
            </main>
        </>
    );
};

export default RoomDetailLayout;