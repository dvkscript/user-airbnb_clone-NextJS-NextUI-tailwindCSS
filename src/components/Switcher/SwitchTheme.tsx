"use client"
import { useTheme } from 'next-themes';
import { Button, ButtonProps } from '@nextui-org/react';
import { Moon, Sun } from 'lucide-react';
import useSystemStore from '@/hooks/useSystemStore';
import { loaderSelector } from '@/hooks/selectors/systemSelector';

const SwitchTheme = ({
}) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { isLoaded } = useSystemStore(loaderSelector)
    const updateTheme = () => {
        setTheme(theme === 'dark' || resolvedTheme === 'dark' ? 'light' : 'dark')
    };
    // ref: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API#controlling_animations_with_javascript
    const handleClick: ButtonProps["onPress"] = (event) => {

        // Fallback for browsers that don’t support this API:
        if (!('startViewTransition' in document)) {
            updateTheme()
            return
        }
        const { left, top, width, height } = event.target.getBoundingClientRect()

        // Get the click position, or fallback to the middle of the screen
        const x = (left + (width / 2)) || innerWidth / 2
        const y = (top + (height / 2)) || innerHeight / 2
        // Get the distance to the furthest corner
        const endRadius = Math.hypot(
            Math.max(x, innerWidth - x),
            Math.max(y, innerHeight - y),
        );

        const $document = document as Document & {
            startViewTransition(callback?: () => void | Promise<void>): any
        }

        // Create a transition:
        const transition = $document.startViewTransition(() => {
            updateTheme()
        })

        // Wait for the pseudo-elements to be created:
        transition.ready.then(() => {
            // Animate the root’s new view
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0 at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 500,
                    easing: 'ease-in',
                    // Specify which pseudo-element to animate
                    pseudoElement: '::view-transition-new(root)',
                },
            )
        })
    };

    return (
        <Button
            title='Toggles light & dark'
            aria-label='auto'
            aria-live='polite'
            type='button'
            onPress={handleClick}
            isIconOnly
            variant='light'
            className='text-default-700'
            radius='full'
            isLoading={!isLoaded}
        >
            {
                resolvedTheme === 'light' ? (
                    <Sun size={25} />
                ) : (
                    <Moon
                        size={25}
                    />
                )
            }
        </Button>
    )
}

export default SwitchTheme;