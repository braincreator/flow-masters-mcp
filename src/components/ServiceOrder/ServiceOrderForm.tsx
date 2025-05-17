'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/utilities/formatPrice'
import FileUpload from '@/components/FileUpload'

interface Service {
  id: string
  title: string
  price: number
  shortDescription?: string
  description?: any // Для richText
}

interface ServiceOrderFormProps {
  lang: string
  service: Service
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({ lang, service }) => {
  const t = useTranslations('ServiceOrder')
  const router = useRouter()

  const [specificationText, setSpecificationText] = useState<string>('')
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)

  // Функция для загрузки файлов
  const handleFilesChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles])
  }

  // Функция для удаления файла
  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}

    if (!specificationText.trim()) {
      errors.specificationText = t('specificationRequired')
    } else if (specificationText.trim().length < 20) {
      errors.specificationText = t('specificationTooShort')
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [specificationText, t])

  const togglePreview = () => {
    setIsPreviewMode((prev) => !prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Проверка валидации
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Загружаем файлы, если они есть
      const uploadedFileIds = []

      if (files.length > 0) {
        setIsUploadingFiles(true)

        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)

          const uploadRes = await fetch('/api/media', {
            method: 'POST',
            body: formData,
          })

          if (!uploadRes.ok) {
            throw new Error(`${t('errorUploadingFile')} ${file.name}`)
          }

          const uploadedFile = await uploadRes.json()
          uploadedFileIds.push(uploadedFile.id)
        }

        setIsUploadingFiles(false)
      }

      // 2. Создаем заказ
      const orderData = {
        orderType: 'service',
        items: [
          {
            service: service.id,
            quantity: 1,
            price: service.price,
          },
        ],
        // Для локализованного поля создаем объект
        specificationText: {
          [lang]: specificationText,
        },
        specificationFiles: uploadedFileIds,
      }

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!orderRes.ok) {
        const errorData = await orderRes.json()
        throw new Error(errorData.message || t('errorCreatingOrder'))
      }

      const order = await orderRes.json()

      // Показываем сообщение об успехе
      setSuccess(true)

      // Редирект на страницу с успешным заказом
      setTimeout(() => {
        router.push(`/${lang}/order-success?id=${order.id}`)
      }, 2000)
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err instanceof Error ? err.message : t('unknownError'))
    } finally {
      setIsLoading(false)
      setIsUploadingFiles(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {success ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <div className="text-green-600 text-xl font-semibold mb-4">{t('orderSuccess')}</div>
          <p>{t('redirecting')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
            <p className="text-gray-600">{service.shortDescription}</p>
            <div className="mt-2 font-semibold text-lg">{formatPrice(service.price, lang)}</div>
          </div>

          {!isPreviewMode ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('specificationLabel')}
                </label>
                <button
                  type="button"
                  onClick={togglePreview}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('preview')}
                </button>
              </div>
              <textarea
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.specificationText ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={6}
                value={specificationText}
                onChange={(e) => setSpecificationText(e.target.value)}
                placeholder={t('specificationPlaceholder')}
                required
              />
              {validationErrors.specificationText && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.specificationText}</p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700">{t('previewSpecification')}</h4>
                <button
                  type="button"
                  onClick={togglePreview}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('edit')}
                </button>
              </div>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 prose max-w-none">
                {specificationText ? (
                  <div className="whitespace-pre-wrap">{specificationText}</div>
                ) : (
                  <p className="text-gray-500 italic">{t('noSpecificationText')}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('filesLabel')}
            </label>
            <FileUpload
              onFilesAdded={handleFilesChange}
              multiple
              accept="*/*"
              isUploading={isUploadingFiles}
            />

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-sm font-medium text-gray-700">{t('selectedFiles')}:</div>
                <ul className="space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <span>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isLoading || isUploadingFiles}
                      >
                        {t('remove')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

          <button
            type="submit"
            disabled={isLoading || isUploadingFiles}
            className={`w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading || isUploadingFiles ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isUploadingFiles ? t('uploadingFiles') : t('submitting')}
              </span>
            ) : (
              t('submitOrder')
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default ServiceOrderForm
