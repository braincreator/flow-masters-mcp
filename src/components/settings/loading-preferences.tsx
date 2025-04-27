'use client'

import { useLoadingConfig } from '@/providers/LoadingConfigProvider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useLoading } from '@/providers/LoadingProvider'
import { useTranslations } from 'next-intl'

export function LoadingPreferences() {
  const { loadingStyle, setLoadingStyle } = useLoadingConfig()
  const { startLoading, stopLoading } = useLoading()
  const t = useTranslations('Settings.appearance')

  const handlePreview = () => {
    startLoading()
    setTimeout(() => {
      stopLoading()
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t('loadingAnimations')}</h3>
        <p className="text-sm text-muted-foreground">{t('loadingAnimationsDescription')}</p>
      </div>

      <RadioGroup
        value={loadingStyle}
        onValueChange={(value) => setLoadingStyle(value as any)}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cosmic" id="cosmic" />
          <Label htmlFor="cosmic">{t('loadingStyles.cosmic')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="minimal" id="minimal" />
          <Label htmlFor="minimal">{t('loadingStyles.minimal')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="both" id="both" />
          <Label htmlFor="both">{t('loadingStyles.both')}</Label>
        </div>
      </RadioGroup>

      <Button onClick={handlePreview} variant="outline">
        {t('previewButton')}
      </Button>
    </div>
  )
}
