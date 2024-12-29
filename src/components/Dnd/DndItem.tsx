import React, {CSSProperties, forwardRef, HTMLAttributes, useMemo} from 'react';
import {cn} from "@/utils/dom.util";

export type DndItemProps = HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
    isDragging?: boolean;
    className?: string;
    withOpacity?: boolean;
};

const DndItem = forwardRef<
    HTMLDivElement,
    DndItemProps
>(({
       children,
       isDragging,
       className,
       withOpacity,
       style,
       ...props
   }, ref) => {

    const inlineStyles = useMemo(() => ({
        cursor: isDragging ? 'grabbing' : 'grab',
        transformOrigin: '0 0',
        opacity: withOpacity ? '0.5' : '1',
        boxShadow: isDragging  ? 'rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px' : 'rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px',
        ...style,
    } as CSSProperties), [isDragging, withOpacity, style]);

    return (
        <div
            ref={ref}
            className={cn(
                className,
            )}
            style={inlineStyles}
            {...props}
        >
            {children}
        </div>
    );
});

DndItem.displayName = "DndItem";

export default DndItem;