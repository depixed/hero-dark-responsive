import * as React from "react"
import { useTheme } from "../../contexts/ThemeContext"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const { theme } = useTheme();
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          theme === 'light' 
            ? "border-gray-300 bg-white text-gray-800 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            : "border-gray-700 bg-[#252525] text-white focus:border-[#8e53e5] focus:ring-1 focus:ring-[#8e53e5]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
