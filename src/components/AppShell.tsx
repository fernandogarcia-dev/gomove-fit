import type { ReactNode } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  hideNav?: boolean;
  /** Wider layout for blog / guide articles */
  wide?: boolean;
};

const AppShell = ({
  children,
  title,
  showBack = false,
  backTo = "/",
  hideNav = false,
  wide = false,
}: AppShellProps) => (
  <div className="min-h-screen bg-background pb-20">
    <AppHeader title={title} showBack={showBack} backTo={backTo} />
    <main className={cn("container py-4", wide ? "max-w-3xl" : "max-w-2xl")}>{children}</main>
    {!hideNav ? <BottomNav /> : null}
  </div>
);

export default AppShell;
