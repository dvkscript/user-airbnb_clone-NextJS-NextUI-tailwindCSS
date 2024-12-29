import { Metadata } from "next";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher"
import React from "react"
import RoomDetailClient from "./RoomDetailClient";
import { getRoomDetail } from "@/services/room.service";
import { notFound } from "next/navigation";
import { getWishlists } from "@/services/user.service";
import { getHeaderValue } from "@/libs/next-headers";
import { getAmenityAndCountAll } from "@/services/amenity.service";

interface RoomDetailPageProps {
  params: Params;
  searchParams: Params
}

export async function generateMetadata(
  { params }: RoomDetailPageProps,
): Promise<Metadata | null> {
  const roomId = params?.roomId;
  const result = await getRoomDetail(roomId);

  if (result.status === 404) {
    return notFound();
  } else if (!result.ok) {
    return null
  }

  const room = result.data!;

  return {
    title: room.title,
  }
}

const RoomDetailPage = async ({
  params
}: RoomDetailPageProps) => {
  const isAuthorization = getHeaderValue("isAuthorization");
  const roomId = params?.roomId;
  const [roomRes, wishlistsRes, amenityRes] = await Promise.all([
    getRoomDetail(roomId),
    isAuthorization ? getWishlists() : null,
    getAmenityAndCountAll({
      limit: "all"
    })
  ]);

  if (!roomRes.ok) {
    throw new Error(roomRes.status.toString())
  } else if (!amenityRes.ok) {
    throw new Error(roomRes.status.toString())
  } else if (wishlistsRes && !wishlistsRes.ok && wishlistsRes.status !== 401) {
    throw new Error(wishlistsRes.status.toString())
  }

  const room = roomRes.data!;
  const wishlists = wishlistsRes?.data ?? [];
  const amenities = amenityRes.data!;

  return (
    <>
      <RoomDetailClient room={room} wishlists={wishlists} amenities={amenities} />
    </>
  );
};

export default RoomDetailPage;