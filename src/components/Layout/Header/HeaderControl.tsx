"use client"
import Button from "@/components/Button";
import { SlidersHorizontal } from "lucide-react";
import React from "react"

const HeaderControl = ({ }) => {
  return (
    <>
      <Button
        isIconOnly
        radius="full"
        className="border"
        variant="bordered"
        data-pressed="false"
        disableRipple
        size="md"
      >
        <SlidersHorizontal size={16} strokeWidth={3} />
      </Button>
    </>
  );
};

export default HeaderControl;