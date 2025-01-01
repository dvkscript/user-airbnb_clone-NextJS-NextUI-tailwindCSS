"use client"
import Button from "@/components/Button";
import CardBookingCalendar from "@/components/Card/CardBookingCalendar";
import CardGuest from "@/components/Card/CardGuest";
import Translate from "@/components/Common/Translate";
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";
import useDictionary from "@/hooks/useDictionary";
import useRoomStore from "@/hooks/useRoomStore";
import useUrl from "@/hooks/useUrl";
import { GetRoomDetail } from "@/services/room.service";
import { capitalize } from "@/utils/dom.util";
import { getLocalTimeZone, today } from "@internationalized/date";
import { Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { useDateFormatter } from "@react-aria/i18n";
import { Dot } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react"

interface YourTripProps {
    room: GetRoomDetail;
}

const YourTrip: React.FC<YourTripProps> = ({
    room
}) => {
    const { d } = useDictionary("book", d => d.trip);
    const unitMsg = useDictionary("common", d => d.units.items).t;
    const btnMsg = useDictionary("common", d => d.buttons).t;
    const { bookForm, setBookFormBySearchParams, setMaxGuest } = useRoomStore(bookingRoomSelector);
    const [modalMode, setModalMode] = useState<"guests" | "days" | null>(null);
    const { searchParamsRef } = useUrl();
    const formMsg = useDictionary("common", d => d.forms).d;
    const dateFormat = useDateFormatter({
        day: "numeric",
        month: "short",
    });
    const router = useRouter();

    const minDate = useMemo(() => {
        const now = new Date();
        const currentHour = now.getHours();
        const timeZone = getLocalTimeZone();
        const currentDate = today(timeZone);

        if (currentHour >= 16) {
            return currentDate.add({ days: 1 });
        }
        return currentDate;
    }, []);

    const handleClose = useCallback(() => {
        setModalMode(null)
    }, []);

    useEffect(() => {
        const values = setBookFormBySearchParams(
            searchParamsRef.current,
            minDate,
        );

        if (!values) {
            router.replace(`/rooms/${room.id}`)
        }
    }, [searchParamsRef, setBookFormBySearchParams, minDate, router, room.id]);

    useEffect(() => {
        setMaxGuest(room.floorPlan.guests)
    }, [room.floorPlan.guests, setMaxGuest]);

    return (
        <div className="flex flex-col gap-y-6 w-full">
            <h2 className="text-xl font-medium">
                {d?.title}
            </h2>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-title-accent">
                        {capitalize(unitMsg("dates"))}
                    </h3>
                    {
                        !!bookForm.dates && (
                            <span className="text-description-accent text-accent">
                                {dateFormat.format(new Date(bookForm.dates.start.toString()))} - {dateFormat.format(new Date(bookForm.dates.end.toString()))}
                            </span>
                        )
                    }
                </div>
                <div>
                    <button
                        type="button"
                        className="underline font-medium"
                        onClick={() => setModalMode("days")}
                    >
                        {btnMsg("Edit")}
                    </button>
                </div>
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-title-accent">
                        {capitalize(unitMsg("guests"))}
                    </h3>
                    <span className="text-description-accent text-accent">
                        {
                            [
                                `${bookForm.guests} ${unitMsg("guest")}`,
                                bookForm.infants !== 0 && `${bookForm.infants} ${unitMsg("infants")}`,
                                bookForm.pets !== 0 && `${bookForm.pets} ${unitMsg("pets")}`,
                            ].filter((t) => !!t).join(", ")
                        }
                    </span>
                </div>
                <div>
                    <button
                        type="button"
                        className="underline font-medium"
                        onClick={() => setModalMode("guests")}
                    >
                        {btnMsg("Edit")}
                    </button>
                </div>
            </div>
            <Modal
                isOpen={modalMode === "days"}
                scrollBehavior="inside"
                onClose={handleClose}
                size={"2xl"}
            >
                <Translate isExcLocaleSystem isTrans>
                    <ModalContent>
                        <ModalBody className="pt-8 pb-4">
                            <CardBookingCalendar
                                minDate={minDate}
                                title={(
                                    `${bookForm.totalNight} ${unitMsg("night")}`
                                )}
                                description={
                                    <div className="flex items-center w-full">
                                        <span>
                                            {room.floorPlan.bedrooms}
                                            {" "}
                                            {unitMsg("bedroom")}
                                        </span>
                                        <Dot size={18} />
                                        <span>
                                            {room.floorPlan.bathrooms}
                                            {" "}
                                            {unitMsg("bath")}
                                        </span>
                                        <Dot size={18} />
                                        <span>
                                            {room.floorPlan.beds}
                                            {" "}
                                            {unitMsg("bed")}
                                        </span>
                                    </div>
                                }
                            />
                        </ModalBody>
                        <Divider />
                        <ModalFooter>
                            <Button
                                color="secondary"
                                onPress={() => setModalMode(null)}
                            >
                                {btnMsg("Save")}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Translate>
            </Modal>
            <Modal
                isOpen={modalMode === "guests"}
                scrollBehavior="inside"
                onClose={handleClose}
                size={"sm"}
            >
                <Translate isExcLocaleSystem isTrans>
                    <ModalContent>
                        <ModalHeader>
                            <h2>
                                {formMsg?.guests.label}
                            </h2>
                        </ModalHeader>
                        <ModalBody className="pt-0 pb-4">
                            <p className="text-sm text-accent pb-2">
                                {formMsg?.guests.maxGuest.replace("{{guest}}", room.floorPlan.guests.toString())}
                            </p>
                            <CardGuest />
                        </ModalBody>
                        <Divider />
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={handleClose}
                            >
                                {btnMsg("Close")}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Translate>
            </Modal>
        </div>
    );
};

export default YourTrip;