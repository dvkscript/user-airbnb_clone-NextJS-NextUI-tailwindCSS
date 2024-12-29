import React, {forwardRef, HTMLAttributes} from 'react';
import { motion, MotionProps } from 'framer-motion';

type MotionElement = keyof typeof motion;

type MotionComponentProps<T extends MotionElement> = MotionProps & HTMLAttributes<HTMLElement> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    type?: string
};

const Motion = forwardRef(<K extends MotionElement>(
    {
        as,
        children,
        className,
        ...props
    }: MotionComponentProps<K>,
    ref: React.Ref<HTMLElement>
) => {
    const Component = motion[as ?? 'div'] as React.ElementType;

    return (
        <Component ref={ref} className={className} {...props}>
            {children}
        </Component>
    );
});

Motion.displayName = 'Motion';

export default Motion;