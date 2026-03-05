import * as React from "react"
export const Dialog = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DialogTrigger = React.forwardRef<HTMLButtonElement, any>((props, ref) => <button ref={ref} {...props} />)
export const DialogContent = React.forwardRef<HTMLDivElement, any>((props, ref) => <div ref={ref} {...props} />)
export const DialogHeader = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
export const DialogTitle = React.forwardRef<HTMLHeadingElement, any>((props, ref) => <h2 ref={ref} {...props} />)
export const DialogDescription = React.forwardRef<HTMLParagraphElement, any>((props, ref) => <p ref={ref} {...props} />)
