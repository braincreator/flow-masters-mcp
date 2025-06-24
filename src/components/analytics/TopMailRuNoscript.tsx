/**
 * Top.Mail.Ru Noscript Fallback Component
 * Provides fallback tracking for users with JavaScript disabled
 */

import { TopMailRuService } from '@/lib/analytics/top-mail-ru'

interface TopMailRuNoscriptProps {
  counterId: string
}

export function TopMailRuNoscript({ counterId }: TopMailRuNoscriptProps) {
  const noscriptHtml = TopMailRuService.getNoscriptFallback(counterId)
  
  return (
    <noscript>
      <div dangerouslySetInnerHTML={{ __html: noscriptHtml }} />
    </noscript>
  )
}
