export interface ResponseUtil<T> {
    ok: boolean;
    status: number;
    message: string;
    data: T;
    errors: null | Record<string, string> | string;
};

type CatchErrorValues = {
    status: ResponseUtil<null>['status'];
    message: ResponseUtil<null>['message'];
    errors?: ResponseUtil<null>['errors'];
}

class CatchError extends Error {
    status: CatchErrorValues['status'];
    errors: CatchErrorValues['errors'];

    constructor({ status, message, errors }: CatchErrorValues) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;


const responseUtil = {
    success: <T>({
        status = 200,
        message = "Success",
        data,
    }: PartialExcept<Omit<ResponseUtil<T>, "ok" | "errors">, "data">): ResponseUtil<T> => {
        return {
            ok: true,
            status,
            message,
            data,
            errors: null,
        }
    },
    error: ({
        status = 502,
        message = "Error",
        errors = null
    }: Partial<CatchErrorValues>): ResponseUtil<null> => {
        return {
            ok: false,
            status,
            message: message === "fetch failed" ? "The server is not responding" : message,
            data: null,
            errors,
        }
    },
    CatchError,
    catchError: function <T, A extends any[]>(promise: (...args: A) => Promise<ResponseUtil<T>>) {
        return async (...args: A): Promise<ResponseUtil<T | null>> => {
            try {
                return await promise(...args);
            } catch (error: any) {
                return this.error(error);
            }
        }
    }
}

export default responseUtil;