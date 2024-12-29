import React from 'react';
import {DragOverlay, DragOverlayProps} from "@dnd-kit/core";
import {SortableContextProps} from "@dnd-kit/sortable";

interface DndDragOverlayProps extends Omit<DragOverlayProps, "children"> {
    dragData: SortableContextProps["items"][number] | null;
    children: React.ReactNode;
    dropZoneRect?: { top: string, left: string }
}

const DndDragOverlay: React.FC<DndDragOverlayProps> = ({
                                                           dragData,
                                                           children,
                                                           ...props
                                                       }) => {

    return (
        <DragOverlay
            adjustScale
            {...props}
        >
            {!!dragData ? children : null}
        </DragOverlay>
    );
};

export default DndDragOverlay;