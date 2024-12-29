export const slideUpContainer = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.03,
            ease: "easeInOut",
            duration: 0.6,
        }
    }
};

export const slideUpItem = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            ease: [0.6, 0.01, 0.05, 0.95],
            duration: 0.6
        }
    }
};