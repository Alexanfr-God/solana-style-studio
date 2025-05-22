
import * as React from "react"
import { cn } from "@/lib/utils"
import { Input, InputProps } from "./input"

interface InputWithIconProps extends InputProps {
  icon?: React.ReactNode;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <Input
          className={cn(
            icon ? "pl-9" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    )
  }
)
InputWithIcon.displayName = "InputWithIcon"

export { InputWithIcon }
