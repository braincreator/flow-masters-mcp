'use client'

import React, { useState } from 'react'
import { useField } from '@payloadcms/ui'

interface ApiKeyFieldProps {
  path: string
  label?: string
  required?: boolean
  admin?: {
    readOnly?: boolean
    description?: string
  }
}

export const ApiKeyField: React.FC<ApiKeyFieldProps> = ({
  path,
  label = 'API Key',
  required = false,
  admin = {}
}) => {
  const { value, setValue } = useField<string>({ path })
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateKey = () => {
    // Generate a secure API key
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    setValue(key)
  }

  const copyToClipboard = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard:', err)
      }
    }
  }

  const displayValue = value 
    ? showKey 
      ? value 
      : `${value.substring(0, 8)}${'*'.repeat(Math.max(0, value.length - 8))}`
    : ''

  return (
    <div className="field-type">
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      
      {admin.description && (
        <div className="field-description">{admin.description}</div>
      )}

      <div className="api-key-field">
        <div className="api-key-input-wrapper">
          <input
            type="text"
            value={displayValue}
            onChange={(e) => setValue(e.target.value)}
            placeholder={admin.readOnly ? 'Key will be generated automatically' : 'Enter API key or generate one'}
            readOnly={admin.readOnly}
            className="api-key-input"
          />
          
          {value && (
            <div className="api-key-actions">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="api-key-toggle"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? '👁️' : '👁️‍🗨️'}
              </button>
              
              <button
                type="button"
                onClick={copyToClipboard}
                className="api-key-copy"
                title="Copy to clipboard"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
          )}
        </div>

        {!admin.readOnly && (
          <button
            type="button"
            onClick={generateKey}
            className="api-key-generate"
          >
            Generate Secure Key
          </button>
        )}

        {value && (
          <div className="api-key-info">
            <small>
              Key length: {value.length} characters
              {value.length >= 32 ? ' ✅' : ' ⚠️ (recommended: 32+ characters)'}
            </small>
          </div>
        )}
      </div>

      <style jsx>{`
        .api-key-field {
          margin-top: 0.5rem;
        }

        .api-key-input-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }

        .api-key-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9rem;
          background: #f9f9f9;
        }

        .api-key-input:focus {
          outline: none;
          border-color: #007cba;
          box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.1);
        }

        .api-key-input[readonly] {
          background: #f5f5f5;
          color: #666;
        }

        .api-key-actions {
          display: flex;
          gap: 0.5rem;
          margin-left: 0.5rem;
        }

        .api-key-toggle,
        .api-key-copy {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .api-key-toggle:hover,
        .api-key-copy:hover {
          background: #f0f0f0;
          border-color: #bbb;
        }

        .api-key-generate {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          background: #007cba;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .api-key-generate:hover {
          background: #005a87;
        }

        .api-key-info {
          margin-top: 0.5rem;
          color: #666;
        }

        .field-label {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #333;
        }

        .required {
          color: #e74c3c;
          margin-left: 0.25rem;
        }

        .field-description {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .field-type {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  )
}

export default ApiKeyField
