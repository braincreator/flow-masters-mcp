'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Clock } from 'lucide-react'

interface ContactSupportProps {
  locale: string
}

export function ContactSupport({ locale }: ContactSupportProps) {
  const t = useTranslations('Help.contactSupport')

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@flow-masters.ru'
  }

  const handleLiveChat = () => {
    // In a real app, this would open a live chat widget
    alert('Live chat functionality would be implemented here')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                onClick={handleEmailSupport}
                className="flex items-center gap-2 flex-1 justify-center"
              >
                <Mail className="h-5 w-5" />
                {t('emailButton')}
              </Button>
              <Button
                onClick={handleLiveChat}
                variant="outline"
                className="flex items-center gap-2 flex-1 justify-center"
              >
                <MessageSquare className="h-5 w-5" />
                {t('chatButton')}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span>{t('supportHours')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
