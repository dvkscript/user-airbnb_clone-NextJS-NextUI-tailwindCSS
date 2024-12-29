import React, {useEffect, useMemo} from 'react';
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import DndItem, {DndItemProps} from "@/components/Dnd/DndItem";

type DndSortableItemProps<T> = DndItemProps & {
    setIsDragging?: (isDragging: boolean) => void;
    data: T,
    style?: HTMLElement["style"];
};

const DndSortableItem = <T extends Record<string, any> & { id: string }, >({
                                                                               children,
                                                                               className,
                                                                               setIsDragging,
                                                                               data,
                                                                               style,
                                                                               ...props
                                                                           }: DndSortableItemProps<T>) => {
    const {
        isDragging,
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({id: data.id, data});

    const initialStyle = useMemo(() => ({
        ...style,
        transform: CSS.Transform.toString(transform),
        transition: transition || undefined + " all 300ms ease-in-out",
    }), [transform, transition, style]);

    useEffect(() => {
        if (setIsDragging) setIsDragging(isDragging)
    }, [isDragging, setIsDragging]);

    return (
        <DndItem
            ref={setNodeRef}
            className={className}
            style={initialStyle}
            withOpacity={isDragging}
            {...props}
            {...attributes}
            {...listeners}
        >
            {children}
        </DndItem>
    );
};

export default DndSortableItem;