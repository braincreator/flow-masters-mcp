'use client'

import React, { useState, useCallback } from 'react'
import { Button, Modal } from '@payloadcms/ui'
// import { useField } from 'payload/components/forms' // Removed
import { AppError, ErrorSeverity } from '@/utilities/errorHandling'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Стили для модального окна и iframe
// const modalStyles: React.CSSProperties = { // Removed
//   position: 'fixed',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: '80vw',
//   height: '80vh',
//   backgroundColor: 'white',
//   zIndex: 1000,
//   display: 'flex',
//   flexDirection: 'column',
//   boxShadow: '0 5px 15px rgba(0,0,0,.5)',
//   borderRadius: '4px',
// }

const modalHeaderStyles: React.CSSProperties = {
  padding: '1rem',
  borderBottom: '1px solid #eee',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const modalBodyStyles: React.CSSProperties = {
  flexGrow: 1,
  padding: '1rem',
  overflow: 'hidden',
}

const iframeStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
}

export const PreviewButton: React.FC = () => {
  // Получаем ID текущего документа (шаблона)
  // В Payload 3 `id` находится в `window.location.pathname`
  const pathSegments = window.location.pathname.split('/')
  const docId = pathSegments[pathSegments.length - 1]

  const [showModal, setShowModal] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('<p>Загрузка...</p>')
  const [isLoading, setIsLoading] = useState(false)

  const fetchPreview = useCallback(async () => {
    if (!docId || docId === 'create') {
      new AppError({
        message: 'Сохраните шаблон перед предпросмотром.',
        severity: ErrorSeverity.INFO,
      }).notify()
      return
    }
    setIsLoading(true)
    setShowModal(true)
    try {
      const apiUrl = `/api/email-templates/${docId}/preview`
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`Ошибка при загрузке предпросмотра: ${response.statusText}`)
      }
      const html = await response.text()
      setPreviewHtml(html)
    } catch (error: any) {
      logError('Ошибка предпросмотра:', error)
      setPreviewHtml(`<p style="color: red;">Ошибка загрузки предпросмотра: ${error.message}</p>`)
    } finally {
      setIsLoading(false)
    }
  }, [docId])

  const handleCloseModal = () => {
    setShowModal(false)
    setPreviewHtml('<p>Загрузка...</p>') // Сбрасываем HTML при закрытии
  }

  return (
    <div>
      <Button onClick={fetchPreview} disabled={isLoading || !docId || docId === 'create'}>
        {isLoading ? 'Загрузка...' : 'Предпросмотр'}
      </Button>

      {showModal && (
        // Используем стандартный компонент Modal из Payload
        <Modal slug="email-template-preview-modal" className="preview-modal">
          <div style={modalHeaderStyles}>
            <h3>Предпросмотр шаблона</h3>
            <Button buttonStyle="icon-label" icon="x" onClick={handleCloseModal} />
          </div>
          <div style={modalBodyStyles}>
            <iframe
              srcDoc={previewHtml} // Используем srcDoc для вставки HTML
              style={iframeStyles}
              title="Предпросмотр Email"
              sandbox=""
            />
          </div>
        </Modal>
      )}
      {/* Простой CSS для модального окна, если стандартный не подходит */}
      <style>{`
        .preview-modal {
          width: 80vw !important;
          height: 80vh !important;
          max-width: 1200px !important;
          max-height: 900px !important;
          overflow: hidden; /* Убираем скролл модального окна */
        }
      `}</style>
    </div>
  )
}
