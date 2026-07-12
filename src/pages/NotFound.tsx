import { Link } from "react-router-dom";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <AppShell title="Page not found" showBack backTo="/">
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-6xl font-bold text-muted-foreground">404</p>
      <p className="mt-4 text-lg text-muted-foreground">This page does not exist.</p>
      <Link to="/" className="mt-6">
        <Button>Return to Home</Button>
      </Link>
    </div>
  </AppShell>
);

export default NotFound;
