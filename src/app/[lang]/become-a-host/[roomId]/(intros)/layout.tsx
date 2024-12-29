import React from 'react';

interface IntroLayoutProps {
    children: React.ReactNode;
}
const IntroLayout: React.FC<IntroLayoutProps> = ({
    children
                                                 }) => {
    return (
        <>
            {children}
        </>
    );
};

export default IntroLayout;