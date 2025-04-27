'use client'

import { useContext } from 'react'
import { FormContext } from '@/providers/FormProvider'
import type { FieldValue, FieldValues, ValidationRule } from '@/providers/FormProvider'

/**
 * Custom hook to select specific parts of the form context
 * This helps prevent unnecessary re-renders when only a subset of the context is needed
 * 
 * @param selector A function that selects specific parts of the form context
 * @returns The selected parts of the form context
 */
export function useFormSelector<T>(selector: (context: any) => T): T {
  const context = useContext(FormContext)
  
  if (context === undefined) {
    throw new Error('useFormSelector must be used within a FormProvider')
  }
  
  return selector(context)
}

// Predefined selectors for common use cases

/**
 * Select only the form values
 */
export function useFormValues<T extends FieldValues = FieldValues>() {
  return useFormSelector(context => ({
    values: context.formState.values as T,
    setValue: context.setValue,
    setValues: context.setValues,
    isDirty: context.formState.isDirty,
  }))
}

/**
 * Select only the form errors
 */
export function useFormErrors() {
  return useFormSelector(context => ({
    errors: context.formState.errors,
    setError: context.setError,
    setErrors: context.setErrors,
    clearErrors: context.clearErrors,
    isValid: context.formState.isValid,
  }))
}

/**
 * Select only the form submission state
 */
export function useFormSubmission() {
  return useFormSelector(context => ({
    isSubmitting: context.formState.isSubmitting,
    submitCount: context.formState.submitCount,
    handleSubmit: context.handleSubmit,
    isValid: context.formState.isValid,
  }))
}

/**
 * Select only the form validation
 */
export function useFormValidation() {
  return useFormSelector(context => ({
    validate: context.validate,
    validateField: context.validateField,
    isValid: context.formState.isValid,
    errors: context.formState.errors,
  }))
}

/**
 * Get a specific field from the form
 */
export function useFormField(name: string, validation?: ValidationRule[]) {
  return useFormSelector(context => {
    const fieldProps = context.register(name, { validation })
    
    return {
      field: fieldProps,
      value: context.formState.values[name],
      error: context.formState.errors[name],
      touched: context.formState.touched[name],
      setValue: (value: FieldValue, options?: { shouldValidate?: boolean; shouldTouch?: boolean }) => 
        context.setValue(name, value, options),
      setError: (error: string) => context.setError(name, error),
      clearError: () => context.clearErrors(name),
      setTouched: (isTouched?: boolean) => context.setTouched(name, isTouched),
      validate: () => context.validate(name),
    }
  })
}
