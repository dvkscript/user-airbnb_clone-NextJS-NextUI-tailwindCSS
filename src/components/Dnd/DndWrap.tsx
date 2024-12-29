import React from 'react';
import {cn} from "@/utils/dom.util";
import {rectSortingStrategy, SortableContext, SortableContextProps} from "@dnd-kit/sortable";

interface DndWrapProps extends Omit<SortableContextProps, "children"> {
    children?: React.ReactNode;
    className?: string;
    columns?: number;
    items: SortableContextProps["items"]
}

const DndWrap: React.FC<DndWrapProps> = ({
                                             children,
                                             className,
                                             columns = 1,
                                             items,
                                             ...props
                                         }) => {
    return (
        <SortableContext
            items={items}
            strategy={rectSortingStrategy}
            {...props}
        >
            <div className={cn(
                "w-full grid",
                'gap-y-3 md:gap-3',
                `grid-cols-${columns}`,
                className,
            )}
            >
                {children}
            </div>
        </SortableContext>
    );
};

export default DndWrap;