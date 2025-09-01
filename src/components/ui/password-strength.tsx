import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const requirements = React.useMemo(() => {
    return [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "Contains lowercase letter", 
        met: /[a-z]/.test(password),
      },
      {
        label: "Contains number",
        met: /\d/.test(password),
      },
      {
        label: "Contains special character (!*@$)",
        met: /[!*@$]/.test(password),
      },
    ];
  }, [password]);

  const strength = requirements.filter(req => req.met).length;
  const strengthPercentage = (strength / requirements.length) * 100;

  const getStrengthLabel = () => {
    if (strength === 0) return "Very Weak";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-orange-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-primary">Password Strength</span>
        <span className={cn("text-sm font-medium", {
          "text-red-600": strength <= 1,
          "text-orange-600": strength === 2,
          "text-yellow-600": strength === 3,
          "text-blue-600": strength === 4,
          "text-green-600": strength === 5,
        })}>
          {getStrengthLabel()}
        </span>
      </div>
      
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", getStrengthColor())}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            {req.met ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-gray-400" />
            )}
            <span className={cn(
              "transition-colors",
              req.met ? "text-green-600" : "text-gray-500"
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}