import React from 'react';

interface HostingLayoutProps {
    children: React.ReactNode;
}

const HostingLayout: React.FC<HostingLayoutProps> = ({
    children,
}) => {


    return (
        <>
            <main className='flex-1 h-full'>
                {children}
            </main>
        </>
    );
};

export default HostingLayout;