'use client'

import React from 'react'

const CustomIcon: React.FC = () => {
  return (
    <div className="custom-icon">
      <span>FM</span>
      <style jsx>{`
        .custom-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background-color: var(--theme-elevation-800);
          border-radius: 4px;
        }

        .custom-icon span {
          color: white;
          font-weight: 700;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}

export default CustomIcon
