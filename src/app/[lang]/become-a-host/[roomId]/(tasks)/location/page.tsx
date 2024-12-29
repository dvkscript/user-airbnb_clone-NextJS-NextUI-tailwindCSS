import React from 'react';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import LocationClient from './LocationClient';

interface LocationPageProps {
    params: Params
}

const LocationPage = async ({
    params: {
        roomId,
    }
}: LocationPageProps) => {

    return (
        <LocationClient
            roomId={roomId}
        />
    );
};

export default LocationPage;