'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Динамически импортируем компонент страницы генерации лендингов
// с отключенным SSR, чтобы избежать проблем с гидратацией
const LandingGeneratorPage = dynamic(() => import('@/app/(admin)/admin/landing-generator/page'), {
  ssr: false,
})

// Компонент-обертка для страницы генерации лендингов
const LandingGeneratorView: React.FC = () => {
  return (
    <div className="payload-custom-view">
      <LandingGeneratorPage />
    </div>
  )
}

export default LandingGeneratorView
