import { passwordRegex } from "@/utils/regex.util";
import { z } from "zod";

const emailSchema = z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
}).email({
    message: 'Email invalidate!',
});

export const SignInValidator = z.object({
    email: emailSchema,
    password: z.string()
        .regex(passwordRegex.length, {
            message: "length",
        }),
})

export type TSignInValidator = z.infer<
    typeof SignInValidator
>

export const SignUpValidator = z.object({
    full_name: z.string({
        required_error: "Full name is required",
        invalid_type_error: "Full name must be a string",
    }).min(3, {
        message: 'Full name must be at least 3 characters!',
    }),
    email: emailSchema,
    password: z.string()
        .regex(passwordRegex.length, { message: "length" })
        .regex(passwordRegex.number, { message: "number" })
        .regex(passwordRegex.lowercase, { message: "lowercase" })
        .regex(passwordRegex.uppercase, { message: "uppercase" })
        .regex(passwordRegex.symbol, { message: "symbol" }),
    re_password: z.string(),
}).refine((data) => data.password === data.re_password, {
    message: 'Must match "password" field value',
    path: ['re_password'],
});

export type TSignUpValidator = z.infer<
    typeof SignUpValidator
>
