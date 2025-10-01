import * as React from "react";
import { cn } from "@/src/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 4, ...props }, ref) => {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full rounded-lg border border-[#f2ebe3] bg-white px-4 py-2 text-base text-gray-950 transition-all",
        "placeholder:text-gray-400 focus:border-[#f3d3b1] focus:outline-none focus:ring-2 focus:ring-[#f3d3b1]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
