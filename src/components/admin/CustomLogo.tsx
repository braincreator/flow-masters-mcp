'use client'

import React from 'react'

const CustomLogo: React.FC = () => {
  return (
    <div className="custom-logo">
      <h2>Flow Masters</h2>
      <style jsx>{`
        .custom-logo {
          padding: var(--base);
        }

        .custom-logo h2 {
          margin: 0;
          font-weight: 700;
          color: var(--theme-text);
        }
      `}</style>
    </div>
  )
}

export default CustomLogo
