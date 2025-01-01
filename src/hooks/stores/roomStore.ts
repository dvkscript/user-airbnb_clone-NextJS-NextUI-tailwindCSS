import { createStore, StateCreator } from "zustand";
import { Discount, Fee } from "@/types";
import { Discount as DiscountEnum } from "@/enum/room";
import { RangeCalendarProps } from "@nextui-org/react"
import { formatDate } from "@/utils/dom.util";
import { CalendarDate } from "@internationalized/date";
import { differenceInDays } from "date-fns";

const step0 = (roomId: string) => ([
    { name: "overview", pathname: "/become-a-host/overview" },
    { name: "overview", pathname: `/become-a-host/${roomId}/overview` }
].map((s) => ({ ...s, step: 0, task: 1 })));

const step1 = (roomId: string) => ([
    { name: "about-your-place", pathname: `/become-a-host/${roomId}/about-your-place` },
    { name: "structure", pathname: `/become-a-host/${roomId}/structure` },
    { name: "privacy-type", pathname: `/become-a-host/${roomId}/privacy-type` },
    { name: "location", pathname: `/become-a-host/${roomId}/location` },
    { name: "floor-plan", pathname: `/become-a-host/${roomId}/floor-plan` },
].map((s, index) => ({ ...s, step: 1, task: index + 1 })));

const step2 = (roomId: string) => ([
    { name: "stand-out", pathname: `/become-a-host/${roomId}/stand-out` },
    { name: "amenities", pathname: `/become-a-host/${roomId}/amenities` },
    { name: "photos", pathname: `/become-a-host/${roomId}/photos` },
    { name: "title", pathname: `/become-a-host/${roomId}/title` },
    { name: "description", pathname: `/become-a-host/${roomId}/description` },
].map((s, index) => ({ ...s, step: 2, task: index + 1 })));

const step3 = (roomId: string) => ([
    { name: "finish-setup", pathname: `/become-a-host/${roomId}/finish-setup` },
    { name: "instant-book", pathname: `/become-a-host/${roomId}/instant-book` },
    { name: "price", pathname: `/become-a-host/${roomId}/price` },
    { name: "discount", pathname: `/become-a-host/${roomId}/discount` },
    { name: "receipt", pathname: `/become-a-host/${roomId}/receipt` },
].map((s, index) => ({ ...s, step: 3, task: index + 1 })));

export const roomCreationPathnames = (roomId: string = ":roomId") => ([
    ...step0(roomId),
    ...step1(roomId),
    ...step2(roomId),
    ...step3(roomId),
    { name: "hosting", pathname: `/hosting`, step: 4, task: 1 },
]);

type Tasks = ReturnType<typeof roomCreationPathnames>;

const initializeCreationRoomStore = {
    isNextDisabled: true,
    isNextLoading: false,
    isBackDisabled: false,
    isBackLoading: false,
    setNextRoomCreationTask: () => { },
    setBackRoomCreationTask: () => { },
    roomCreationPathnames: {
        nextTask: null as Tasks[number] | null,
        backTask: null as Tasks[number] | null,
        currentTask: null as Tasks[number] | null,
        tasks: roomCreationPathnames() as Tasks
    }
};

const creationRoomStore = (set: Set, get: Get) => ({
    ...initializeCreationRoomStore,
    setIsNextLoading(isNextLoading: typeof this.isNextLoading) { set({ isNextLoading }) },
    setIsBackLoading(isBackLoading: typeof this.isBackLoading) { set({ isBackLoading }) },
    setIsNextDisabled(isNextDisabled: typeof this.isNextDisabled) { set({ isNextDisabled }) },
    setIsBackDisabled(isBackDisabled: typeof this.isBackDisabled) { set({ isBackDisabled }) },
    setValues: (values: Partial<typeof initializeCreationRoomStore>) => set({ ...values }),
    setRoomCreationPathnames: (roomId: string, currentPathname: string) => {
        const result = get().roomCreationPathnames;
        result.currentTask = null;

        if (roomId) {
            const tasks = roomCreationPathnames((roomId || "").toString());

            const currentStepIndex = tasks.findIndex((t) => t.pathname === currentPathname);

            if (currentStepIndex === -1) {
                return result;
            };

            result.nextTask = tasks[currentStepIndex + 1];
            result.backTask = tasks[currentStepIndex - 1];
            result.currentTask = tasks[currentStepIndex];
            result.tasks = tasks;
        };

        set({
            roomCreationPathnames: result
        });
    },
    onResetRoomCreation: () => {
        set({ ...initializeCreationRoomStore })
    },
    calculateRoomPricing: (basePrice: number, fee: Fee | undefined | null) => {
        const priceDetails = {
            basePrice,
            totalCost: basePrice,
            applicationFee: 0,
            serviceFee: 0,
            hostEarnings: 0
        };

        if (!fee) {
            return priceDetails;
        }

        const applicationFeeRate = +fee.app_fee || 0;
        const serviceFeeRate = +fee.service_fee || 0;

        const applicationFee = basePrice * applicationFeeRate;
        const serviceFee = Math.round(basePrice * serviceFeeRate);
        const totalCost = basePrice + serviceFee;
        const hostEarnings = Math.round(basePrice - applicationFee);

        return {
            ...priceDetails,
            applicationFee,
            serviceFee,
            totalCost,
            hostEarnings
        };
    }
});

const bookingRoomStore = (set: Set, get: Get) => ({
    maxGuest: 16,
    bookForm: {
        dates: null as RangeCalendarProps["value"],
        guests: 1,
        adults: 1,
        children: 0,
        infants: 0,
        pets: 0,
        totalNight: 0,
    },
    searchParamKeys: {
        checkIn: "check-in",
        checkout: "checkout",
        guests: "guests",
        children: "children",
        adults: "adults",
        infants: "infants",
        pets: "pets"
    },
    setMaxGuest(maxGuest: typeof this.maxGuest) {
        set({
            maxGuest
        })
    },
    setBookForm(bookForm: Omit<typeof this.bookForm, "totalNight" | "guests">) {
        const maxGuest = get().maxGuest;
        let adults = bookForm.adults;
        let children = bookForm.children;
        const infants = Math.min(5, Math.max(0, bookForm.infants));
        const pets = Math.min(5, Math.max(0, bookForm.pets));

        let guests = bookForm.adults + bookForm.children;
        
        const dates = bookForm.dates;

        if (guests > maxGuest) {
            adults = maxGuest;
            children = 0;
        } else if (guests < 1) {
            adults = 1;
            children = 0;
        };

        guests = adults + children;

        let totalNight = 0;

        if (dates) {
            const startDate = new Date(dates.start.toString());
            const endDate = new Date(dates.end.toString());

            totalNight = differenceInDays(endDate, startDate);
        };

        const values = {
            guests,
            adults,
            children,
            infants,
            pets,
            dates,
            totalNight
        };

        set({
            bookForm: values
        });

        return values;
    },
    setBookValue<T extends Omit<typeof this.bookForm, "totalNight" | "guests">, K extends keyof T>(key: K, value: T[K]) {
        const prevBookForm = get().bookForm;

        get().setBookForm({
            ...prevBookForm,
            [key]: value
        })
    },
    setBookFormBySearchParams(
        searchParams: URLSearchParams,
        minDate: NonNullable<RangeCalendarProps["minValue"]>,
    ) {
        const searchKeys = get().searchParamKeys;
        const search = new URLSearchParams(searchParams);
        const checkIn = search.get(searchKeys.checkIn);
        const checkout = search.get(searchKeys.checkout);
        const guests = Number(search.get(searchKeys.guests)) || 1;

        const bookForm = {
            dates: null,
            adults: parseInt(`${Number(search.get(searchKeys.adults)) || guests}`),
            children: parseInt(`${Number(search.get(searchKeys.children)) || 0}`),
            infants: parseInt(`${Number(search.get(searchKeys.infants)) || 0}`),
            pets: parseInt(`${Number(search.get(searchKeys.pets)) || 0}`)
        } as Omit<typeof this.bookForm, "totalNight" | "guests">;

        const dateFormat = 'yyyy-mm-dd';

        if (checkIn && checkout && formatDate(checkIn, dateFormat) && formatDate(checkout, dateFormat)) {
            const checkInDate = new Date(checkIn);
            const checkoutDate = new Date(checkout);
            const minDateParse = new Date(minDate.toString());
            
            if (isNaN(checkInDate.getTime()) || isNaN(checkoutDate.getTime())) return null;
            const checkInTime = checkInDate.getTime();
            const checkoutTime = checkoutDate.getTime();
            const minTime = minDateParse.getTime();
            
            if (
                minTime > checkInTime ||
                checkInTime >= checkoutTime
            ) return null;
            bookForm.dates = {
                start: new CalendarDate(checkInDate.getFullYear(), checkInDate.getMonth() + 1, checkInDate.getDate()) as any,
                end: new CalendarDate(checkoutDate.getFullYear(), checkoutDate.getMonth() + 1, checkoutDate.getDate()) as any
            }
        };

        return get().setBookForm(bookForm)
    },
    handleBookingPrice(basePrice: number, totalNight: number, fee: Fee, roomDiscounts: Discount[]) {
        // Chuyển đổi discounts thành một đối tượng dễ tra cứu
        const discounts = roomDiscounts.reduce((acc: Record<string, Discount>, item) => {
            acc[item.conditions] = item;
            return acc;
        }, {});

        let maxDiscount = 0;
        const discountsArray = [];

        // Lấy các loại giảm giá
        const newUserDiscount = discounts[DiscountEnum.NEW_USER];
        const weeklyDiscount = discounts[DiscountEnum.WEEKLY];
        const monthlyDiscount = discounts[DiscountEnum.MONTHLY];

        // Tính toán giảm giá
        if (newUserDiscount) {
            discountsArray.push(basePrice * newUserDiscount.percent);
        }
        if (totalNight > 28 && monthlyDiscount) {
            discountsArray.push(basePrice * monthlyDiscount.percent);
        }
        if (totalNight > 5 && weeklyDiscount) {
            discountsArray.push(basePrice * weeklyDiscount.percent);
        }

        // Tìm giá trị giảm giá lớn nhất
        maxDiscount = Math.max(0, ...discountsArray);

        // Tổng giảm giá
        const totalDiscount = maxDiscount * totalNight;

        // Các giá trị tính toán
        const totalBasePrice = basePrice * totalNight; // Tổng giá cơ bản trước giảm giá
        const serviceFee = totalBasePrice * fee.app_fee; // Phí dịch vụ ứng dụng
        const cleaningCharge = totalBasePrice * fee.service_fee; // Phí vệ sinh (đúng phải là giá thuế nhưng ở đây chưa có mục giá vệ sinh nên làm đại :v)
        const discountedNightPrice = basePrice - maxDiscount; // Giá 1 đêm sau giảm giá

        // Tổng chi phí
        const totalCost = (totalBasePrice - totalDiscount) + serviceFee + cleaningCharge;

        return {
            basePrice,
            totalBasePrice,
            serviceFee,
            cleaningCharge,
            totalCost,
            totalDiscount,
            discountedNightPrice
        };
    }
})

const commonStore = (set: Set) => ({
    room: null as any | null,
    setRoom(room: typeof this.room) {
        if (room?.photos && Array.isArray(room.photos) && typeof room.photos[0]?.position === "number") {
            room.photos = room.photos.sort((a: any, b: any) => a.position - b.position)
        }

        set({ room })
    },
})

const stores: StateCreator<RoomStore> = (set, get) => ({
    ...creationRoomStore(set, get),
    ...bookingRoomStore(set, get),
    ...commonStore(set),
});

export const roomStore = createStore<RoomStore>(stores);

export type CreationRoomStore = ReturnType<typeof creationRoomStore>;
export type CommonRoomStore = ReturnType<typeof commonStore>;
export type BookingRoomStore = ReturnType<typeof bookingRoomStore>;

export interface RoomStore extends
    CreationRoomStore,
    BookingRoomStore,
    CommonRoomStore { }

type StoresParams = Parameters<typeof stores>;

type Set = StoresParams["0"];
type Get = StoresParams["1"];