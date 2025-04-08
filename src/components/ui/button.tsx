import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useTheme } from "../../contexts/ThemeContext"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#8e53e5] to-[#3b00eb] hover:from-[#7440c0] hover:to-[#3100c5] text-white",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-600",
        outline: "",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "",
        link: "text-slate-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const { theme } = useTheme();
    const Comp = asChild ? Slot : "button"
    
    // Apply theme-specific styling to variants that need it
    let themeClass = "";
    
    if (variant === "outline") {
      themeClass = theme === 'light' 
        ? "border border-gray-200 text-gray-800 hover:bg-gray-50" 
        : "border border-gray-700 text-white hover:bg-gray-800";
    } else if (variant === "ghost") {
      themeClass = theme === 'light'
        ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        : "text-gray-300 hover:bg-gray-800 hover:text-white";
    } else if (variant === "link") {
      themeClass = theme === 'light'
        ? "text-purple-600 hover:text-purple-700"
        : "text-purple-400 hover:text-purple-300";
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), themeClass)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
