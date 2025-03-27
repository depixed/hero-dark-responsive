import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useTheme } from "../../contexts/ThemeContext"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent",
        secondary: "",
        destructive: "",
        outline: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  const { theme } = useTheme();
  
  // Apply theme-specific styling
  let themeClass = "";
  
  if (variant === "default") {
    themeClass = theme === 'light'
      ? "bg-gray-800 text-white hover:bg-gray-700" 
      : "bg-gray-800 text-white hover:bg-gray-700";
  } else if (variant === "secondary") {
    themeClass = theme === 'light'
      ? "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
      : "bg-gray-800 text-gray-100 border-gray-700 hover:bg-gray-700";
  } else if (variant === "destructive") {
    themeClass = theme === 'light'
      ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
      : "bg-red-900/20 text-red-400 border-red-800/30 hover:bg-red-900/30";
  } else if (variant === "outline") {
    themeClass = theme === 'light'
      ? "text-gray-800 border-gray-300 hover:bg-gray-100"
      : "text-gray-300 border-gray-700 hover:bg-gray-800";
  }
  
  return (
    <div className={cn(badgeVariants({ variant }), themeClass, className)} {...props} />
  )
}

export { Badge, badgeVariants }
