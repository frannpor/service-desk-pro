import { cn } from "@/src/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#f2ebe3]/70", className)}
      {...props}
    />
  );
}

export { Skeleton };
