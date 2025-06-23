'use client'

import React, { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { formatDate } from '@/utilities/formatDate'
import FileUpload from '@/components/FileUpload'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface User {
  id: string
  name: string
}

interface Message {
  id: string
  author: User
  content: any // richText
  attachments?: Array<{
    id: string
    filename: string
    url: string
  }>
  isSystemMessage?: boolean
  createdAt: string
}

interface ProjectDiscussionsSectionProps {
  projectId: string
  messages: Message[]
  isAdmin: boolean
}

const ProjectDiscussionsSection: React.FC<ProjectDiscussionsSectionProps> = ({
  projectId,
  messages,
  isAdmin,
}) => {
  const t = useTranslations('ProjectDetails')
  const [messageText, setMessageText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Функция для отправки нового сообщения
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // 1. Загружаем файлы, если они есть
      const uploadedFileIds = []

      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadRes = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error(`Ошибка загрузки файла ${file.name}`)
        }

        const uploadedFile = await uploadRes.json()
        uploadedFileIds.push(uploadedFile.id)
      }

      // 2. Создаем сообщение
      const messageData = {
        project: projectId,
        content: [
          {
            children: [
              {
                text: messageText,
              },
            ],
          },
        ],
        attachments: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
      }

      const messageRes = await fetch('/api/project-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      })

      if (!messageRes.ok) {
        const errorData = await messageRes.json()
        throw new Error(errorData.message || 'Ошибка при отправке сообщения')
      }

      // Сбрасываем форму и обновляем страницу
      setMessageText('')
      setFiles([])
      window.location.reload()
    } catch (error) {
      logError('Error sending message:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Неизвестная ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для загрузки файлов
  const handleFilesChange = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles])
  }

  // Функция для удаления файла
  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  // Функция для рендеринга содержимого сообщения
  const renderMessageContent = (content: any) => {
    // Проверяем, является ли содержимое строкой (старый формат) или объектом Lexical Editor
    if (typeof content === 'string') {
      return <div className="whitespace-pre-wrap">{content}</div>
    }

    // Если это массив узлов Lexical Editor
    if (Array.isArray(content)) {
      return (
        <div className="whitespace-pre-wrap">
          {content.map((paragraph, index) => (
            <p key={index} className={index > 0 ? 'mt-2' : ''}>
              {paragraph.children?.map((child: any, childIndex: number) => (
                <span key={childIndex}>{child.text}</span>
              ))}
            </p>
          ))}
        </div>
      )
    }

    // Если не смогли определить формат, возвращаем содержимое как есть
    return <div>{JSON.stringify(content)}</div>
  }

  return (
    <div className="space-y-6">
      {/* Заголовок секции */}
      <h2 className="text-lg font-semibold">{t('discussions')}</h2>

      {/* Ошибка, если есть */}
      {errorMessage && <div className="p-4 bg-red-100 text-red-700 rounded-md">{errorMessage}</div>}

      {/* Сообщения */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 max-h-96 overflow-y-auto">
          {messages.length > 0 ? (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isSystemMessage ? 'bg-blue-50 p-4 rounded-lg' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{message.author.name}</span>
                          {message.isSystemMessage && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {t('systemMessage')}
                            </span>
                          )}
                          <span className="ml-2 text-sm text-gray-500">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          {renderMessageContent(message.content)}
                        </div>

                        {/* Прикрепленные файлы */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-xs font-medium text-gray-500">
                              {t('attachments')}:
                            </h4>
                            <ul className="mt-1 space-y-1">
                              {message.attachments.map((attachment) => (
                                <li key={attachment.id} className="text-sm">
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {attachment.filename}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <p className="text-center text-gray-500">{t('noMessages')}</p>
          )}
        </div>

        {/* Форма отправки сообщения */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="message" className="sr-only">
                {t('messageLabel')}
              </label>
              <textarea
                id="message"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder={t('messagePlaceholder')}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
              />
            </div>

            {/* Загрузка файлов */}
            <div className="mt-3">
              <FileUpload onFilesAdded={handleFilesChange} multiple accept="*/*" />

              {files.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-gray-500">{t('selectedFiles')}:</h4>
                  <ul className="mt-1 space-y-1">
                    {files.map((file, index) => (
                      <li key={index} className="flex justify-between items-center text-sm">
                        <span>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          {t('remove')}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !messageText.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading || !messageText.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? t('sending') : t('send')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProjectDiscussionsSection
