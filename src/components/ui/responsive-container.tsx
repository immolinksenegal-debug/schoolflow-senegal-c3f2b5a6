import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveContainer = ({ children, className }: ResponsiveContainerProps) => {
  return (
    <div className={cn("container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8", className)}>
      {children}
    </div>
  );
};
