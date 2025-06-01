import { ServiceService } from '@/services/service.service'
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'
import OrderContactForm from '@/components/services/OrderContactForm'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '@/utilities/payload/index'

export async function generateMetadata({ params }: { params: { slug: string; lang: string } }) {
  const payload = await getPayloadClient()
  const serviceService = new ServiceService(payload)
  const service = await serviceService.getServiceBySlug({ slug: params.slug })
  if (!service) {
    return notFound()
  }
  return {
    title: `Order ${service.title}`,
    description: `Order form for ${service.title}`,
  }
}

type ServiceOrderFormPageProps = {
  params: {
    slug: string
    lang: string
  }
}

export default async function ServiceOrderFormPage({ params }: ServiceOrderFormPageProps) {
  setRequestLocale(params.lang)
  const payload = await getPayloadClient()
  const serviceService = new ServiceService(payload)
  const service = await serviceService.getServiceBySlug({ slug: params.slug })

  if (!service) {
    return notFound()
  }

  const formT = await getTranslations({ locale: params.lang, namespace: 'Form' })
  const telegramBotUrl = process.env.TELEGRAM_BOT_URL || ''

  const translations = {
    name: formT('name'),
    namePlaceholder: formT('namePlaceholder'),
    phone: formT('phone'),
    phonePlaceholder: formT('phonePlaceholder'),
    email: formT('email'),
    emailPlaceholder: formT('emailPlaceholder'),
    contactMethod: formT('contactMethod'),
    contactMethodPlaceholder: formT('contactMethodPlaceholder'),
    telegram: formT('telegram'),
    whatsapp: formT('whatsapp'),
    submit: formT('submit'),
    submitting: formT('submitting'),
    successTitle: formT('successTitle'),
    successMessage: formT('successMessage'),
    telegramButton: formT('telegramButton'),
    errorTitle: formT('errorTitle'),
    errorMessage: formT('errorMessage'),
    formNotAvailable: formT('formNotAvailable'),
    validation: {
      nameMin: formT('validation.nameMin'),
      phoneMin: formT('validation.phoneMin'),
      emailInvalid: formT('validation.emailInvalid'),
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {formT('title', { serviceName: service.title })}
      </h1>
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <OrderContactForm
          serviceId={service.id}
          serviceName={service.title}
          lang={params.lang}
          translations={translations} // Pass the whole translations object
          telegramBotUrl={telegramBotUrl}
        />
      </div>
    </div>
  )
}
