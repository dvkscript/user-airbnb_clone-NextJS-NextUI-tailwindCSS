"use client"
import Container from "@/components/Common/Container";
import useDebounce from "@/hooks/useDebounce";
import useDictionary from "@/hooks/useDictionary";
import useUrl from "@/hooks/useUrl";
import { Dictionary } from "@/libs/dictionary.lib";
import { GetUserRoomAndCountAll } from "@/services/user.service";
import { Button, Input } from "@nextui-org/react";
import { LayoutGrid, Plus, Search, StretchHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react"
import RoomBox from "./_components/RoomBox";
import RoomTable from "./_components/RoomTable";
import LocalStorageConfig from "@/configs/localstorage.config";
import { cn } from "@/utils/dom.util";
import NoData from "./_components/NoData";
import ModalAction from "./_components/ModalAction";

const layoutTableValues = LocalStorageConfig.userRoomLayout.values;

interface ListingClientProps {
    rooms: GetUserRoomAndCountAll["rows"];
    roomCount: GetUserRoomAndCountAll["count"];
}

const ListingClient: React.FC<ListingClientProps> = ({
    rooms,
}) => {

    const { t, d } = useDictionary<"hosting", Dictionary["hosting"]["listings"]>("hosting", d => d.listings);
    const router = useRouter();
    const { searchParams } = useUrl()
    const query = searchParams.get("q") || null;
    const [searchValue, setSearchValue] = useState<string | null>(query);
    const searchDebounce = useDebounce(searchValue, 300);
    const [layoutTable, setLayoutTable] = useState<string | null>(null);
    const [roomSelected, setRoomSelected] = useState<ListingClientProps["rooms"][number] | null>(null);

    const handleAddRoom = useCallback(() => {
        router.push("/become-a-host")
    }, [router]);

    const handleLayoutTableChange = useCallback(() => {
        let value = layoutTable
        if (layoutTable === layoutTableValues.grid) {
            value = layoutTableValues.table;
        } else {
            value = layoutTableValues.grid;
        }
        setLayoutTable(value);
        localStorage.setItem(LocalStorageConfig.userRoomLayout.name, value)
    }, [layoutTable]);

    const handleClickRoom = useCallback((room: ListingClientProps["rooms"][number]) => {
        setRoomSelected(room);
    }, [])

    useEffect(() => {
        if (query === searchDebounce) return;
        const newSearchParams = new URLSearchParams(searchParams);
        if (searchDebounce) {
            newSearchParams.set("q", searchDebounce);
        } else {
            if (!query) return
            newSearchParams.delete("q");
        }
        router.replace(`?${newSearchParams.toString()}`)
    }, [searchDebounce, searchParams, router, query]);

    useEffect(() => {
        const value = localStorage.getItem(LocalStorageConfig.userRoomLayout.name);
        if (layoutTableValues[value as keyof typeof layoutTableValues]) {
            setLayoutTable(value)
        } else {
            setLayoutTable(layoutTableValues.grid);
        }
    }, [])

    if (!layoutTable || !d) return null;

    return (
        <Container maxWidth={2000}>
            <section className="w-full h-full flex flex-col pt-16">
                <header className="flex justify-between items-center w-full gap-x-5 lg:gap-x-24 mb-10">
                    <h1 className={cn(
                        "text-title",
                        typeof searchValue === "string" && "hidden md:block"
                    )}>
                        {t("title")}
                    </h1>
                    <div className="flex justify-end items-center gap-x-3 flex-1">
                        {
                            searchValue === null ? (
                                <Button
                                    isIconOnly
                                    radius="full"
                                    variant="flat"
                                    className="bg-default-100 dark:bg-default-200 hover:bg-default-200 dark:hover:bg-default-300 hover:opacity-100 size-11 w-11 h-11 min-w-11"
                                    onPress={() => setSearchValue("")}
                                >
                                    <Search size={18} />
                                </Button>
                            ) : (
                                <Input
                                    type="text"
                                    fullWidth
                                    value={searchValue}
                                    variant="bordered"
                                    radius="full"
                                    startContent={<Search size={16} />}
                                    placeholder="Tìm kiếm nhà/phòng cho thuê theo tên hoặc địa điểm"
                                    classNames={{
                                        inputWrapper: "h-11",
                                        clearButton: "block opacity-100"
                                    }}
                                    isClearable
                                    onValueChange={setSearchValue}
                                    onClear={() => {
                                        setSearchValue(null)
                                    }}
                                />
                            )
                        }
                        <Button
                            isIconOnly
                            radius="full"
                            variant="flat"
                            className={cn(
                                "bg-default-100 dark:bg-default-200 hover:bg-default-200 dark:hover:bg-default-300 hover:opacity-100 size-11 w-11 h-11 min-w-11",
                                typeof searchValue === "string" && "hidden md:flex"
                            )}
                            onPress={handleLayoutTableChange}
                        >
                            {
                                layoutTable === layoutTableValues.grid ? (
                                    <StretchHorizontal size={18} />
                                ) : (
                                    <LayoutGrid size={18} />
                                )
                            }
                        </Button>
                        <Button
                            isIconOnly
                            radius="full"
                            variant="flat"
                            className={cn(
                                "bg-default-100 dark:bg-default-200 hover:bg-default-200 dark:hover:bg-default-300 hover:opacity-100 size-11 w-11 h-11 min-w-11",
                                typeof searchValue === "string" && "hidden md:flex"
                            )}
                            onPress={handleAddRoom}
                        >
                            <Plus size={20} />
                        </Button>
                    </div>
                </header>
                {
                    rooms.length === 0 ? (
                        <NoData msg={d["no-data"]} />
                    ) : (
                        layoutTable === layoutTableValues.grid ? (
                            <ol
                                className={cn(
                                    "w-full grid grid-cols-4 gap-6"
                                )}
                            >
                                {
                                    rooms.map((room) => (
                                        <RoomBox
                                            key={room.id}
                                            room={room}
                                            titleNull={t("room-title")}
                                            onClickBox={handleClickRoom}
                                        />
                                    ))
                                }
                            </ol>
                        ) : (
                            <div
                                className={cn(
                                    "w-full"
                                )}
                            >
                                <RoomTable
                                    rooms={rooms}
                                    titleNull={t("room-title")}
                                    msg={d.table}
                                    onClickTableRow={handleClickRoom}
                                />
                            </div>
                        )
                    )
                }
                <ModalAction
                    onClose={() => {
                        setRoomSelected(null)
                    }}
                    titleNull={t("room-title")}
                    room={roomSelected}
                    dictionary={d.modal}
                />
            </section>
        </Container>
    );
};

export default ListingClient;