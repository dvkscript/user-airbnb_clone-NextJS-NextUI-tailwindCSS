import React from 'react';
import FloorPlanClient from './FloorPlanClient';
import { Params } from 'next/dist/shared/lib/router/utils/route-matcher';

interface FloorPlanProps {
  params: Params
}

const FloorPlan: React.FC<FloorPlanProps> = ({ 
  params: {
    roomId
  }
}) => {

  return (
    <FloorPlanClient roomId={roomId} />
  );
};

export default FloorPlan;