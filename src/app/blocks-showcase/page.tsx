'use client'

import React from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'

// Примеры блоков для демонстрации
const showcaseBlocks = [
  // Пример Content блока
  {
    blockType: 'content',
    heading: 'Блок с контентом',
    subheading: 'Демонстрация возможностей блока с контентом',
    columns: [
      {
        size: 'oneThird',
        richText: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Колонка 1/3',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'heading',
                version: 1,
                tag: 'h3',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Это колонка шириной в одну треть. Здесь можно разместить дополнительную информацию или небольшие блоки контента.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        enableActions: true,
        actions: [
          {
            actionType: 'button',
            label: 'Подробнее',
            appearance: 'primary',
          },
        ],
      },
      {
        size: 'twoThirds',
        richText: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Колонка 2/3',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'heading',
                version: 1,
                tag: 'h3',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Это колонка шириной в две трети. Здесь можно разместить основной контент страницы или раздела. Блок с контентом позволяет создавать различные макеты с разным количеством колонок и их размерами.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Вы можете добавлять различные элементы форматирования, списки, заголовки и другие компоненты.',
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: null,
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        enableActions: true,
        actions: [
          {
            actionType: 'button',
            label: 'Подробнее',
            appearance: 'primary',
          },
          {
            actionType: 'button',
            label: 'Контакты',
            appearance: 'outline',
          },
        ],
      },
    ],
    settings: {
      backgroundColor: 'light',
      textAlignment: 'left',
      paddingTop: 'medium',
      paddingBottom: 'medium',
      containerWidth: 'default',
    },
  },
  
  // Пример CTA блока
  {
    blockType: 'cta',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Готовы начать работу с нами?',
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'heading',
            version: 1,
            tag: 'h2',
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Свяжитесь с нами сегодня, чтобы узнать, как мы можем помочь вашему бизнесу расти и развиваться.',
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    actions: [
      {
        actionType: 'button',
        label: 'Связаться с нами',
        appearance: 'primary',
      },
      {
        actionType: 'button',
        label: 'Узнать больше',
        appearance: 'outline',
      },
    ],
  },
  
  // Пример Banner блока
  {
    blockType: 'banner',
    style: 'info',
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Важное уведомление: Мы обновили нашу политику конфиденциальности. Пожалуйста, ознакомьтесь с изменениями.',
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
  },
  
  // Пример Media блока
  {
    blockType: 'media',
    media: {
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
      alt: 'Красивый градиент',
      width: 1170,
      height: 658,
    },
    caption: 'Пример медиа блока с изображением и подписью',
  },
]

export default function BlocksShowcasePage() {
  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Демонстрация блоков</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            На этой странице представлены примеры различных блоков, доступных в системе.
            Вы можете использовать их для создания разнообразных макетов страниц.
          </p>
        </div>
        
        <div className="mb-16">
          <RenderBlocks blocks={showcaseBlocks} />
        </div>
        
        <div className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Как использовать блоки</h2>
          <p className="mb-4">
            Блоки можно добавлять и настраивать через административную панель Payload CMS.
            Каждый блок имеет свои уникальные настройки и возможности.
          </p>
          <p>
            Для получения дополнительной информации обратитесь к документации или свяжитесь с администратором системы.
          </p>
        </div>
      </div>
    </div>
  )
}
