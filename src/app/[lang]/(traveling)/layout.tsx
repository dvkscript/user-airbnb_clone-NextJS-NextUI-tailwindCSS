import React from "react";
import TravelingLayoutClient from "./TravelingLayoutClient";
import { getHeaderValue } from "@/libs/next-headers";

interface TravelingLayoutProps {
    children: React.ReactNode;
    header: React.ReactNode;
    footer: React.ReactNode;
}

const TravelingLayout = async ({
    children,
    header,
    footer
}: TravelingLayoutProps) => {
    const isAuthorization = getHeaderValue("isAuthorization") || false;
        
    return (
        <TravelingLayoutClient isAuthorization={isAuthorization}>
            {header}
            {children}
            {footer}
        </TravelingLayoutClient>
    )
};

export default TravelingLayout;