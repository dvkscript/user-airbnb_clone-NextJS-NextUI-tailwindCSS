"use client";
import React from 'react';
import {
    closestCenter,
    DndContext,
    DndContextProps,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";

type DndProviderProps = Omit<DndContextProps, "sensors" | "collisionDetection"> & {
    children: React.ReactNode;
}

const DndProvider: React.FC<DndProviderProps> = ({
                                                     children,
                                                     ...props
                                                 }) => {
    const sensors = useSensors(useSensor(MouseSensor, {
        activationConstraint: { distance: 10 },
    }), useSensor(TouchSensor, {
        activationConstraint: { delay: 250, tolerance: 500 },
    }));

    return (
        <DndContext
            {...props}
            sensors={sensors}
            collisionDetection={closestCenter}
        >
            {children}
        </DndContext>
    );
};

export default DndProvider;