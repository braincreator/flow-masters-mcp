'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Define form field types
export type FieldValue = string | number | boolean | null | undefined | string[] | number[]
export type FieldValues = Record<string, FieldValue>
export type FieldErrors = Record<string, string>
export type FieldTouched = Record<string, boolean>

// Define validation types
export type ValidationRule =
  | { type: 'required'; message?: string }
  | { type: 'minLength'; value: number; message?: string }
  | { type: 'maxLength'; value: number; message?: string }
  | { type: 'pattern'; pattern: RegExp; message?: string }
  | { type: 'min'; value: number; message?: string }
  | { type: 'max'; value: number; message?: string }
  | { type: 'email'; message?: string }
  | { type: 'url'; message?: string }
  | { type: 'custom'; validate: (value: any) => boolean; message?: string }
  | { type: 'zod'; schema: z.ZodType<any>; message?: string }

export type FieldValidation = Record<string, ValidationRule[]>

// Define form state
export interface FormState<T extends FieldValues = FieldValues> {
  values: T
  defaultValues: Partial<T>
  errors: FieldErrors
  touched: FieldTouched
  isDirty: boolean
  isSubmitting: boolean
  isValid: boolean
  submitCount: number
}

// Define form context
export interface FormContextType<T extends FieldValues = FieldValues> {
  // Form state
  formState: FormState<T>

  // Field registration and manipulation
  register: (
    name: string,
    options?: { validation?: ValidationRule[] },
  ) => {
    name: string
    value: FieldValue
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => void
    onBlur: () => void
    ref: React.RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  }

  // Form state manipulation
  setValue: (
    name: string,
    value: FieldValue,
    options?: { shouldValidate?: boolean; shouldTouch?: boolean },
  ) => void
  setValues: (
    values: Partial<T>,
    options?: { shouldValidate?: boolean; shouldTouch?: boolean },
  ) => void
  setError: (name: string, error: string) => void
  setErrors: (errors: FieldErrors) => void
  clearErrors: (name?: string) => void
  setTouched: (name: string, isTouched?: boolean) => void
  reset: (values?: Partial<T>) => void

  // Validation
  validate: (name?: string) => boolean
  validateField: (name: string, value: FieldValue) => string | null

  // Submission
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e: React.FormEvent) => void
}

// Create context
export const FormContext = createContext<FormContextType | undefined>(undefined)

// Provider props
interface FormProviderProps<T extends FieldValues = FieldValues> {
  children: ReactNode
  defaultValues?: Partial<T>
  onSubmit?: (values: T) => Promise<void> | void
  validation?: FieldValidation
  id?: string
}

// Provider component
export function FormProvider<T extends FieldValues = FieldValues>({
  children,
  defaultValues = {},
  onSubmit,
  validation = {},
  id,
}: FormProviderProps<T>) {
  // Field refs for focus management
  const fieldRefs = useMemo(() => new Map<string, React.RefObject<any>>(), [])

  // Initial form state
  const [formState, setFormState] = useState<FormState<T>>({
    values: defaultValues as T,
    defaultValues,
    errors: {},
    touched: {},
    isDirty: false,
    isSubmitting: false,
    isValid: true,
    submitCount: 0,
  })

  // Validate a single field
  const validateField = useCallback(
    (name: string, value: FieldValue): string | null => {
      const fieldValidation = validation[name]

      if (!fieldValidation) return null

      for (const rule of fieldValidation) {
        switch (rule.type) {
          case 'required':
            if (value === undefined || value === null || value === '') {
              return rule.message || 'This field is required'
            }
            break

          case 'minLength':
            if (typeof value === 'string' && value.length < rule.value) {
              return rule.message || `Minimum length is ${rule.value} characters`
            }
            break

          case 'maxLength':
            if (typeof value === 'string' && value.length > rule.value) {
              return rule.message || `Maximum length is ${rule.value} characters`
            }
            break

          case 'pattern':
            if (typeof value === 'string' && !rule.pattern.test(value)) {
              return rule.message || 'Invalid format'
            }
            break

          case 'min':
            if (typeof value === 'number' && value < rule.value) {
              return rule.message || `Minimum value is ${rule.value}`
            }
            break

          case 'max':
            if (typeof value === 'number' && value > rule.value) {
              return rule.message || `Maximum value is ${rule.value}`
            }
            break

          case 'email':
            if (
              typeof value === 'string' &&
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
            ) {
              return rule.message || 'Invalid email address'
            }
            break

          case 'url':
            if (
              typeof value === 'string' &&
              !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)
            ) {
              return rule.message || 'Invalid URL'
            }
            break

          case 'custom':
            if (!rule.validate(value)) {
              return rule.message || 'Invalid value'
            }
            break

          case 'zod':
            try {
              rule.schema.parse(value)
            } catch (error) {
              if (error instanceof z.ZodError) {
                return rule.message || error.errors[0]?.message || 'Invalid value'
              }
            }
            break
        }
      }

      return null
    },
    [validation],
  )

  // Validate all fields or a specific field
  const validate = useCallback(
    (name?: string): boolean => {
      if (name) {
        const error = validateField(name, formState.values[name])

        setFormState((prev) => ({
          ...prev,
          errors: {
            ...prev.errors,
            [name]: error || undefined,
          },
          isValid: !error && Object.values(prev.errors).every((err) => !err),
        }))

        return !error
      }

      const newErrors: FieldErrors = {}
      let isValid = true

      Object.keys(validation).forEach((fieldName) => {
        const error = validateField(fieldName, formState.values[fieldName])

        if (error) {
          newErrors[fieldName] = error
          isValid = false
        }
      })

      setFormState((prev) => ({
        ...prev,
        errors: newErrors,
        isValid,
      }))

      return isValid
    },
    [formState.values, validateField, validation],
  )

  // Register a field
  const register = useCallback(
    (name: string, options?: { validation?: ValidationRule[] }) => {
      // Create ref if it doesn't exist
      if (!fieldRefs.has(name)) {
        fieldRefs.set(name, React.createRef())
      }

      // Add validation rules if provided
      if (options?.validation) {
        validation[name] = options.validation
      }

      return {
        name,
        value: formState.values[name] || '',
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        ) => {
          const value =
            e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value

          setValue(name, value)
        },
        onBlur: () => setTouched(name, true),
        ref: fieldRefs.get(name),
      }
    },
    [fieldRefs, formState.values, validation],
  )

  // Set a field value
  const setValue = useCallback(
    (
      name: string,
      value: FieldValue,
      options?: { shouldValidate?: boolean; shouldTouch?: boolean },
    ) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value }
        const isDirty = JSON.stringify(newValues) !== JSON.stringify(prev.defaultValues)

        return {
          ...prev,
          values: newValues as T,
          isDirty,
          touched: options?.shouldTouch ? { ...prev.touched, [name]: true } : prev.touched,
        }
      })

      if (options?.shouldValidate) {
        validate(name)
      }
    },
    [validate],
  )

  // Set multiple field values
  const setValues = useCallback(
    (values: Partial<T>, options?: { shouldValidate?: boolean; shouldTouch?: boolean }) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, ...values }
        const isDirty = JSON.stringify(newValues) !== JSON.stringify(prev.defaultValues)

        const newTouched = options?.shouldTouch
          ? Object.keys(values).reduce(
              (acc, key) => {
                acc[key] = true
                return acc
              },
              { ...prev.touched },
            )
          : prev.touched

        return {
          ...prev,
          values: newValues as T,
          isDirty,
          touched: newTouched,
        }
      })

      if (options?.shouldValidate) {
        validate()
      }
    },
    [validate],
  )

  // Set a field error
  const setError = useCallback((name: string, error: string) => {
    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: error,
      },
      isValid: false,
    }))
  }, [])

  // Set multiple field errors
  const setErrors = useCallback((errors: FieldErrors) => {
    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...errors,
      },
      isValid: Object.keys(errors).length === 0,
    }))
  }, [])

  // Clear errors
  const clearErrors = useCallback((name?: string) => {
    setFormState((prev) => {
      if (name) {
        const newErrors = { ...prev.errors }
        delete newErrors[name]

        return {
          ...prev,
          errors: newErrors,
          isValid: Object.values(newErrors).every((err) => !err),
        }
      }

      return {
        ...prev,
        errors: {},
        isValid: true,
      }
    })
  }, [])

  // Set a field as touched
  const setTouched = useCallback(
    (name: string, isTouched: boolean = true) => {
      setFormState((prev) => ({
        ...prev,
        touched: {
          ...prev.touched,
          [name]: isTouched,
        },
      }))

      // Validate on blur
      validate(name)
    },
    [validate],
  )

  // Reset form
  const reset = useCallback(
    (values?: Partial<T>) => {
      const newValues = values || defaultValues

      setFormState({
        values: newValues as T,
        defaultValues: newValues,
        errors: {},
        touched: {},
        isDirty: false,
        isSubmitting: false,
        isValid: true,
        submitCount: 0,
      })
    },
    [defaultValues],
  )

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => {
      return async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate all fields
        const isValid = validate()

        setFormState((prev) => ({
          ...prev,
          submitCount: prev.submitCount + 1,
        }))

        if (!isValid) {
          // Focus the first field with an error
          const firstErrorField = Object.keys(formState.errors)[0]
          if (firstErrorField) {
            const ref = fieldRefs.get(firstErrorField)
            if (ref?.current) {
              ref.current.focus()
            }
          }

          toast.error('Please fix the form errors before submitting')
          return
        }

        setFormState((prev) => ({
          ...prev,
          isSubmitting: true,
        }))

        try {
          await onSubmit(formState.values)
        } catch (error) {
          logError('Form submission error:', error)

          if (error instanceof z.ZodError) {
            const errors: FieldErrors = {}

            error.errors.forEach((err) => {
              if (err.path.length > 0) {
                errors[err.path[0]] = err.message
              }
            })

            setErrors(errors)
          } else if (error instanceof Error) {
            toast.error(error.message || 'Form submission failed')
          } else {
            toast.error('Form submission failed')
          }
        } finally {
          setFormState((prev) => ({
            ...prev,
            isSubmitting: false,
          }))
        }
      }
    },
    [fieldRefs, formState.errors, formState.values, setErrors, validate],
  )

  // Memoize context value
  const value = useMemo(
    () => ({
      formState,
      register,
      setValue,
      setValues,
      setError,
      setErrors,
      clearErrors,
      setTouched,
      reset,
      validate,
      validateField,
      handleSubmit,
    }),
    [
      formState,
      register,
      setValue,
      setValues,
      setError,
      setErrors,
      clearErrors,
      setTouched,
      reset,
      validate,
      validateField,
      handleSubmit,
    ],
  )

  return (
    <FormContext.Provider value={value}>
      {onSubmit ? (
        <form id={id} onSubmit={handleSubmit(onSubmit)}>
          {children}
        </form>
      ) : (
        children
      )}
    </FormContext.Provider>
  )
}

// Custom hook to use the form context
export function useForm<T extends FieldValues = FieldValues>() {
  const context = useContext(FormContext)

  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider')
  }

  return context as FormContextType<T>
}
