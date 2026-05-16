import Image from "next/image";
import { logos, type LogoKey } from "@/lib/logos";
import { cn } from "@/lib/utils";

type Props = {
  variant?: LogoKey;
  /** Rendered height in px. Width auto-derives from the source aspect ratio. */
  height: number;
  priority?: boolean;
  className?: string;
};

export function Logo({
  variant = "wordmark",
  height,
  priority = false,
  className,
}: Props) {
  const asset = logos[variant];
  const width = Math.round((asset.width / asset.height) * height);
  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
      style={{ height }}
    />
  );
}
