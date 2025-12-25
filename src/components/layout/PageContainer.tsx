import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: ReactNode;
}

export function PageContainer({ 
  children, 
  title, 
  subtitle, 
  className,
  headerAction 
}: PageContainerProps) {
  return (
    <div className={cn("min-h-screen pb-20 bg-background", className)}>
      {(title || headerAction) && (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="px-4 py-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
                )}
              </div>
              {headerAction}
            </div>
          </div>
        </header>
      )}
      <main className="px-4 py-4 max-w-lg mx-auto">
        {children}
      </main>
    </div>
  );
}
