'use client';
import { Badge, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/react";
import { useCallback } from "react";
import useSystemStore from "@/hooks/useSystemStore";
import useDictionary from "@/hooks/useDictionary";
import { Dictionary } from "@/libs/dictionary.lib";
import { cn } from "@/utils/dom.util";
import Image from "@/components/Common/Image";
import { imageUserPlaceholder } from "@/configs/valueDefault.config";
import { toast } from "sonner";
import { signOut } from "@/services/auth.service";
import { AlignJustify, Check } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import { ModalMode } from "@/enum/modalMode";
import useModal from "@/hooks/useModal";
import useUserStore from "@/hooks/useUserStore";
import { profileSelector } from "@/hooks/selectors/userSelector";
import { loaderSelector } from "@/hooks/selectors/systemSelector";
import Button from "@/components/Button";

interface HeaderUserMenuProps {
  isIcon?: boolean;
}

const HeaderUserMenu: React.FC<HeaderUserMenuProps> = ({
  isIcon = true
}) => {
  const { profile, isAdmin } = useUserStore(profileSelector);
  const { isLoaded } = useSystemStore(loaderSelector);
  const { t } = useDictionary<"common", Dictionary["common"]["header"]["user-menu"]>("common", (d) => d.header["user-menu"]);
  const router = useRouter();
  const { onModal } = useModal();


  const handleClickMenu = useCallback((path: string) => {
    switch (path) {
      case ModalMode.AUTH_SIGN_IN:
      case ModalMode.AUTH_SIGN_UP:
        onModal({
          mode: path
        });
        break;
      default:
        router.push(path)
        break;
    }
  }, [router, onModal]);

  return (
    <>
      <Dropdown
        aria-label="User Dropdown"
        className="p-0"
        placement="bottom-end"
      >
        <DropdownTrigger
          aria-label="User Trigger"
          className="p-0"
        >
          <Button
            className={cn(
              "justify-center items-center bg-inherit border-1.5 gap-x-3 overflow-visible",
              isIcon && "w-[88px] h-[48px] pr-2 pl-[12px] shadow"
            )}
            radius="full"
            disableRipple
            isIconOnly={!isIcon}
            isDisabled={!isLoaded}
            color="default"
            type="button"
          >
            {isIcon && <AlignJustify className="text-lg" size={18} />}
            <Badge
              content={<Check size={8} strokeWidth={3} />}
              size="sm"
              shape="circle"
              placement="bottom-right"
              isOneChar
              isInvisible={!isAdmin}
              classNames={{
                badge: "bg-blue-600 text-white"
              }}
            >
              <Image
                defaultUrl={imageUserPlaceholder}
                src={profile?.profile?.thumbnail as string}
                className="w-[32px] h-[32px]"
                radius="full"
                shadow="sm"
                alt="avatar"
                isLoading={!isLoaded}
              />
            </Badge>
          </Button>
        </DropdownTrigger >
        <DropdownMenu
          className="w-[240px] p-0 overflow-hidden rounded-xl"
          aria-label="User Menu"
        >
          {
            !profile ? (
              <DropdownSection className="border-b-2 pb-2 dark:border-default-500">
                <DropdownItem
                  className="rounded-none px-4 py-3"
                  classNames={{
                    title: "font-medium"
                  }}
                  onPress={() => handleClickMenu(ModalMode.AUTH_SIGN_IN)}
                  key={"sign-in"}
                >
                  {t("login")}
                </DropdownItem>
                <DropdownItem
                  className="rounded-none px-4 py-3"
                  onPress={() => handleClickMenu(ModalMode.AUTH_SIGN_UP)}
                  key={"sign-up"}
                >
                  {t("register")}
                </DropdownItem>
              </DropdownSection>
            ) : (
              <DropdownSection className="border-b-2 pb-2 dark:border-default-500">
                <DropdownItem
                  className="rounded-none px-4 py-3"
                  classNames={{
                    title: "font-medium"
                  }}
                  onPress={() => { router.push("/token-expired") }}
                  key={"messages"}
                >
                  {t("messages")}
                </DropdownItem>
                <DropdownItem
                  className="rounded-none px-4 py-3"
                  classNames={{
                    title: "font-medium"
                  }}
                  key={"trips"}
                >
                  {t("trips")}
                </DropdownItem>
                <DropdownItem
                  className="rounded-none px-4 py-3"
                  classNames={{
                    title: "font-medium"
                  }}
                  key={"wish lists"}
                >
                  {t("wish lists")}
                </DropdownItem>
              </DropdownSection>
            )
          }

          <DropdownSection className="m-0">
            <DropdownItem
              key={"gift-cards"}
              className="rounded-none px-4 py-3"
            >
              {t("gift cards")}
            </DropdownItem>
            <DropdownItem
              key={"help-center"}
              className="rounded-none px-4 py-3"
            >
              {t("help center")}
            </DropdownItem>
            {
              profile && (
                <DropdownItem
                  key={"log-out"}
                  className="rounded-none px-4 py-3"
                  onPress={async () => {
                    const toastId = toast.loading("Logging out...", {
                      position: "bottom-right"
                    });
                    await signOut();
                    toast.dismiss(toastId);
                    router.refresh();
                    toast.success("Sign out successfully", {
                      position: "bottom-right"
                    });
                  }}
                >
                  {t("log out")}
                </DropdownItem>
              ) as any
            }
          </DropdownSection>
        </DropdownMenu>
      </Dropdown >
    </>
  );
}

export default HeaderUserMenu;