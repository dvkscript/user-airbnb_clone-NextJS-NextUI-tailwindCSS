import React from "react"

interface BookLayoutProps {
    children: React.ReactNode;
}

const BookLayout: React.FC<BookLayoutProps> = ({
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

export default BookLayout;