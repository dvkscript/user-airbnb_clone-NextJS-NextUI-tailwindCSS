import { Selector } from "zustand/type";
import { CommonUserStore, ProfileUserStore, UserStore } from "../stores/userStore";

export const profileSelector: Selector<UserStore, ProfileUserStore & {
    isAdmin: CommonUserStore["isAdmin"]
}> = (s) => ({
    profile: s.profile,
    setProfile: s.setProfile,
    isAdmin: s.isAdmin,
})