import * as React from "react";
import { cn } from "@/src/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "h-10 w-full rounded-lg border border-[#f2ebe3] bg-white px-4 py-2 text-base text-gray-950 transition-all",
            "placeholder:text-gray-400 focus:border-[#f3d3b1] focus:outline-none focus:ring-2 focus:ring-[#f3d3b1]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
