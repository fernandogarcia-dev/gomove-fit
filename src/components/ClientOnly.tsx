import { useEffect, useState, type ReactNode } from "react";

type ClientOnlyProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;
  return children;
};

export default ClientOnly;
