import { addDays } from "date-fns";

const CookieConfig = Object.freeze({
    accessToken: {
        name: "k-airbnb-access-token",
        values: null,
    },
    refreshToken: {
        name: "k-airbnb-refresh-token",
        values: null
    },
    googleTranslate: {
        name: "googtrans",
        values: null
    },
    locale: {
        name: 'locale',
        values: null,
        expires: addDays(new Date(), 100),
        httpOnly: true,
    },
});

export default CookieConfig;