import * as React from "react"
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const Tooltip = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const TooltipTrigger = React.forwardRef<HTMLButtonElement, any>((props, ref) => <button ref={ref} {...props} />)
export const TooltipContent = React.forwardRef<HTMLDivElement, any>((props, ref) => <div ref={ref} {...props} />)
