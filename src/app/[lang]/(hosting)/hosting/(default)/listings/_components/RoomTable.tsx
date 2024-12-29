"use client"
import { locationSelector } from "@/hooks/selectors/systemSelector";
import useSystemStore from "@/hooks/useSystemStore";
import { Dictionary } from "@/libs/dictionary.lib";
import { GetUserRoomAndCountAll } from "@/services/user.service";
import { cn } from "@/utils/dom.util";
import { Image, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { ChevronRight } from "lucide-react";
import React, { memo, useMemo } from "react"
import StatusChip from "./StatusChip";

interface RoomTableProps {
    rooms: GetUserRoomAndCountAll["rows"];
    onClickTableRow?: (room: RoomTableProps["rooms"][number]) => void;
    titleNull: string;
    msg: Dictionary["hosting"]["listings"]["table"];
}

const RoomTable: React.FC<RoomTableProps> = ({
    rooms,
    onClickTableRow,
    titleNull,
    msg,
}) => {
    const columns = useMemo(() => ([
        { name: msg?.thead.listing, uid: "listing" },
        { name: msg?.thead.location, uid: "location" },
        { name: msg?.thead.status, uid: "status" },
        { name: "", uid: "icon" },
    ]), [msg]);
    const { countries } = useSystemStore(locationSelector);

    return (
        <Table
            isCompact
            removeWrapper
            aria-label="Example table with custom cells, pagination and sorting"
            bottomContentPlacement="outside"
            checkboxesProps={{
                classNames: {
                    wrapper: "after:bg-foreground after:text-background text-background",
                },
            }}
            classNames={{
                wrapper: ["max-h-[382px]", "max-w-3xl"],
                th: ["bg-transparent", "text-sm"],
                base: ["text-sm"],
                td: ["text-sm", "p-3", "dark:group-aria-[selected=false]:group-data-[hover=true]:before:bg-default-200"]
            }}
            selectionMode="single"
            topContentPlacement="outside"
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        align={column.uid === "icon" ? "center" : "start"}
                        key={column.uid}
                        className={cn(
                            column.uid === "icon" && "w-16", column.uid === "listing" && "w-1/2",
                            column.uid !== "listing" && "hidden md:table-cell"
                        )}
                    >
                        <span className="-ml-2 py-2 px-3 rounded-full hover:bg-default-100 dark:hover:bg-default-200">
                            {column.name}
                        </span>
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody emptyContent={""}>
                {
                    rooms.map((room) => (
                        <TableRow
                            key={room.id}
                            onClick={() => {
                                if (onClickTableRow) onClickTableRow(room)
                            }}
                            className="cursor-pointer"
                            data-selected="false"
                            aria-selected="false"
                        >
                            <TableCell data-selected="false" className="justify-start">
                                <div className="flex items-center justify-center w-fit gap-x-5">
                                    <div className="size-16 bg-default-200 rounded overflow-hidden">
                                        {
                                            room?.photos[0] && (
                                                <Image
                                                    width={"100%"}
                                                    className="min-w-16 w-full object-cover z-0 inset-0 h-full"
                                                    classNames={{
                                                        wrapper: "w-full h-full"
                                                    }}
                                                    radius="none"
                                                    alt={room.title || titleNull}
                                                    src={room.photos[0].url}
                                                />
                                            )
                                        }
                                    </div>
                                    <p className="text-sm font-medium text-wrap text-default-700">
                                        {room.title || titleNull}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell data-selected="false" className="hidden md:table-cell">
                                {[room.address?.province, countries[room.address?.country_code as keyof typeof countries]?.native].filter(c => c).join(", ")}
                            </TableCell>
                            <TableCell data-selected="false" className="hidden md:table-cell">
                                <StatusChip
                                    room={room}
                                    className="gap-x-2"
                                    variant="light"
                                />
                            </TableCell>
                            <TableCell data-selected="false" className="hidden md:table-cell">
                                <ChevronRight
                                    size={20}
                                    strokeWidth={2.5}
                                    className="mx-auto text-default-600 opacity-0 invisible group-hover:visible group-hover:opacity-100"
                                />
                            </TableCell>
                        </TableRow>
                    ))
                }
            </TableBody>
        </Table>
    );
};

export default memo(RoomTable);