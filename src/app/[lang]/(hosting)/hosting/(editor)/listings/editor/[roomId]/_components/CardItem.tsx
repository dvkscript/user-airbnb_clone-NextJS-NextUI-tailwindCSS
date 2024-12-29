"use client"
import useUrl from "@/hooks/useUrl";
import { cn } from "@/utils/dom.util";
import { Card, CardBody, CardHeader } from "@nextui-org/react";
import React from "react"

interface CardItemProps {
  title: string;
  children: React.ReactNode;
  href: string;
}

const CardItem: React.FC<CardItemProps> = ({
  title,
  children,
  href,
}) => {

  const { pathname } = useUrl();

  return (
    <Card 
      className={cn(
        "p-[22px] border-2 text-base",
        pathname === href ? "border-default-800" : "border-transparent"
      )}
      as={"a"}
      href={href}
    >
      <CardHeader className="p-0">
        <span className="font-medium">
          {title}
        </span>
      </CardHeader>
      <CardBody className="flex-col gap-y-3 p-0 overflow-visible">
        {children}
      </CardBody>
    </Card>
  );
};

export default CardItem;