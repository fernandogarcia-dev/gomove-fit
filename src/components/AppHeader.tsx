import { Link } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoMoveLogo from "@/components/GoMoveLogo";
import { useAuth } from "@/contexts/AuthContext";

type AppHeaderProps = {
  showBack?: boolean;
  backTo?: string;
  title?: string;
};

const AppHeader = ({ showBack = false, backTo = "/", title }: AppHeaderProps) => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-lg">
      <div className="container flex h-14 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showBack ? (
            <Link to={backTo}>
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
          ) : !title ? (
            <GoMoveLogo variant="full" className="h-7 shrink-0" />
          ) : null}
          {title ? (
            <h1 className="truncate font-display text-base font-semibold text-foreground">{title}</h1>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    Admin
                  </Button>
                </Link>
              ) : null}
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
