import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  glow?: boolean;
}

export function BrandLogo({ className = "", size = "md", glow = false }: BrandLogoProps) {
  const sizeClasses = {
    xs: "h-6 w-6 rounded-lg",
    sm: "h-7 w-7 rounded-xl",
    md: "h-9 w-9 rounded-xl",
    lg: "h-10 w-10 rounded-2xl",
    xl: "h-12 w-12 rounded-2xl",
  };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-[#0b0e11] border border-white/10 shadow-xs ${sizeClasses[size]} ${className}`}
    >
      <img
        src="/logo.png"
        alt="Finovo Logo"
        className="h-full w-full object-cover"
        loading="eager"
      />
      {glow && (
        <div className="pointer-events-none absolute inset-0 bg-emerald-500/15 mix-blend-screen" />
      )}
    </div>
  );
}

export default BrandLogo;
