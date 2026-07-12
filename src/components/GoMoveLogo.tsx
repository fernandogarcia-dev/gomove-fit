import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type GoMoveLogoProps = {
  variant?: "full" | "icon";
  className?: string;
  iconClassName?: string;
  to?: string;
};

const GoMoveLogo = ({
  variant = "full",
  className,
  iconClassName,
  to = "/",
}: GoMoveLogoProps) => {
  const src = variant === "full" ? "/logotipo.svg" : "/logomarca.svg";
  const alt = variant === "full" ? "GoMove" : "GoMove logo";

  const image = (
    <img
      src={src}
      alt={alt}
      className={cn(
        variant === "full" ? "h-8 w-auto" : "h-9 w-9",
        iconClassName,
        className,
      )}
    />
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center">
        {image}
      </Link>
    );
  }

  return image;
};

export default GoMoveLogo;
