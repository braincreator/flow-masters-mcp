import React from 'react'

const CurrenciesEdit: React.FC<any> = ({ children }) => (
  <div className="currencies-edit">
    <h1>Currency Settings</h1>
    <div className="currency-config-container">
      {children}
    </div>
  </div>
)

export default CurrenciesEdit