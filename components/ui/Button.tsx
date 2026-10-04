import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  href: string;
  variant?: "ink" | "ivory" | "ghost" | "ghost-light";
  size?: "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

export default function Button({
  href,
  variant = "ink",
  size = "md",
  children,
  className,
  onClick,
  target,
  rel,
}: ButtonProps) {
  const isExternal =
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#");

  const sizeClasses =
    size === "md" ? "px-6 py-3 text-[0.85rem]" : "px-8 py-4 text-[0.95rem]";

  const variantClasses = {
    ink: "bg-ink text-ivory hover:bg-accent",
    ivory: "bg-ivory text-ink hover:bg-white hover:shadow-md hover:-translate-y-[1px]",
    ghost: "border border-ink/20 text-ink hover:border-ink",
    "ghost-light": "border border-ivory/30 text-ivory hover:border-ivory",
  }[variant];

  const baseClasses = cn(
    "group inline-flex items-center gap-3 font-body font-medium tracking-[0.02em] rounded-full transition-all duration-500 [transition-timing-function:var(--ease-expo)]",
    sizeClasses,
    variantClasses,
    className
  );

  const content = (
    <>
      <span>{children}</span>
      <svg
        className="h-[14px] w-[14px] transition-transform duration-300 group-hover:translate-x-1"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M1 7h11M7 1l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={baseClasses}
        onClick={onClick}
        target={target}
        rel={rel}
        data-cursor="cta"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={baseClasses}
      onClick={onClick}
      target={target}
      rel={rel}
      data-cursor="cta"
    >
      {content}
    </Link>
  );
}
