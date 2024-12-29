"use client"
import { bookingRoomSelector } from "@/hooks/selectors/roomSelector";
import { BookingRoomStore } from "@/hooks/stores/roomStore";
import useDictionary from "@/hooks/useDictionary";
import useRoomStore from "@/hooks/useRoomStore";
import { formatPrice } from "@/utils/dom.util";
import { Divider, Spacer } from "@nextui-org/react";
import React from "react"

interface PriceDetailProps {
    prices: ReturnType<BookingRoomStore["handleBookingPrice"]>
}

const PriceDetail: React.FC<PriceDetailProps> = ({
    prices
}) => {
    const unitMsg = useDictionary("common", d => d.units.items).t;
    const priceMsg = useDictionary("common", d => d.prices).t;
    const { d } = useDictionary("book", d => d.price);
    const feeMsg = useDictionary("common", d => d.fees).t;
    const offerMsg = useDictionary("common", d => d.offers).t;
    const { bookForm } = useRoomStore(bookingRoomSelector);

    return (
        <div className="w-full">
            <h2 className="text-xl font-medium">
                {d?.title}
            </h2>
            <Spacer y={6} />
            <div className="flex flex-col gap-y-4">
                <div className="w-full flex justify-between items-center">
                    <span className="underline">
                        {formatPrice(prices.basePrice, {
                            maximumFractionDigits: 2
                        })} x {bookForm.totalNight} {unitMsg("night")}
                    </span>
                    <span>
                        {formatPrice(prices.totalBasePrice, {
                            maximumFractionDigits: 2
                        })}
                    </span>
                </div>
                {
                    prices.totalDiscount !== 0 && (
                        <div className="flex justify-between items-center font-normal">
                            <span>
                                {offerMsg("SpecialOffer")}
                            </span>
                            <span className="text-success">
                                -{formatPrice(prices.totalDiscount, {
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>
                    )
                }
                {
                    prices.cleaningCharge !== 0 && (
                        <div className="flex justify-between items-center font-normal">
                            <span>
                                {feeMsg("cleaningFee")}
                            </span>
                            <span>
                                {formatPrice(prices.cleaningCharge, {
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>
                    )
                }
                {
                    prices.serviceFee !== 0 && (
                        <div className="flex justify-between items-center font-normal">
                            <span>
                                {feeMsg("serviceFee")}
                            </span>
                            <span>
                                {formatPrice(prices.serviceFee, {
                                    maximumFractionDigits: 2
                                })}
                            </span>
                        </div>
                    )
                }
                <Divider />
                <div className="flex justify-between items-center font-medium">
                    <span>
                        {priceMsg("total")} (USD)
                    </span>
                    <span>
                        {formatPrice(prices.totalCost, {
                            maximumFractionDigits: 2
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PriceDetail;