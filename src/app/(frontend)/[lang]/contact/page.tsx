import React from 'react'
import { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm' // Компонент формы
import { CreatorInfo } from '@/components/contact/CreatorInfo' // Компонент инфо о создателе
import { SocialLinks } from '@/components/contact/SocialLinks' // Компонент для ссылок
import { Mail, Phone, MapPin } from 'lucide-react' // Иконки
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' // Добавляем Card для обертки

export const metadata: Metadata = {
  title: 'Контакты | Ваш Проект',
  description: 'Свяжитесь со мной для обсуждения проектов или вопросов.',
  // Добавьте другие метаданные, если нужно (keywords, openGraph и т.д.)
}

export default function ContactPage() {
  // Данные можно получать из CMS или задать статически
  // TODO: Рассмотреть возможность выноса этих данных в Payload Global или отдельную коллекцию
  const creatorData = {
    name: 'Имя Фамилия', // Замените на реальное имя
    bio: 'Веб-разработчик, специализирующийся на React, Next.js и Payload CMS. Увлечен созданием интуитивно понятных и производительных веб-приложений. Открыт для новых проектов и сотрудничества.',
    imageUrl: 'https://via.placeholder.com/150', // Замените на реальный URL или путь к аватару
    socials: {
      github: 'https://github.com/your_username', // Замените
      linkedin: 'https://linkedin.com/in/your_profile', // Замените
      telegram: 'https://t.me/your_username', // Замените
    },
    email: 'your.email@example.com', // Замените
    phone: '+7 (999) 123-45-67', // Замените или удалите, если не хотите указывать
    location: 'Город, Страна', // Опционально: для отображения местоположения
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16 lg:py-20">
      {/* Заголовок страницы */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Свяжитесь со мной
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Готов обсудить ваш проект, ответить на вопросы или просто пообщаться. Заполните форму ниже
          или используйте другие удобные для вас способы связи.
        </p>
      </div>

      {/* Основной контент: сетка */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
        {/* Левая колонка: Информация о создателе и контакты */}
        <aside className="lg:col-span-1 space-y-8">
          <CreatorInfo
            name={creatorData.name}
            bio={creatorData.bio}
            imageUrl={creatorData.imageUrl}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {creatorData.email && (
                <a href={`mailto:${creatorData.email}`} className="flex items-center gap-3 group">
                  <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm hover:underline">{creatorData.email}</span>
                </a>
              )}
              {creatorData.phone && (
                <a
                  href={`tel:${creatorData.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-3 group"
                >
                  <Phone className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm hover:underline">{creatorData.phone}</span>
                </a>
              )}
              {creatorData.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{creatorData.location}</span>
                </div>
              )}

              <Separator className="my-4" />

              <div>
                <h4 className="text-md font-medium mb-3">Найти меня онлайн:</h4>
                <SocialLinks links={creatorData.socials} />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Правая колонка: Контактная форма */}
        <section className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Отправить сообщение</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Опционально: Карта */}
      {/*
       <div className="mt-16">
         <h2 className="text-2xl font-bold text-center mb-8">Наше местоположение</h2>
         <div className="aspect-video bg-muted rounded-lg">
            Карта (например, Google Maps iframe)
         </div>
       </div>
       */}
    </div>
  )
}
