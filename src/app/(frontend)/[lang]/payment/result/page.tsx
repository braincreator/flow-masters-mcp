import PaymentResult from '@/components/PaymentResult'
import { getDictionary } from '@/dictionaries'

interface PageProps {
  params: {
    lang: string
  }
}

export default async function PaymentResultPage({ params }: PageProps) {
  const { lang } = params
  const dict = await getDictionary(lang)
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-lg mx-auto">
        <PaymentResult 
          lang={lang} 
          successText={dict.payment.success}
          errorText={dict.payment.error}
        />
      </div>
    </div>
  )
} 