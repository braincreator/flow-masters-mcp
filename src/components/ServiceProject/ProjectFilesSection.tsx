'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/utilities/formatDate'

interface User {
  id: string
  name: string
}

interface Media {
  id: string
  filename: string
  url: string
  createdAt: string
  updatedAt: string
}

interface Message {
  id: string
  author: User
  content: any
  attachments?: Media[]
  createdAt: string
}

interface ServiceProject {
  id: string
  specificationFiles: Media[]
}

interface ProjectFilesSectionProps {
  project: ServiceProject
  messages: Message[]
  isAdmin: boolean
}

const ProjectFilesSection: React.FC<ProjectFilesSectionProps> = ({
  project,
  messages,
  isAdmin,
}) => {
  const t = useTranslations('ProjectDetails')

  // Функция для определения расширения файла
  const getFileExtension = (filename: string) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
  }

  // Функция для определения типа файла по расширению
  const getFileType = (filename: string) => {
    const ext = getFileExtension(filename).toLowerCase()

    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return 'image'
    } else if (['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt'].includes(ext)) {
      return 'document'
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return 'spreadsheet'
    } else if (['ppt', 'pptx'].includes(ext)) {
      return 'presentation'
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return 'archive'
    } else {
      return 'other'
    }
  }

  // Иконка файла в зависимости от его типа
  const FileIcon = ({ filename }: { filename: string }) => {
    const fileType = getFileType(filename)
    const iconClass = 'h-6 w-6'

    switch (fileType) {
      case 'image':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )
      case 'document':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )
      case 'spreadsheet':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )
      case 'archive':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
        )
      default:
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )
    }
  }

  // Собираем все файлы из ТЗ и сообщений
  const specificationFiles = project.specificationFiles || []

  // Файлы из сообщений
  const messageFiles: Array<{ file: Media; message: Message }> = []
  messages.forEach((message) => {
    if (message.attachments && message.attachments.length > 0) {
      message.attachments.forEach((file) => {
        messageFiles.push({ file, message })
      })
    }
  })

  // Функция для предпросмотра изображений
  const isImage = (filename: string) => {
    return getFileType(filename) === 'image'
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{t('files')}</h2>

      {/* Файлы ТЗ */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-medium">{t('specificationFiles')}</h3>
        </div>
        <div className="p-6">
          {specificationFiles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {specificationFiles.map((file) => (
                <li key={file.id} className="py-4 flex items-center">
                  <div className="text-gray-500 mr-3">
                    <FileIcon filename={file.filename} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                    <p className="text-xs text-gray-500">{formatDate(file.createdAt)}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {isImage(file.filename) && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        {t('preview')}
                      </a>
                    )}
                    <a
                      href={file.url}
                      download
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {t('download')}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">{t('noSpecificationFiles')}</p>
          )}
        </div>
      </div>

      {/* Файлы из сообщений */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-base font-medium">{t('messageFiles')}</h3>
        </div>
        <div className="p-6">
          {messageFiles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {messageFiles.map(({ file, message }) => (
                <li key={file.id} className="py-4 flex items-center">
                  <div className="text-gray-500 mr-3">
                    <FileIcon filename={file.filename} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                    <p className="text-xs text-gray-500">
                      {t('addedBy')} {message.author.name} {formatDate(message.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    {isImage(file.filename) && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        {t('preview')}
                      </a>
                    )}
                    <a
                      href={file.url}
                      download
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      {t('download')}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">{t('noMessageFiles')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectFilesSection
