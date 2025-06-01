import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ModalLeadForm } from './ModalLeadForm'

interface LeadFormModalContextProps {
  openModal: (params: { type?: string; title?: string; description?: string }) => void
  closeModal: () => void
}

const LeadFormModalContext = createContext<LeadFormModalContextProps | undefined>(undefined)

export function useLeadFormModal() {
  const ctx = useContext(LeadFormModalContext)
  if (!ctx) throw new Error('useLeadFormModal must be used within LeadFormModalProvider')
  return ctx
}

interface LeadFormModalProviderProps {
  children: ReactNode
}

export function LeadFormModalProvider({ children }: LeadFormModalProviderProps) {
  const [open, setOpen] = useState(false)
  const [modalParams, setModalParams] = useState<{
    type?: string
    title?: string
    description?: string
  }>({})

  const openModal = (params: { type?: string; title?: string; description?: string }) => {
    setModalParams(params)
    setOpen(true)
  }
  const closeModal = () => setOpen(false)

  return (
    <LeadFormModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ModalLeadForm
        open={open}
        onClose={closeModal}
        title={modalParams.title}
        description={modalParams.description}
        actionType={modalParams.type}
      />
    </LeadFormModalContext.Provider>
  )
}
