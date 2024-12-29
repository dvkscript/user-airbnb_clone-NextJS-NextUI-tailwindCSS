import { Selector } from "zustand/type";
import { BookingRoomStore, CreationRoomStore, RoomStore } from "../stores/roomStore";
import { GetUserRoom } from "@/services/user.service";

export const roomCreationSelector: Selector<RoomStore, CreationRoomStore & {
    room: GetUserRoom | null,
    setRoom: (room: GetUserRoom | null) => void,
}> = (s) => ({
    isBackDisabled: s.isBackDisabled,
    isBackLoading: s.isBackLoading,
    isNextDisabled: s.isNextDisabled,
    isNextLoading: s.isNextLoading,
    room: s.room,
    roomCreationPathnames: s.roomCreationPathnames,
    setRoomCreationPathnames: s.setRoomCreationPathnames,
    setBackRoomCreationTask: s.setBackRoomCreationTask,
    setNextRoomCreationTask: s.setNextRoomCreationTask,
    setRoom: s.setRoom,
    setValues: s.setValues,
    setIsBackDisabled: s.setIsBackDisabled,
    setIsBackLoading: s.setIsBackLoading,
    setIsNextDisabled: s.setIsNextDisabled,
    setIsNextLoading: s.setIsNextLoading,
    onResetRoomCreation: s.onResetRoomCreation,
    calculateRoomPricing: s.calculateRoomPricing,
});

export const roomEditorSelector: Selector<RoomStore, {
    room: GetUserRoom | null,
    setRoom: (room: GetUserRoom | null) => void
}> = (s) => ({
    room: s.room,
    setRoom: s.setRoom,
});

export const bookingRoomSelector: Selector<RoomStore, BookingRoomStore> = (s) => ({
    bookForm: s.bookForm,
    handleBookingPrice: s.handleBookingPrice,
    setBookForm: s.setBookForm,
    setBookValue: s.setBookValue,
    maxGuest: s.maxGuest,
    setMaxGuest: s.setMaxGuest,
    setBookFormBySearchParams: s.setBookFormBySearchParams,
    searchParamKeys: s.searchParamKeys
});