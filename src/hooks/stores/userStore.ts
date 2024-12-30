import { Permissions } from "@/enum/permissions.enum";
import { GetProfile } from "@/services/user.service";
import { createStore, StateCreator } from "zustand";

const profileUserStore = (set: Set) => ({
    profile: null as GetProfile | null,
    setProfile(profile: typeof this.profile) {
        set({
            profile,
            isAdmin: !profile ? false : profile.permissions.includes(Permissions.ADMIN_ACCESS)
        });
    }
})

const commonStore = () => ({
    isAdmin: false,
})

const stores: StateCreator<UserStore> = (set) => ({
    ...profileUserStore(set),
    ...commonStore(),
});

export const userStore = createStore<UserStore>(stores);

export type ProfileUserStore = ReturnType<typeof profileUserStore>;
export type CommonUserStore = ReturnType<typeof commonStore>;

export interface UserStore extends
    ProfileUserStore,
    CommonUserStore { }

type StoresParams = Parameters<typeof stores>;

type Set = StoresParams["0"];
// type Get = StoresParams["1"]