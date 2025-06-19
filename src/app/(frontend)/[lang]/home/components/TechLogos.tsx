'use client'

import React from 'react'
import { TechIconsGrid } from '@/components/TechIcon'
import { TechIconsGrouped, techGroups } from '@/components/TechIconsGrouped'

// Список технологий для отображения, отсортированный по группам
const techIconSlugs = [
  // AI модели и сервисы
  'openai',
  'gemini',
  'claude',
  'deepseek',

  // AI фреймворки и инструменты
  'pydanticai',
  'langchain',
  'flowise',
  'n8n',
  'mcp',
  'a2a',
  'agui',

  // Языки программирования
  'typescript',
  'python',

  // Фреймворки и библиотеки
  'react',
  'nextjs',
  'flutter',

  // Платформы и среды выполнения
  'nodejs',
  'telegram',
  'whatsapp',

  // Инструменты разработки
  'figma',

  // Базы данных и бэкенд сервисы
  'supabase',
  'firebase',
  'postgresql',
  'mongodb',
]

interface TechLogosProps {
  grouped?: boolean
  showGroupTitles?: boolean
}

export function TechLogos({ grouped = false, showGroupTitles = false }: TechLogosProps) {
  return (
    <div className="max-w-5xl mx-auto">
      {grouped ? (
        <TechIconsGrouped
          groups={techGroups}
          size="md"
          showGroupTitles={showGroupTitles}
          iconsPerRow={10}
        />
      ) : (
        <TechIconsGrid
          icons={techIconSlugs}
          size="md"
          columns={10}
          mobileColumns={4}
          tabletColumns={6}
        />
      )}
    </div>
  )
}
