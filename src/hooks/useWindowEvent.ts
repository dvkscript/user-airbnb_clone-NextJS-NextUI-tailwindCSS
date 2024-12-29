import BreakpointConfig from "@/configs/breakpoints.config";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function useWindowEvent() {

    const [isScroll, setIsScroll] = useState<boolean>(false);
    const [scrollX, setScrollX] = useState(0);
    const [scrollY, setScrollY] = useState(0);
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });

    const screen = useMemo(() => {
        const width = windowSize.width;
        if (width === 0) return null;

        const matchedBreakpoint = Object.entries(BreakpointConfig).reverse().find(([, value]) => width >= value.minWidth);

        if (!matchedBreakpoint) {
            return {
                key: "sm",
                ...BreakpointConfig.sm
            }
        };

        return {
            key: matchedBreakpoint[0],
            ...matchedBreakpoint[1],
        }
    }, [windowSize.width]);

    const prevScrollYRef = useRef(0);

    const { isScrollingDown, isScrollingUp } = useMemo(() => {
        const prevScrollY = prevScrollYRef.current;
        const isScrollingDown = scrollY > prevScrollY;
        const isScrollingUp = scrollY < prevScrollY;

        prevScrollYRef.current = scrollY;

        return {
            isScrollingDown,
            isScrollingUp
        }
    }, [scrollY])

    const handleScroll = useCallback(() => {
        setScrollX(window.scrollX)
        setScrollY(window.scrollY)
        if (window.scrollY > 10) {
            setIsScroll(true)
        } else {
            setIsScroll(false)
        }
    }, []);

    const handleResize = useCallback(() => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener('resize', handleResize);
        }
    }, [
        handleScroll,
        handleResize
    ]);

    useEffect(() => {
        setScrollX(window.scrollX);
        setScrollY(window.scrollY);
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);

    return {
        isScroll,
        setIsScroll,
        scrollX,
        scrollY,
        isScrollingDown,
        isScrollingUp,
        screen
    }
};
