import React, { ReactNode } from 'react';
import { Nunito } from 'next/font/google';
import { cn } from '@/utils/dom.util';

const font = Nunito({
    subsets: ['latin'],
});

interface LangLayoutProps {
    children: ReactNode;
}

const LangLayout: React.FC<LangLayoutProps> = ({
    children,
}) => {
    return (
        <html suppressHydrationWarning>
            <body className={cn(font.className, "min-h-screen bg-white dark:bg-default-100")}>
                {children}
            </body>
        </html>
    );
};

export default LangLayout;