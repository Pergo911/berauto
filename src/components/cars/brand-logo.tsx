import { cn } from "@/lib/utils";

type BrandLogoProps = {
  logoPath: string | null;
  brandName: string;
  size?: number;
  className?: string;
};

export function BrandLogo({
  logoPath,
  brandName,
  size = 32,
  className,
}: BrandLogoProps) {
  if (!logoPath) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoPath}
      alt={`${brandName} logo`}
      width={size}
      height={size}
      className={cn("object-contain brightness-0 dark:invert", className)}
    />
  );
}
