import { cn } from '@/utils/dom.util';
import React, { FC, memo, ReactNode } from 'react'

interface ContainerProps {
    children?: ReactNode;
    className?: string;
    maxWidth?: number;
    style?: React.CSSProperties
}

const Container: FC<ContainerProps> = ({
    children,
    className,
    maxWidth = 2520,
    style
}) => {

    return (
        <div
            className={cn(
                "container w-full h-full",
                className
            )}
            style={{
                ...style,
                maxWidth: `${maxWidth}px`,
            }}
        >
            {children}
        </div>
    )
}

export default memo(Container)