'use client'

import React from 'react'
import { Payload } from 'payload'

interface AdminViewProps {
  payload: Payload
  children: React.ReactNode
}

export const AdminView: React.FC<AdminViewProps> = ({ children }) => {
  return (
    <div className="admin-view">
      {children}
    </div>
  )
}
