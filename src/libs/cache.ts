"use server";

import { revalidateTag as revalidateTagServer, revalidatePath as revalidatePathServer } from "next/cache";

export const revalidateTag = (tag: string) => {
    revalidateTagServer(tag.toString());
}

export const revalidatePath = (path: string) => {
    revalidatePathServer(path);
}
