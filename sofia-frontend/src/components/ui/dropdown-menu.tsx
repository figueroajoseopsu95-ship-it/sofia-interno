import * as React from "react"
export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, any>((props, ref) => <button ref={ref} {...props} />)
export const DropdownMenuContent = React.forwardRef<HTMLDivElement, any>((props, ref) => <div ref={ref} {...props} />)
export const DropdownMenuItem = React.forwardRef<HTMLDivElement, any>((props, ref) => <div ref={ref} {...props} />)
export const DropdownMenuSeparator = () => <hr />
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
