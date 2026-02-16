interface AdBannerProps {
  className?: string;
  label?: string;
}

const AdBanner = ({ className = "", label = "Espaço para anúncio" }: AdBannerProps) => {
  return (
    <div className={`flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground ${className}`}>
      {label}
    </div>
  );
};

export default AdBanner;
