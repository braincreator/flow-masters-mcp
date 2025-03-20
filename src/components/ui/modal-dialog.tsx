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
import { Button } from "@/components/ui/button"

interface ModalDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function ModalDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalDialogProps) {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className={className}>
        {(title || description) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {description && <ModalDescription>{description}</ModalDescription>}
          </ModalHeader>
        )}
        {children}
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  )
}

// Example usage:
export function ExampleModalDialog() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <ModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        description="This is an example modal dialog using shadcn/ui components."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>Continue</Button>
          </div>
        }
      >
        <div className="py-4">
          <p>Your modal content goes here.</p>
        </div>
      </ModalDialog>
    </>
  )
}