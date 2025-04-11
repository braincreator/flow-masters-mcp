import { BackButton } from '../../components/BackButton'
import { usePathname } from 'next/navigation'
import CookieConsentBanner from '@/components/CookieConsentBanner/CookieConsentBanner'

export default function LangLayout({ children, params: { lang } }) {
  const pathname = usePathname()
  const isHomePage = pathname === `/${lang}`

  return (
    <div>
      <Header />
      <main>
        {!isHomePage && (
          <div className="container mx-auto px-4 py-4">
            <BackButton />
          </div>
        )}
        {children}
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  )
}
