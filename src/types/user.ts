export interface User {
    id: string,
    full_name: string,
    email: string,
    password: string | null,
    status: boolean,
    created_at: string,
    updated_at: string,
}