'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, InputProps } from '@/components/ui/input'
import { cn } from '@/utilities/ui'
import { useTranslations } from 'next-intl'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /**
   * If true, the password will be shown by default
   */
  showPasswordByDefault?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showPasswordByDefault = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(showPasswordByDefault)
    const t = useTranslations('common')

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
          aria-label={showPassword ? t('hidePassword') : t('showPassword')}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
