'use client'

import React, { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // в байтах
  isUploading?: boolean // Индикатор внешней загрузки файлов
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesAdded,
  multiple = false,
  accept = '*/*',
  maxSize = 5 * 1024 * 1024, // 5MB по умолчанию
  isUploading = false,
}) => {
  const t = useTranslations('FileUpload')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isUploading) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    if (isUploading) {
      return
    }

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFiles(Array.from(event.dataTransfer.files))
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      processFiles(Array.from(files))

      // Сбрасываем input, чтобы можно было загрузить тот же файл повторно
      event.target.value = ''
    }
  }

  const processFiles = (files: File[]) => {
    setError(null)

    // Проверка размера файлов
    const oversizedFiles = files.filter((file) => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      setError(
        t('fileSizeError', {
          count: oversizedFiles.length,
          maxSize: Math.round(maxSize / 1024 / 1024),
        }),
      )
      return
    }

    onFilesAdded(files)
  }

  return (
    <div className="w-full">
      <div
        className={`cursor-pointer border-2 border-dashed rounded-md p-6 text-center ${
          isUploading
            ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
            : isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-6 w-6 text-blue-500 mb-2"
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
            <p className="text-sm text-gray-600">{t('uploading')}</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-1 text-sm text-gray-600">
              {t('dropFiles')} {multiple ? '' : t('oneFileOnly')}
            </p>
            <p className="mt-1 text-xs text-gray-500">{t('orClickToBrowse')}</p>
          </>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          disabled={isUploading}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FileUpload
