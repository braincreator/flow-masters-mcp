'use client'

import React from 'react'
import '@/styles/admin.css'
import '@/styles/admin-overrides.scss'

const CustomHeader: React.FC = () => {
  return (
    <div className="custom-header">
      <p>Welcome to Flow Masters Admin Panel</p>
      <style jsx>{`
        .custom-header {
          background-color: var(--theme-success-500);
          color: white;
          padding: calc(var(--base) / 2) var(--base);
          text-align: center;
          font-weight: 500;
        }

        .custom-header p {
          margin: 0;
        }
      `}</style>
    </div>
  )
}

export default CustomHeader
