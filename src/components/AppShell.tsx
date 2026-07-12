import type { ReactNode } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  hideNav?: boolean;
};

const AppShell = ({
  children,
  title,
  showBack = false,
  backTo = "/",
  hideNav = false,
}: AppShellProps) => (
  <div className="min-h-screen bg-background pb-20">
    <AppHeader title={title} showBack={showBack} backTo={backTo} />
    <main className="container max-w-2xl py-4">{children}</main>
    {!hideNav ? <BottomNav /> : null}
  </div>
);

export default AppShell;
