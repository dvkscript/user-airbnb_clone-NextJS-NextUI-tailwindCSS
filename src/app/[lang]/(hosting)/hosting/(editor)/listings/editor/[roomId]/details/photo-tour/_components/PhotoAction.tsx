import Button from "@/components/Button";
import Translate from "@/components/Common/Translate";
import useDictionary from "@/hooks/useDictionary";
import useToast from "@/hooks/useToast";
import { Dictionary } from "@/libs/dictionary.lib";
import { deletePhoto } from "@/services/photo.service";
import { GetUserRoom } from "@/services/user.service";
import { Dropdown, DropdownItem, DropdownItemProps, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { Ellipsis } from "lucide-react";
import { Key, useCallback } from "react";
import { toast } from "sonner";

type Photo = GetUserRoom["photos"][number];

interface PhotoActionProps {
    photo: Photo;
    index: number;
    photos: Photo[];
    setPhotos: (photos: PhotoActionProps["photos"]) => void;
}

const PhotoAction = ({
    photo,
    index,
    photos,
    setPhotos
}: PhotoActionProps) => {
    const { toastRes } = useToast();
    const t = useDictionary<"hosting", Dictionary["hosting"]["listings"]["editor"]["photo-tour"]["buttons"]>("hosting", d => d.listings.editor["photo-tour"].buttons).t;
    const msgs = useDictionary<"hosting", Dictionary["hosting"]["listings"]["editor"]["photo-tour"]["messages"]>("hosting", d => d.listings.editor["photo-tour"].messages).t;

    const handleAction = useCallback(async (key: Key) => {
        const newPhotos = [...photos];

        const swapPhotos = (activeIndex: number, overIndex: number) => {
            const activePhoto = { ...photo, position: newPhotos[activeIndex].position };
            const overPhoto = { ...newPhotos[overIndex], position: photo.position };
            newPhotos.splice(overIndex, 1, activePhoto);
            newPhotos.splice(activeIndex, 1, overPhoto);
            setPhotos(newPhotos);
        };

        switch (key) {
            case "top":
                if (index < 1) return;
                swapPhotos(index, 0);
                break;
            case "up":
                if (index < 1) return;
                swapPhotos(index, index - 1);
                break;
            case "down":
                if (index >= photos.length - 1) return;
                swapPhotos(index, index + 1);
                break;
            case "delete":
                if (photos.length <= 5) {
                    toast.warning(msgs("deleteValidate"), {
                        position: "top-center"
                    })
                    return;
                }
                const toastId = toast.loading("Loading...", {
                    position: "top-center"
                });
                const result = await deletePhoto([photo.id]);
                if (!result?.ok) {
                    toastRes(result);
                }
                toast.dismiss(toastId);
                break;
            default:
                break;
        }
    }, [index, photo, photos, setPhotos, toastRes, msgs])

    const itemProps = () => ({
        className: "rounded-none px-4 py-3",
    } as Omit<DropdownItemProps, "key">);

    return <Dropdown
        placement={"bottom-end"}
        showArrow
        classNames={{
            content: "px-0 py-1.5",
        }}
        radius={"sm"}
    >
        <DropdownTrigger>
            <Button
                isIconOnly
                radius={"full"}
                variant={"flat"}
                className={"absolute top-2 right-2 z-10 bg-default-50"}
                size={"sm"}
            >
                <Ellipsis size={20} />
            </Button>
        </DropdownTrigger>
        <DropdownMenu
            className={"p-0"}
            onAction={handleAction}
        >
            {
                [
                    ...(index !== 0 ? ([
                        <DropdownItem key={"top"} {...itemProps()}>
                            <Translate as={"span"} isTrans isExcLocaleSystem>
                                {t("make_cover_photo")}
                            </Translate>
                        </DropdownItem>,
                        <DropdownItem key={'up'} {...itemProps()}>
                            <Translate as={"span"} isTrans isExcLocaleSystem>
                                {t("move_forward")}
                            </Translate>
                        </DropdownItem>
                    ]) : []),
                    ...(photos.length - 1 !== index ? ([
                        <DropdownItem key={'down'} {...itemProps()}>
                            <Translate as={"span"} isExcLocaleSystem isTrans>
                                {t("move_backward")}
                            </Translate>
                        </DropdownItem>
                    ]) : []),
                    <DropdownItem key={'delete'} {...itemProps()}>
                        <Translate as={"span"} isTrans isExcLocaleSystem>
                            {t("delete")}
                        </Translate>
                    </DropdownItem>
                ]
            }
        </DropdownMenu>
    </Dropdown>
}

export default PhotoAction