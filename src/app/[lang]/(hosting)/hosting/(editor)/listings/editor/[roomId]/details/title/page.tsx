"use client"
import Button from "@/components/Button";
import { roomEditorSelector } from "@/hooks/selectors/roomSelector";
import useDictionary from "@/hooks/useDictionary";
import useRoomStore from "@/hooks/useRoomStore";
import useToast from "@/hooks/useToast";
import { Dictionary } from "@/libs/dictionary.lib";
import { updateUserRoom } from "@/services/user.service";
import { Textarea } from "@nextui-org/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import React, { useCallback, useEffect, useState } from "react"
import { toast } from "sonner";

interface PageProps {
  params: {
    roomId: string;
    lang: string;
  }
};

const valueValidate = 32;

const Page: React.FC<PageProps> = ({
  params: {
    roomId,
    lang,
  }
}) => {
  const [inputValue, setInputValue] = useState("");
  const { room } = useRoomStore(roomEditorSelector);
  const [isLoading, setIsLoading] = useState(false);
  const { toastRes } = useToast();
  const { d } = useDictionary<"hosting", Dictionary["hosting"]["listings"]["editor"]["title"]>("hosting", d => d.listings.editor.title);
  const router = useRouter();

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    const toastId = toast.loading("Loading...", {
      position: "top-center"
    });
    const res = await updateUserRoom(roomId, {
      title: inputValue
    });
    toast.dismiss(toastId);
    toastRes(res, {
      position: "top-center"
    });
    setIsLoading(false);
  }, [roomId, inputValue, toastRes]);

  useEffect(() => {
    if (room?.title) {
      setInputValue(room.title);
    }
  }, [room]);

  return (
    <>
      <Button
        isIconOnly
        variant="flat"
        radius="full"
        className="absolute top-5 left-5 flex lg:hidden bg-default-100 hover:bg-default-200 dark:bg-default-200 dark:hover:bg-default-300"
        onPress={() => {
          router.push(`/${lang}/hosting/listings/editor/${roomId}/details`)
        }}
        disableRipple
      >
        <ArrowLeft />
      </Button>
      <div className="2xl:w-[53rem] mx-10 2xl:mx-auto h-full flex justify-center items-center min-h-fit">
        <div className="w-full min-h-96 h-fit py-20">
          <div className="text-center mb-6">
            <span
              dangerouslySetInnerHTML={{
                __html: (d?.validate || '').replace(
                  "{{value}}",
                  `<b>${valueValidate - inputValue.length}</b>`
                ),
              }}
            />
          </div>
          <div>
            <Textarea
              fullWidth
              variant="underlined"
              className="border-none text-center"
              value={inputValue}
              onValueChange={(v) => {
                const sanitizedValue = v.replace(/[\r\n]/g, "");
                if (sanitizedValue.length <= valueValidate) {
                  setInputValue(sanitizedValue);
                }
              }}
              classNames={{
                inputWrapper: 'border-none after:hidden border-b-0 shadow-none',
                base: "bg-none",
                innerWrapper: "bg-none",
                mainWrapper: "bg-none",
                input: "text-center text-5xl font-medium"
              }}
            />
          </div>
        </div>
      </div> 
      <footer className="sticky inset-x-0 bottom-0 border-t p-4 lg:px-8 lg:py-7 bg-inherit">
        <Button
          isDisabled={inputValue.length <= 3}
          className="ml-auto mr-0 flex w-fit"
          color="secondary"
          size="lg"
          isLoading={isLoading}
          onPress={handleSave}
        >
          {!isLoading && d?.buttons.Save}
        </Button>
      </footer>
    </>
  );
};

export default Page;