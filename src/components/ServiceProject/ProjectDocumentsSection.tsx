'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'

interface ServiceProject {
  id: string
  specificationText: {
    ru?: string
    en?: string
  }
  specificationFiles: Array<{
    id: string
    filename: string
    url: string
  }>
  notes?: any // richText
}

interface ProjectDocumentsSectionProps {
  project: ServiceProject
  isAdmin: boolean
}

const ProjectDocumentsSection: React.FC<ProjectDocumentsSectionProps> = ({ project, isAdmin }) => {
  const t = useTranslations('ProjectDetails')
  const locale = useLocale()

  // Получаем текст ТЗ в зависимости от локали
  const specificationText =
    project.specificationText?.[locale as 'ru' | 'en'] ||
    project.specificationText?.ru ||
    project.specificationText?.en

  // Вспомогательная функция для определения расширения файла
  const getFileExtension = (filename: string) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
  }

  // Вспомогательная функция для определения типа файла
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

  return (
    <div className="space-y-8">
      {/* Секция технического задания */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">{t('specification')}</h2>
        </div>
        <div className="p-6">
          {specificationText ? (
            <div className="prose max-w-none whitespace-pre-wrap">{specificationText}</div>
          ) : (
            <p className="text-gray-500 italic">{t('noSpecification')}</p>
          )}
        </div>
      </div>

      {/* Секция файлов ТЗ */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold">{t('specificationFiles')}</h2>
        </div>
        <div className="p-6">
          {project.specificationFiles && project.specificationFiles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {project.specificationFiles.map((file) => (
                <li key={file.id} className="py-3 flex items-center">
                  <div className="text-gray-500 mr-3">
                    <FileIcon filename={file.filename} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.filename}</p>
                  </div>
                  <div className="ml-4">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {t('download')}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">{t('noFiles')}</p>
          )}
        </div>
      </div>

      {/* Секция заметок (видна только администраторам или если есть заметки) */}
      {(isAdmin || project.notes) && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold">{t('notes')}</h2>
          </div>
          <div className="p-6">
            {project.notes ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: project.notes }}
              />
            ) : (
              <p className="text-gray-500 italic">{t('noNotes')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDocumentsSection
