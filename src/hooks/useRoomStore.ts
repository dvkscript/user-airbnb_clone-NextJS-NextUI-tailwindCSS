import { useStore, } from "zustand"
import { useShallow } from "zustand/shallow"
import { roomStore, RoomStore } from "./stores/roomStore"
import { UseStore } from "zustand/type";

const useRoomStore: UseStore<RoomStore> = (selector) => {
    const store = useStore(roomStore, useShallow(selector));
    return store;
}

export default useRoomStore;