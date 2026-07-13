import { Link, useLocation } from "react-router-dom";
import { BookOpen, CalendarDays, ClipboardList, Dumbbell, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home, match: (path: string) => path === "/" },
  { to: "/plan", label: "Plan", icon: ClipboardList, match: (path: string) => path === "/plan" },
  { to: "/exercises", label: "Exercises", icon: Dumbbell, match: (path: string) => path === "/exercises" },
  {
    to: "/guides",
    label: "Guides",
    icon: BookOpen,
    match: (path: string) => path === "/guides" || path.startsWith("/guides/"),
  },
  {
    to: "/plans",
    label: "My plans",
    icon: CalendarDays,
    match: (path: string) => path === "/plans" || path.startsWith("/plans/"),
  },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="container grid grid-cols-5">
        {items.map(({ to, label, icon: Icon, match }) => {
          const active = match(location.pathname);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors sm:gap-1 sm:text-xs",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
