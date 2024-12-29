"use client"
import Translate from "@/components/Common/Translate";
import { STRIPE_PUBLIC_KEY } from "@/configs/env.config";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import React from "react"

if (!STRIPE_PUBLIC_KEY) {
    throw new Error("STRIPE KEY not found")
};

const stripe = loadStripe(STRIPE_PUBLIC_KEY);

interface StripeProviderProps {
    options?: StripeElementsOptions;
    children?: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({
    options,
    children
}) => {

    const lang = useParams().lang
    const { resolvedTheme } = useTheme();

    return (
        <Translate className="w-full h-full">
            <Elements
                stripe={stripe}
                options={{
                    mode: "payment" as any,
                    amount: 50,
                    currency: "usd",
                    appearance: {
                        theme: resolvedTheme === "dark" ? "night" : "stripe",
                    },
                    locale: lang as StripeElementsOptions["locale"],
                    ...options,
                    payment_method_types: ['card'],
                    paymentMethodCreation: "manual"
                }}
            >
                {children}
            </Elements>
        </Translate>
    );
};

export default StripeProvider;