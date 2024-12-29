"use client";

import React, { useEffect, useState } from "react";
import {
    useStripe,
    useElements,
    PaymentElement,
    PaymentElementProps,
} from "@stripe/react-stripe-js";
import useUserStore from "@/hooks/useUserStore";
import { profileSelector } from "@/hooks/selectors/userSelector";
import { Stripe, StripeElements } from "@stripe/stripe-js";
import LoaderPulse from "@/components/Loader/LoaderPulse";

interface StripeCardProps extends PaymentElementProps {
    onSubmit?: (values: { stripe: Stripe, elements: StripeElements }) => void;
    errorMsg?: string;
    children?: React.ReactNode;
}

const StripeCard = ({
    onSubmit,
    children,
    errorMsg,
    ...props
}: StripeCardProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const { profile } = useUserStore(profileSelector);
    const [errorMessage, setErrorMessage] = useState<string>();


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        if (onSubmit) onSubmit({
            stripe,
            elements,
        });
    };

    useEffect(() => {
        setErrorMessage(errorMsg);
    }, [errorMsg])

    if (!stripe || !elements || !profile) {
        return (
            <div className="flex items-center justify-center p-2">
                <LoaderPulse />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement
                options={{
                    layout: "auto",
                    business: {
                        name: "Airbnb Clone",
                    },
                    defaultValues: {
                        billingDetails: {
                            email: profile.email,
                            name: profile.full_name,
                        }
                    },
                    terms: {
                        card: "always"
                    },
                    paymentMethodOrder: ["card"],
                    ...props,
                }}
                onLoadError={(e) => {
                    setErrorMessage(e.error.message)
                }}
            />
            {errorMessage && (
                <div className="pt-2">
                    <span className="text-danger">{errorMessage}</span>
                </div>
            )}
            {children}
        </form>
    );
};

export default StripeCard;