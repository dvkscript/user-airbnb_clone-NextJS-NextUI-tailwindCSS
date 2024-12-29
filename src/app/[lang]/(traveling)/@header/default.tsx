import React from "react"
import HeaderClient from "./HeaderClient";

interface HeaderDefaultProps {
    params: {
        lang: string
    }
}

const HeaderDefault = async ({ }: HeaderDefaultProps) => {

    return (
        <HeaderClient />
    );
};

export default HeaderDefault;