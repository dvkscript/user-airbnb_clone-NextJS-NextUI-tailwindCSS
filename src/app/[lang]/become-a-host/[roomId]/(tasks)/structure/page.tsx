import React from 'react';
import StructureClient from './StructureClient';
import { getStructureAndCountAll } from '@/services/structure.service';

interface StructurePageProps {
    params: {
        roomId: string;
    }
}

const StructurePage = async ({
    params: {
        roomId
    }
}: StructurePageProps) => {
    const structure = await getStructureAndCountAll({
        limit: "all"
    });

    return (
        <StructureClient
            structures={structure.data?.rows ?? []}
            roomId={roomId}
        />
    );
};

export default StructurePage;