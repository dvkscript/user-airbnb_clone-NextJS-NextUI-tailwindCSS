import React from 'react';
import PhotoClient from './PhotoClient';

interface PhotoPageProps {
    params: {
        roomId: string
    }
}

const PhotoPage: React.FC<PhotoPageProps> = ({
                                                 params: {
                                                     roomId
                                                 }
                                             }) => {
    return (
        <PhotoClient roomId={roomId}/>
    );
};

export default PhotoPage;