import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "shadow hover:opacity-90",
        destructive: "shadow-sm hover:opacity-90",
        outline: "border shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "shadow-sm hover:opacity-80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline",
        success: "shadow hover:opacity-90",
        warning: "shadow hover:opacity-90",
        info: "shadow hover:opacity-90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Mapear variantes a colores CSS personalizados
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)',
      },
      destructive: {
        backgroundColor: 'var(--color-destructive)',
        color: 'var(--color-destructive-foreground)',
      },
      secondary: {
        backgroundColor: 'var(--color-secondary)',
        color: 'var(--color-secondary-foreground)',
      },
      success: {
        backgroundColor: 'var(--color-success)',
        color: 'var(--color-success-foreground)',
      },
      warning: {
        backgroundColor: 'var(--color-warning)',
        color: 'var(--color-warning-foreground)',
      },
      info: {
        backgroundColor: 'var(--color-info)',
        color: 'var(--color-info-foreground)',
      },
      outline: {
        borderColor: 'var(--color-input)',
        backgroundColor: 'var(--color-background)',
      },
      ghost: {},
      link: { color: 'var(--color-primary)' },
    }

    const combinedStyle = {
      ...variantStyles[variant || 'default'],
      ...style,
    }

    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        style={combinedStyle}
        {...props} 
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }