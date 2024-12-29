import { UseStore } from "zustand/type";
import { userStore, UserStore } from "./stores/userStore";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

const useUserStore: UseStore<UserStore> = (selector) => {
    const store = useStore(userStore, useShallow(selector));

    return store;
}

export default useUserStore;