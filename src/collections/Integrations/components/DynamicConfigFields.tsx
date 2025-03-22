import React, { useEffect, useState } from 'react'
import { useField, useFormFields } from 'payload/components/forms'
import { Text } from 'payload/components/fields/Text'
import { Select } from 'payload/components/fields/Select'
import { CodeEditor } from 'payload/components/fields/Code'
import { IntegrationTemplates } from '../templates'

export const DynamicConfigFields: React.FC = () => {
  const { value: template } = useFormFields(([fields]) => fields.template)
  const { value, setValue } = useField<Record<string, any>>({ path: 'config' })
  
  const [fields, setFields] = useState([])

  useEffect(() => {
    const templateConfig = IntegrationTemplates.find(t => t.slug === template)
    if (templateConfig) {
      // Set default values if not already set
      setValue({
        ...templateConfig.defaultConfig,
        ...value,
      })
      
      // Generate fields based on template
      setFields(Object.entries(templateConfig.defaultConfig).map(([key, defaultValue]) => {
        const fieldProps = {
          name: key,
          label: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          required: true,
        }

        if (typeof defaultValue === 'boolean') {
          return {
            ...fieldProps,
            type: 'select',
            options: [
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ],
          }
        }

        if (key.includes('template')) {
          return {
            ...fieldProps,
            type: 'code',
            language: 'html',
          }
        }

        return {
          ...fieldProps,
          type: 'text',
        }
      }))
    }
  }, [template])

  return (
    <div className="integration-config">
      {fields.map((field) => {
        const Component = {
          text: Text,
          select: Select,
          code: CodeEditor,
        }[field.type]

        return (
          <Component
            key={field.name}
            {...field}
            path={`config.${field.name}`}
          />
        )
      })}
    </div>
  )
}