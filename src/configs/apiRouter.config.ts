const ApiRouter = Object.freeze({
    auth: {
        signIn: "/auth/sign-in",
        signUp: "/auth/sign-up",
        refreshToken: "/auth/refresh-token",
        signOut: "/auth/sign-out",
        providers: {
            github: {
                redirect: "/auth/github",
                callback: "/auth/github/callback"
            },
            google: {
                redirect: "/auth/google",
                callback: "/auth/google/callback"
            },
            facebook: {
                redirect: "/auth/facebook",
                callback: "/auth/facebook/callback"
            },
            email: {
                redirect: "/auth/email",
                callback: "/auth/email/callback"
            },
        }
    },
    user: {
        profile: "/user/profile",
        rooms: "/user/rooms",
        room: (roomId: string) => `/user/rooms/${roomId}`,
        wishlists: '/user/wishlists',
        wishlist: (wishlistId: string) => `/user/wishlists/${wishlistId}`
    },
    structure: {
        list: "/structures",
    },
    privacy: {
        list: "/privacies",
    },
    amenity: {
        list: "/amenities"
    },
    photo: {
        upload: "/upload/image",
        list: "/photos"
    },
    rooms: {
        list: "/rooms",
        room: (roomId: string) => `/rooms/${roomId}`,
        booking: (roomId: string) => `/rooms/${roomId}/booking`,
    },
    pay: {
        stripe: "/pay/stripe"
    }
});


export const ApiProviders = Object.keys(ApiRouter.auth.providers);

export default ApiRouter;