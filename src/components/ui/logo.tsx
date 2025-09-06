import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}

export function Logo({ className, size = "md", variant = "dark" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl"
  };

  const variantClasses = {
    light: "text-primary-foreground",
    dark: "text-primary"
  };

  return (
    <div className={cn("flex items-center font-heading font-bold", className)}>
      <div className="relative">
        {/* The DOTS logo using connecting dots concept */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-neonaccent rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-neonaccent/70 rounded-full"></div>
            <div className="w-2 h-2 bg-neonaccent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-1 h-1 bg-neonaccent/70 rounded-full"></div>
            <div className="w-2 h-2 bg-neonaccent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
      <span className={cn(sizeClasses[size], variantClasses[variant], "ml-3 tracking-wider")}>
        DOTS
      </span>
    </div>
  );
}

// Text-only variant for smaller spaces
export function LogoText({ className, size = "md", variant = "dark" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl",
    xl: "text-3xl"
  };

  const variantClasses = {
    light: "text-primary-foreground",
    dark: "text-primary"
  };

  return (
    <span className={cn(
      "font-heading font-bold tracking-wider",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      DOTS
    </span>
  );
}