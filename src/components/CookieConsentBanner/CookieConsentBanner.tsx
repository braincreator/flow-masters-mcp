'use client' // Директива Next.js для клиентских компонентов

import React, { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

const COOKIE_NAME = 'gdpr_consent_status'
const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

declare global {
  interface Window {
    ym?: (counterId: number, action: string, params?: any) => void
  }
}

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consentStatus = Cookies.get(COOKIE_NAME)
    if (!consentStatus) {
      setShowBanner(true)
    }
    // Важно: Не инициализируем отправку хита здесь,
    // если счетчик загружается с отложенной отправкой.
  }, [])

  const sendYandexHit = () => {
    if (YANDEX_METRIKA_ID && typeof window.ym === 'function') {
      try {
        const counterId = parseInt(YANDEX_METRIKA_ID, 10)
        if (!isNaN(counterId)) {
          window.ym(counterId, 'hit', window.location.href)
          console.log(`Yandex Metrika: Sent hit for counter ${counterId}`)
        }
      } catch (error) {
        console.error('Error sending Yandex Metrika hit:', error)
      }
    }
  }

  const handleAccept = () => {
    Cookies.set(COOKIE_NAME, 'all', { expires: 365, path: '/', sameSite: 'Lax' })
    setShowBanner(false)
    console.log('Cookie Consent: Accepted all')
    // Отправляем первый хит в Метрику
    sendYandexHit()
    // Здесь можно инициализировать другие скрипты, требующие согласия
  }

  const handleNecessary = () => {
    Cookies.set(COOKIE_NAME, 'necessary', { expires: 365, path: '/', sameSite: 'Lax' })
    setShowBanner(false)
    console.log('Cookie Consent: Accepted necessary only')
    // НЕ отправляем хит в Метрику
    // Здесь НЕ инициализируем другие скрипты, требующие согласия
  }

  if (!showBanner) {
    return null
  }

  // Базовые стили - лучше вынести в CSS/Tailwind
  const bannerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff', // Белый фон
    color: '#333', // Темный текст
    padding: '1rem 1.5rem',
    zIndex: 1050, // Убедиться, что поверх других элементов
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    fontSize: '0.9rem',
    // Медиа-запрос для адаптивности
    // @media (min-width: 768px) { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
  }

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap',
    // @media (min-width: 768px) { flexWrap: 'nowrap' }
  }

  const buttonBaseStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#333',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s, color 0.2s',
  }

  const acceptButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#28a745', // Зеленый
    color: '#fff',
    borderColor: '#28a745',
  }

  return (
    <div style={bannerStyle}>
      <div>
        <p style={{ margin: 0 }}>
          Мы используем файлы cookie, чтобы улучшить ваш опыт взаимодействия с сайтом. Продолжая
          использовать сайт, вы соглашаетесь с нашей политикой использования файлов cookie.
          <a
            href="/privacy-policy" // Убедитесь, что эта страница существует
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginLeft: '0.5rem', textDecoration: 'underline', color: '#007bff' }}
          >
            Подробнее
          </a>
        </p>
      </div>
      <div style={buttonGroupStyle}>
        <button style={buttonBaseStyle} onClick={handleNecessary}>
          Только необходимые
        </button>
        <button style={acceptButtonStyle} onClick={handleAccept}>
          Принять все
        </button>
      </div>
    </div>
  )
}

export default CookieConsentBanner
