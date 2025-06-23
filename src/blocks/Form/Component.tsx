'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { useEnhancedFormSubmission } from '@/hooks/useEnhancedFormSubmission'
import { FormTrackingContext } from './FieldWrapper'

import { fields } from './fields'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields as any,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const router = useRouter()

  // Обогащенная отправка формы
  const {
    isLoading,
    isSuccess,
    error: submissionError,
    submitForm,
    resetForm,
    handleFormStart,
    handleFieldInteraction,
  } = useEnhancedFormSubmission({
    formName: formFromProps?.title || 'form_block',
    formType: 'form_block',
    formId: formID,
    formLocation: 'form_block_component',
    apiEndpoint: '/api/form-submissions',
    collectLocation: false,
    enableAnalytics: true,
    enableTracking: true,
    onSuccess: (response) => {
      if (confirmationType === 'redirect' && redirect) {
        const { url } = redirect
        if (url) router.push(url)
      }
    },
    onError: (error) => {
      logError('Form block submission error:', error)
    },
  })

  const onSubmit = useCallback(
    async (data: FormFieldBlock[]) => {
      try {
        // Преобразуем данные формы в нужный формат
        const formData = Object.entries(data).reduce((acc, [name, value]) => {
          acc[name] = value
          return acc
        }, {} as Record<string, any>)

        // Отправляем форму с полными метаданными
        await submitForm(formData)
      } catch (err) {
        logError('Form submission error:', err)
      }
    },
    [submitForm],
  )

  return (
    <div className="container lg:max-w-[48rem]">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="p-4 lg:p-6 border border-border rounded-[0.8rem]">
        <FormTrackingContext.Provider
          value={{
            handleFormStart,
            handleFieldInteraction,
          }}
        >
          <FormProvider {...formMethods}>
            {!isLoading && isSuccess && confirmationType === 'message' && (
              <RichText data={confirmationMessage} />
            )}
            {isLoading && !isSuccess && <p>Loading, please wait...</p>}
            {submissionError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-4">
                {submissionError}
              </div>
            )}
            {!isSuccess && (
              <form id={formID} onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4 last:mb-0">
                  {formFromProps &&
                    formFromProps.fields &&
                    formFromProps.fields?.map((field, index) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                      if (Field) {
                        return (
                          <div className="mb-6 last:mb-0" key={index}>
                            <Field
                              form={formFromProps}
                              {...field}
                              {...formMethods}
                              control={control}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        )
                      }
                      return null
                    })}
                </div>

                <Button form={formID} type="submit" variant="default" disabled={isLoading}>
                  {isLoading ? 'Отправка...' : submitButtonLabel}
                </Button>
              </form>
            )}
          </FormProvider>
        </FormTrackingContext.Provider>
      </div>
    </div>
  )
}
