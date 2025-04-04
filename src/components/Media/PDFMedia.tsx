'use client'

import React from 'react'
import { cn } from '@/utilities/ui'
import type { Props } from './types'

const PDFMedia: React.FC<Props> = ({
  resource,
  src,
  width = 600,
  height = 800,
  fill = false,
  imgClassName,
}) => {
  // Получаем URL документа
  const pdfUrl = (() => {
    if (src) return typeof src === 'string' ? src : src.src
    if (!resource) return null
    if (typeof resource === 'string') return resource
    if (typeof resource === 'object' && 'url' in resource) return resource.url
    return null
  })()

  if (!pdfUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted/30 rounded border border-border',
          imgClassName,
        )}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <span className="text-sm text-muted-foreground">PDF документ недоступен</span>
      </div>
    )
  }

  return (
    <div className={cn('pdf-viewer rounded overflow-hidden', imgClassName)}>
      <object
        data={pdfUrl}
        type="application/pdf"
        width={fill ? '100%' : width}
        height={fill ? '100%' : height}
        className="w-full rounded border border-border"
      >
        <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30 p-4 text-center">
          <p className="mb-2">Не удалось отобразить PDF в браузере</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Открыть PDF
          </a>
        </div>
      </object>
    </div>
  )
}

export { PDFMedia }
export default PDFMedia
