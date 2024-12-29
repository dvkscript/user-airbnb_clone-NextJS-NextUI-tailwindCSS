import React from 'react';
import Categories from './_components/Categories';
import { getStructureAndCountAll } from '@/services/structure.service';

interface HomeLayoutProps {
    children: React.ReactNode;
}

const HomeLayout = async ({
    children,
}: HomeLayoutProps) => {

    const structureRes = await getStructureAndCountAll({
        limit: "all"
    });

    if (!structureRes.ok) {
        throw new Error(structureRes.status.toString());
    }

    const structures = structureRes.data?.rows ?? [];

    return (
        <>
            <Categories structures={structures} />
            <main className='min-h-full h-full'>
                {children}
            </main>
        </>
    );
};

export default HomeLayout;