import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { useFormContext } from 'react-hook-form'
import React from 'react'
import { PrivacyConsent as PrivacyConsentComponent } from '@/components/forms/PrivacyConsent'

import { Error } from '../Error'
import { Width } from '../Width'

export const PrivacyConsent: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const { setValue, watch } = useFormContext()
  const value = watch(name)

  return (
    <Width width={width}>
      <PrivacyConsentComponent
        id={name}
        checked={value || defaultValue || false}
        onCheckedChange={(checked) => setValue(name, checked)}
        error={errors[name]?.message as string}
        required={required}
        size="md"
      />
      {errors[name] && <Error />}
    </Width>
  )
}
