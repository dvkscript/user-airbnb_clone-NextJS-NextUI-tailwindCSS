export const passwordRegex = {
    length: /^.{8,}$/,
    number: /[0-9]/,
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    symbol: /[^\w]/,
}