import { ResponseUtil } from "@/utils/response.util";
import { useCallback } from "react";
import { ExternalToast, toast } from "sonner";
import useDictionary from "./useDictionary";

const useToast = () => {
    const statusMsg = useDictionary("message-status").p;

    const toastRes = useCallback((res: ResponseUtil<any>, options: Omit<ExternalToast, "description"> & {
        title?: boolean
        description?: boolean
    } = {}
    ) => {
        const optionCommon = {
            title: true,
            description: false,
            ...options,
        }
        const msg = statusMsg[res.status.toString() as keyof typeof statusMsg] ?? statusMsg[502];

        const toastType = res.ok ? "success" : "error";

        if (optionCommon.title || optionCommon.description) {
            delete options.title;
            delete options.description;
            const toastOptions = {
                ...options,
            }
            toast[toastType]((optionCommon.title && msg.title) || (optionCommon.description && msg.description), {
                description: optionCommon.description && optionCommon.title ? msg.description : undefined,
                ...toastOptions,
                classNames: {
                    icon: !(optionCommon.description && optionCommon.title) ? "hidden" : "",
                    ...(toastOptions.classNames ?? {})
                },

            });
        }
    }, [statusMsg]);

    return {
        toastRes
    }
}

export default useToast;