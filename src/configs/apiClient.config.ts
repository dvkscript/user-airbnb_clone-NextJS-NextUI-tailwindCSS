import "server-only";
import responseUtil from "@/utils/response.util";
import { RequestInit } from "next/dist/server/web/spec-extension/request";
import { SERVER_API } from "./env.config";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";


export const serverApi = SERVER_API || "";

type InitialValues = {
    serverApi: string | undefined
    token: string | null
    contentType: "application/json" | null
    next: NextFetchRequestConfig
    query: string
}

const initialValues: InitialValues = {
    serverApi: SERVER_API,
    token: null,
    contentType: "application/json",
    next: {},
    query: '',
}

const apiClient = {
    ...initialValues,
    setCache: function (next: InitialValues["next"]) {
        this.next = next;
    },
    setUrl: function (url: string) {
        this.serverApi = url;
    },
    setQuery: function (query: InitialValues["query"] | Params) {
        if (typeof query === "string") {
            this.query = query;
        } else {
            this.query = new URLSearchParams(query).toString()
        }
    },
    setToken: function (token: InitialValues["token"]) {
        this.token = token;
    },
    setContentType: function (contentType: InitialValues["contentType"] | null) {
        this.contentType = contentType;
    },
    setOptions: function ({
        token,
        contentType = initialValues.contentType,
        next,
        query
    }: Partial<Omit<InitialValues, "serverApi" | "query"> & { query: Params | string }>) {
        this.setToken(token ?? this.token);
        this.setContentType(contentType);
        this.setCache(next ?? this.next);
        this.setQuery(query ?? initialValues.query);
    },
    send: async function <T>(url: string, method: string = "GET", body: any = null) {
        url = `${this.serverApi}${url}${this.query ? `?${this.query}` : ""}`;
        
        const headers: HeadersInit = {};
        if (this.contentType) {
            headers["Content-Type"] = this.contentType
        }

        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }

        const options: RequestInit = {
            method,
            headers,
            next: this.next,
        };
        if (body) {
            options.body = this.contentType === "application/json" ? JSON.stringify(body) : body;
        };
        this.setContentType(initialValues.contentType);
        this.setUrl(serverApi)
        try {
            const res = await fetch(url, options);
            const data = await res.json();
            if (!res.ok) {
                throw new responseUtil.CatchError({
                    status: res.status,
                    message: data.message || res.statusText,
                    errors: data.errors || null,
                });
            };

            return responseUtil.success<T>(data)
        } catch (error: any) {
            return responseUtil.error(error)
        }

    },
    get: function <T>(url: string) {
        return this.send<T>(url);
    },

    post: function <T>(url: string, body: any) {
        return this.send<T>(url, "POST", body);
    },

    put: function <T>(url: string, body: any) {
        return this.send<T>(url, "PUT", body);
    },

    patch: function <T>(url: string, body: any) {
        return this.send<T>(url, "PATCH", body);
    },

    delete: function <T>(url: string, body: any) {
        return this.send<T>(url, "DELETE", body);
    },
};
export default apiClient;
