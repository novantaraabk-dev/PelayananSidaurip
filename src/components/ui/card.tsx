import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative overflow-hidden rounded-[1.5rem] border border-sky-600/20 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:border-sky-500/40 hover:shadow-[0_20px_45px_rgba(16,185,129,0.04)]",
      className
    )}
    {...props}
  >
    {/* Glowing Corner Accent */}
    <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-sky-500/5 blur-xl transition-all duration-500 group-hover:bg-sky-500/10 group-hover:scale-125 pointer-events-none" />
    
    {/* Subtle Dot Grid pattern */}
    <div className="absolute right-5 top-5 text-slate-200/50 transition-colors duration-300 group-hover:text-sky-200/40 pointer-events-none">
      <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
        <pattern id="card-ui-dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
        <rect width="40" height="40" fill="url(#card-ui-dots)" />
      </svg>
    </div>

    <div className="relative z-10 w-full h-full flex flex-col">
      {children}
    </div>
  </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
