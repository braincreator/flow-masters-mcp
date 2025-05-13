import React from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Media } from '@/payload-types' // Import Media type
import { GridContainer as Container } from '@/components/GridContainer'
import { getPayloadClient } from '@/utilities/payload/index'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { Image } from '@/components/Image' // Use custom Image component
import Link from 'next/link'
import { RichText } from '@/components/RichText'
import { ArrowLeft, CheckCircle2, Clock, MapPin, Tag, Calendar, ArrowRight } from 'lucide-react' // Добавлены иконки
import { formatPrice, convertPrice, getLocaleCurrency } from '@/utilities/formatPrice'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge' // Добавляем Badge для визуальных акцентов
import AnimateInView from '@/components/AnimateInView' // Импортируем компонент для анимаций
import RelatedServiceCard from '@/components/services/RelatedServiceCard' // Исправленный путь импорта

type ServicePageParams = {
  lang: string
  slug: string
}

export async function generateMetadata({
  params,
}: {
  params: ServicePageParams
}): Promise<Metadata> {
  const { lang, slug } = await params

  try {
    const payload = await getPayloadClient()

    const service = await payload.find({
      collection: 'services',
      where: {
        slug: {
          equals: slug,
        },
      },
      locale: lang as 'en' | 'ru', // Приводим к правильному типу
    })

    if (!service || service.docs.length === 0) {
      return {}
    }

    const serviceData = service.docs[0]
    if (!serviceData) return {} // Add explicit check

    const title = serviceData.title // title is a direct string

    const metaTitle = serviceData.meta?.title || title
    const metaDescription = serviceData.meta?.description || (serviceData.shortDescription ?? '')

    let metaImage: string | undefined = undefined
    if (serviceData.meta?.image) {
      if (typeof serviceData.meta.image === 'string') {
        metaImage = serviceData.meta.image
      } else if (
        serviceData.meta.image &&
        typeof serviceData.meta.image === 'object' &&
        'url' in serviceData.meta.image
      ) {
        metaImage = serviceData.meta.image.url ?? undefined
      }
    }
    if (!metaImage && serviceData.thumbnail) {
      if (typeof serviceData.thumbnail === 'string') {
        metaImage = serviceData.thumbnail
      } else if (
        serviceData.thumbnail &&
        typeof serviceData.thumbnail === 'object' &&
        'url' in serviceData.thumbnail
      ) {
        metaImage = serviceData.thumbnail.url ?? undefined
      }
    }

    return {
      title: metaTitle,
      description: metaDescription,
      openGraph: metaImage
        ? {
            images: [metaImage],
          }
        : undefined,
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {}
  }
}

export default async function ServicePage({ params }: { params: ServicePageParams }) {
  const { lang, slug } = await params
  setRequestLocale(lang)

  const t = await getTranslations({ locale: lang, namespace: 'Services' })
  const commonT = await getTranslations({ locale: lang, namespace: 'common' })

  try {
    const payload = await getPayloadClient()

    // Получаем услугу по slug
    const service = await payload.find({
      collection: 'services',
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: 'published',
        },
      },
      locale: lang as 'en' | 'ru', // Приводим к правильному типу
      depth: 2,
    })

    if (!service || service.docs.length === 0) {
      notFound()
    }

    const serviceData = service.docs[0]
    if (!serviceData) {
      // Add explicit check
      notFound()
    }

    // Получаем локализованные данные
    const title = serviceData.title // title is a direct string

    const description = serviceData.description

    let thumbnailUrl: string | undefined = undefined
    if (serviceData.thumbnail) {
      if (typeof serviceData.thumbnail === 'string') {
        thumbnailUrl = serviceData.thumbnail
      } else if (
        serviceData.thumbnail &&
        typeof serviceData.thumbnail === 'object' &&
        'url' in serviceData.thumbnail
      ) {
        thumbnailUrl = serviceData.thumbnail.url ?? undefined
      }
    }

    // Получаем похожие услуги
    const relatedServices = await payload.find({
      collection: 'services',
      where: {
        slug: {
          not_equals: slug,
        },
        status: {
          equals: 'published',
        },
      },
      locale: lang as 'en' | 'ru', // Приводим к правильному типу
      limit: 3,
    })

    const LocalizedPrice = async () => {
      await getLocaleCurrency(lang)
      const sourceLocaleForPrice = 'en'
      const priceInTargetCurrency = convertPrice(serviceData.price, sourceLocaleForPrice, lang)
      return formatPrice(priceInTargetCurrency, lang)
    }

    return (
      <Container>
        <div className="py-12 md:py-16 lg:py-20">
          {/* Хлебные крошки */}
          <AnimateInView direction="right" className="mb-6">
            <nav className="flex items-center text-sm mb-8">
              <Link
                href={`/${lang}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {commonT('home')}
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <Link
                href={`/${lang}/services`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {commonT('services')}
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
            </nav>
          </AnimateInView>

          {/* Геройская секция с заголовком поверх изображения */}
          <AnimateInView direction="up" className="mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {thumbnailUrl && (
                <div className="relative aspect-[21/9] w-full">
                  <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill={true}
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                  {/* Градиентный оверлей для читаемости текста */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>

                  {/* Контент поверх изображения */}
                  <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12">
                    <div className="max-w-2xl">
                      <Badge className="mb-4 px-3 py-1 text-sm bg-primary/90 border-none">
                        {t(`serviceTypes.${serviceData.serviceType}`)}
                      </Badge>
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white animate-fade-in">
                        {title}
                      </h1>
                      {serviceData.shortDescription && (
                        <p className="text-white/90 text-lg md:text-xl max-w-xl animate-slide-up">
                          {serviceData.shortDescription}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-6">
                        <Button
                          size="lg"
                          className="bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                          asChild
                        >
                          <Link href={`/${lang}/services/${slug}/book`}>
                            {serviceData.requiresBooking ? t('book') : t('order')}
                          </Link>
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white"
                          asChild
                        >
                          <Link href={`/${lang}/contact`}>{t('haveQuestions')}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimateInView>

          {/* Декоративные элементы */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

          {/* Кнопка "Вернуться к списку услуг" */}
          <AnimateInView direction="right" className="mb-8">
            <Button
              variant="outline"
              className="flex items-center border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary"
              asChild
            >
              <Link href={`/${lang}/services`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToServices')}
              </Link>
            </Button>
          </AnimateInView>

          {/* Информационные карточки в двух колонках */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 mb-12">
            {/* Левая колонка: Детали услуги */}
            <AnimateInView direction="up" className="lg:col-span-1">
              <div className="bg-card text-card-foreground rounded-xl shadow-lg p-6 border border-border/10 h-full">
                <h2 className="text-xl font-semibold mb-4">{t('serviceDetails')}</h2>
                <div className="space-y-0">
                  <div className="flex justify-between items-center py-3 border-t border-border/20 first:border-t-0">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">{t('price')}</span>
                    </div>
                    <span className="font-bold text-lg text-primary">
                      <LocalizedPrice />
                    </span>
                  </div>
                  {serviceData.duration && (
                    <div className="flex justify-between items-center py-3 border-t border-border/20">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm">{t('duration')}</span>
                      </div>
                      <span className="font-medium">
                        {serviceData.duration} {t('minutes')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-t border-border/20">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">{t('type')}</span>
                    </div>
                    <span className="font-medium capitalize">
                      {t(`serviceTypes.${serviceData.serviceType}`)}
                    </span>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/20">
                    <p className="text-sm text-muted-foreground mb-3 text-center">
                      {serviceData.requiresPayment ? t('paymentRequired') : t('noPaymentRequired')}
                    </p>

                    <Button
                      asChild
                      className="w-full group border-2 bg-primary/10 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors"
                    >
                      <Link href={`/${lang}/contact`}>
                        <span className="flex items-center justify-center">
                          {t('haveQuestions')}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </AnimateInView>

            {/* Правая колонка: Описание */}
            <AnimateInView direction="up" delay={150} className="lg:col-span-2">
              {description && (
                <div className="h-full">
                  <div className="flex items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-semibold">{t('description')}</h2>
                    <div className="ml-4 h-1 flex-grow bg-gradient-to-r from-primary/30 to-transparent rounded-full"></div>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <RichText data={description} />
                  </div>
                </div>
              )}
            </AnimateInView>
          </div>

          {/* Фичи */}
          {serviceData.features && serviceData.features.length > 0 && (
            <AnimateInView direction="up" className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold mb-2">{t('features')}</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/30 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceData.features.map((feature: any, index: number) => (
                  <AnimateInView key={index} direction="up" delay={index * 100}>
                    <div className="bg-card p-6 rounded-xl shadow-md border border-border/10 hover:shadow-lg hover:border-primary/20 transition-all h-full">
                      <div className="flex items-start">
                        <div className="shrink-0 mr-4 bg-primary/10 p-3 rounded-full">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{feature.name}</h3>
                          {feature.description && (
                            <p className="text-muted-foreground">{feature.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimateInView>
                ))}
              </div>
            </AnimateInView>
          )}

          {/* Похожие услуги */}
          {relatedServices && relatedServices.docs.length > 0 && (
            <AnimateInView direction="up" className="mt-16 pt-8 border-t border-border/10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold">{t('relatedServices')}</h2>
                <Button variant="ghost" asChild>
                  <Link
                    href={`/${lang}/services`}
                    className="text-muted-foreground hover:text-foreground flex items-center group"
                  >
                    {t('allServices')}{' '}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedServices.docs.map((service: any, index: number) => (
                  <AnimateInView key={service.id} direction="up" delay={index * 100}>
                    {/* Используем новый компонент для связанных услуг */}
                    <RelatedServiceCard
                      service={service}
                      locale={lang}
                      translations={{
                        details: t('details'),
                      }}
                    />
                  </AnimateInView>
                ))}
              </div>
            </AnimateInView>
          )}
        </div>
      </Container>
    )
  } catch (error) {
    console.error('Error fetching service data:', error)
    notFound()
  }
}
