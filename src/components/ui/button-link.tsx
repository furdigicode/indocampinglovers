import Link from "next/link";
import type { ReactNode } from "react";

type Props = { href: string; children: ReactNode; variant?: "primary" | "secondary"; className?: string };

export function ButtonLink({ href, children, variant = "primary", className = "" }: Props) {
  const variantClass = variant === "primary" ? "icl-button-primary" : "icl-button-secondary";
  return <Link href={href} className={`${variantClass} icl-focus px-5 py-3 text-sm ${className}`}>{children}</Link>;
}
