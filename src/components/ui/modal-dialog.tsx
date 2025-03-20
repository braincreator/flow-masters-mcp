"use client"

import * as React from "react"
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "@/components/ui/modal"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/utilities/ui"

interface ModalDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  contentClassName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeButton?: boolean
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
  showOverlay?: boolean
  overlayClassName?: string
  actions?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
    size?: ButtonProps['size']
    className?: string
    loading?: boolean
    disabled?: boolean
  }[]
}

export function ModalDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  size = 'md',
  closeButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  showOverlay = true,
  overlayClassName,
  actions,
}: ModalDialogProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4'
  }

  return (
    <Modal 
      open={isOpen} 
      onOpenChange={closeOnClickOutside ? onClose : undefined}
      onEscapeKeyDown={closeOnEsc ? onClose : undefined}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        showOverlay && "bg-background/80 backdrop-blur-sm",
        overlayClassName
      )}
    >
      <ModalContent 
        className={cn(
          "relative",
          sizeClasses[size],
          "w-full animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        {(title || description) && (
          <ModalHeader className="space-y-2">
            {title && <ModalTitle className="text-2xl">{title}</ModalTitle>}
            {description && (
              <ModalDescription className="text-muted-foreground">
                {description}
              </ModalDescription>
            )}
          </ModalHeader>
        )}
        
        <div className={cn("p-6", contentClassName)}>
          {children}
        </div>

        {(footer || actions) && (
          <ModalFooter className="flex items-center justify-end space-x-2">
            {footer || (
              <>
                {actions?.map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    variant={action.variant}
                    size={action.size}
                    className={action.className}
                    disabled={action.disabled || action.loading}
                  >
                    {action.loading ? "Loading..." : action.label}
                  </Button>
                ))}
              </>
            )}
          </ModalFooter>
        )}

        {closeButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="sr-only">Close</span>
          </button>
        )}
      </ModalContent>
    </Modal>
  )
}

// Example usage with new features:
export function ExampleModalDialog() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <ModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        description="This is an example modal dialog with enhanced features."
        size="md"
        closeButton={true}
        actions={[
          {
            label: "Cancel",
            onClick: () => setIsOpen(false),
            variant: "outline"
          },
          {
            label: "Continue",
            onClick: () => {
              // Handle action
              setIsOpen(false)
            },
            variant: "default"
          }
        ]}
      >
        <div className="space-y-4">
          <p>Your modal content goes here.</p>
          <p>You can add any content you want.</p>
        </div>
      </ModalDialog>
    </>
  )
}
