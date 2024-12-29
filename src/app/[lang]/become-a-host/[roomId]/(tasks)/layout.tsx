import React from 'react';
import {cn} from "@/utils/dom.util";
import Container from "@/components/Common/Container";

interface TaskLayoutProps {
    children: React.ReactNode;
}

const TaskLayout: React.FC<TaskLayoutProps> = ({
                                                   children
                                               }) => {
    return (
        <Container className={cn('flex justify-center items-center px-3 min-h-fit md:px-10')}>
            {children}
        </Container>
    );
};

export default TaskLayout;