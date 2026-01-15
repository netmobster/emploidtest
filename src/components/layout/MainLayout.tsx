import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  /** Use 'default' for dashboards (max-w-3xl), 'wide' for content-heavy pages */
  variant?: "default" | "wide" | "full";
  /** Additional classes for the outer wrapper */
  className?: string;
  /** Additional classes for the content container */
  containerClassName?: string;
  /** Whether to show the card styling on desktop */
  showCard?: boolean;
}

/**
 * MainLayout provides a responsive centered container with:
 * - Max-width of 800px on desktop (md+)
 * - Full width on mobile
 * - Subtle card styling on desktop
 * - Different background for the "void" area vs content
 */
const MainLayout = ({
  children,
  variant = "default",
  className,
  containerClassName,
  showCard = true,
}: MainLayoutProps) => {
  const maxWidthClasses = {
    default: "md:max-w-[800px]",
    wide: "md:max-w-4xl lg:max-w-5xl",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-muted/30",
        className
      )}
    >
      <div
        className={cn(
          // Base: full width on mobile
          "w-full mx-auto",
          // Desktop: constrained width with card styling
          maxWidthClasses[variant],
          // Card styling on desktop only (when enabled)
          showCard && [
            "md:bg-background",
            "md:border-x md:border-border/50",
            "md:shadow-sm",
          ],
          // Ensure minimum height fills viewport
          "min-h-screen",
          containerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
