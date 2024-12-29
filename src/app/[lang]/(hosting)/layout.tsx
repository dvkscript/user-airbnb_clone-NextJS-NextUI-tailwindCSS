import MobileNavbarHosting from "@/components/Layout/Mobile/MobileNavbarHosting";
import React from "react"

interface HostingLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
}

const HostingLayout: React.FC<HostingLayoutProps> = ({
  children,
  header
}) => {

  return (
    <div className="h-full bg-white dark:bg-neutral-800 flex flex-col pb-[4.35rem] md:pb-0">
      {header}
      {children}
      <div
        className={"fixed inset-x-0 bottom-0 h-fit bg-inherit transition-height z-10"}
      >
        <MobileNavbarHosting />
      </div>
    </div>
  );
};

export default HostingLayout;
