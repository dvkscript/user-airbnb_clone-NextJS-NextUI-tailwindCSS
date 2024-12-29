import React from 'react';
import { getAmenityAndCountAll } from "@/services/amenity.service";
import AmenityClient from "./AmenityClient";

interface AmenitiesPageProps {
  params: {
    roomId: string;
  }
}

const AmenitiesPage = async ({
  params: {
    roomId
  }
}: AmenitiesPageProps) => {
  const result = await getAmenityAndCountAll({
    limit: "all",
  });

  const amenities = result.data?.rows ?? [];

  return (
    <AmenityClient amenities={amenities} roomId={roomId} />
  );
};

export default AmenitiesPage;