import { getUserRoom } from "@/services/user.service";
import React from "react"
import { RoomStatus } from "@/enum/room";

interface EditorLayoutProps {
  children: React.ReactNode;
  aside: React.ReactNode;
  params: {
    roomId: string;
  }
}

const EditorLayout = async ({
  children,
  aside,
  params: {
    roomId
  },
}: EditorLayoutProps) => {
  const roomRes = await getUserRoom(roomId);

  if (!roomRes.ok) {
    throw new Error(roomRes.status.toString());
  }

  const room = roomRes.data!;

  if (room.statusText.startsWith(RoomStatus.CREATING + "-")) {
    throw new Error("404");
  }

  return (
    <>
      <div className="h-full max-h-full w-full flex overflow-hidden">
        {aside}
        <div className="h-full w-[1px] bg-default-200 hidden lg:block" />
        {children}
      </div>
    </>
  );
};

export default EditorLayout;