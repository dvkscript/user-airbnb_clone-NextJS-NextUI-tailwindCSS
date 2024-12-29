"use client"
import React, {FC, useState} from 'react'
import { Image as ImageDefault, ImageProps as ImageDefaultProps } from "@nextui-org/react";
import { imageNotFound } from '@/configs/valueDefault.config';

interface ImageProps extends Omit<ImageDefaultProps, "src" | "onLoad"> {
    defaultUrl?: string;
    src: string;
    onLoad?: (isLoaded: boolean) => void;
}
const Image: FC<ImageProps> = ({
    defaultUrl,
    src,
    onLoad,
    ...props
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);


    const handleImageLoad = () => {
        setLoading(false);
        setError(false);
        if (onLoad) onLoad(false);
    };

    const handleImageError = () => {
        setLoading(false);
        setError(true);
        if (onLoad) onLoad(false)
    };

    return (
        <>
            {error || !src ? (
                <ImageDefault src={defaultUrl || imageNotFound} alt="Image not found" {...props} />
            ) : (
                <ImageDefault
                    {...props}
                    src={src}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    isLoading={loading}
                />
            )}
        </>
    )
}

export default Image