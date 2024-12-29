import { getRoomAndCountAll } from '@/services/room.service';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';
import React from 'react';
import { getWishlists } from '@/services/user.service';
import { getHeaderValue } from '@/libs/next-headers';
import HomeClient from './HomeClient';
import { getStructureAndCountAll } from '@/services/structure.service';

interface HomePageProps {
  searchParams: Params;
  params: Params;
}

const HomePage = async ({
  searchParams,
}: HomePageProps) => {
  const isAuthorization = getHeaderValue("isAuthorization");
  searchParams = {
    ...searchParams,
    limit: 24
  }
  const [roomRes, wishlistRes, structuresRes] = await Promise.all([
    getRoomAndCountAll(searchParams),
    isAuthorization ? getWishlists() : null,
    getStructureAndCountAll({
      limit: "all"
    })
  ]);

  ;

  if (!roomRes.ok) {
    throw new Error(roomRes.status.toString());
  } else if (!structuresRes.ok) {
    throw new Error(structuresRes.status.toString());
  } else if (wishlistRes && !wishlistRes.ok && wishlistRes.status !== 401) {
    throw new Error(wishlistRes.status.toString());
  };

  const rooms = roomRes.data?.rows ?? [];
  const roomCount = roomRes.data?.count || 0;
  const wishlists = wishlistRes?.data ?? [];
  const drawerOpen = JSON.parse(searchParams.drawer_open ?? "false");

  return (
    <>
      <HomeClient
        drawerOpen={drawerOpen}
        rooms={rooms}
        searchParams={searchParams}
        wishlists={wishlists}
        roomCount={roomCount}
      />
    </>
  );
};

export default HomePage;