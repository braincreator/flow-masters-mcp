'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { useTranslations } from '@/hooks/useTranslations'
import { formatPrice, getLocalePrice } from '@/utilities/formatPrice'
import { Locale } from '@/constants'
import { Button } from '@/components/ui/button'
import { X, CreditCard, Wallet, ArrowRight, ShoppingBag } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utilities/ui'

interface CheckoutClientProps {
  locale: Locale
}

export default function CheckoutClient({ locale }: CheckoutClientProps) {
  const { items, removeFromCart } = useCart()
  const t = useTranslations(locale)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasItems = items.length > 0

  // Вычисляем итоговую сумму заказа
  const total = items.reduce((sum, item) => {
    // Используем функцию getLocalePrice для получения локализованной цены
    const price = getLocalePrice(item.product, locale)
    // Умножаем цену на количество товара
    return sum + price * item.quantity
  }, 0)

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId)
  }

  // Функция валидации email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Обработчик изменения email с валидацией
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)

    // Проверяем email на валидность при каждом изменении
    if (value.length > 0) {
      if (!isValidEmail(value)) {
        setEmailError(
          locale === 'ru'
            ? 'Пожалуйста, укажите корректный email (например, name@example.com)'
            : 'Please enter a valid email address (e.g., name@example.com)',
        )
      } else {
        setEmailError(null)
      }
    } else {
      setEmailError(null) // Если поле пустое, убираем ошибку
    }
  }

  // Проверка валидности email для активации кнопки
  const isEmailValid = email.length > 0 && isValidEmail(email)

  const handleCheckout = async () => {
    // Сбрасываем ошибки перед проверкой
    setError(null)
    setEmailError(null)

    // Проверка наличия email
    if (!email) {
      setEmailError(locale === 'ru' ? 'Пожалуйста, укажите email' : 'Please enter your email')
      return
    }

    // Проверка формата email
    if (!isValidEmail(email)) {
      setEmailError(
        locale === 'ru'
          ? 'Пожалуйста, укажите корректный email (например, name@example.com)'
          : 'Please enter a valid email address (e.g., name@example.com)',
      )
      return
    }

    try {
      setIsLoading(true)

      // Здесь будет API-запрос для создания заказа и перехода к оплате
      console.log('Checkout initiated:', {
        items: items.map((item) => item.product.id),
        email,
        paymentMethod,
        total,
      })

      // Заглушка - имитация задержки API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Редирект на страницу оплаты (в реальном проекте будет URL от платежной системы)
      window.location.href = `/${locale}/payment-success?order=123456`
    } catch (err) {
      console.error('Checkout error:', err)
      setError(locale === 'ru' ? 'Ошибка при оформлении заказа' : 'Checkout error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getProductTitle = (product: any) => {
    if (typeof product.title === 'object') {
      return product.title[locale] || product.title.en || 'Product'
    }
    return product.title || 'Product'
  }

  if (!hasItems) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 flex justify-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-2">
          {locale === 'ru' ? 'Ваша корзина пуста' : 'Your cart is empty'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {locale === 'ru'
            ? 'Добавьте товары в корзину, чтобы продолжить'
            : 'Add some items to your cart to continue'}
        </p>
        <Button asChild>
          <a href={`/${locale}/products`}>
            {locale === 'ru' ? 'Перейти к товарам' : 'Browse products'}
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Корзина и данные покупателя */}
      <div className="lg:col-span-7 space-y-6">
        {/* Список товаров */}
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'ru' ? 'Ваши товары' : 'Your items'}</CardTitle>
            <CardDescription>
              {locale === 'ru'
                ? `${items.length} ${items.length === 1 ? 'товар' : 'товаров'} в корзине`
                : `${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 py-3">
                  {/* Изображение товара */}
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.product.thumbnail ? (
                      <Image
                        src={
                          typeof item.product.thumbnail === 'string'
                            ? item.product.thumbnail
                            : item.product.thumbnail.url || ''
                        }
                        alt={getProductTitle(item.product)}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Информация о товаре */}
                  <div className="flex-grow">
                    <h3 className="font-medium mb-1">{getProductTitle(item.product)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'ru' ? 'Цифровой товар' : 'Digital product'}
                    </p>
                    <div className="text-sm mt-1">
                      <span className="text-muted-foreground">
                        {formatPrice(getLocalePrice(item.product, locale), locale)} ×{' '}
                        {item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Цена и кнопка удаления */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-medium">
                      {formatPrice(getLocalePrice(item.product, locale) * item.quantity, locale)}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      <span>{locale === 'ru' ? 'Удалить' : 'Remove'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'ru' ? 'Контактная информация' : 'Contact information'}
            </CardTitle>
            <CardDescription>
              {locale === 'ru'
                ? 'Укажите email для получения товара и чека'
                : 'Enter your email to receive the product and receipt'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={cn(
                    'transition-colors duration-200',
                    email.length > 0 && !isEmailValid
                      ? 'border-2 border-destructive focus:border-destructive focus:ring-destructive/40 focus-visible:outline-none'
                      : email.length > 0 && isEmailValid
                        ? 'border-2 border-green-500 focus:border-green-500 focus:ring-accent/40 focus-visible:outline-none'
                        : 'hover:border-accent/50 focus:border-2 focus:border-accent/50 focus:ring-accent/30 focus-visible:outline-none',
                  )}
                  required
                />
                {emailError && <p className="text-sm text-destructive mt-1">{emailError}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Способ оплаты */}
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'ru' ? 'Способ оплаты' : 'Payment method'}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 border rounded-md p-3 mb-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                  <CreditCard className="h-4 w-4" />
                  <span>{locale === 'ru' ? 'Банковская карта' : 'Credit/Debit Card'}</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer">
                  <Wallet className="h-4 w-4" />
                  <span>{locale === 'ru' ? 'Электронный кошелек' : 'Digital Wallet'}</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Итоги заказа */}
      <div className="lg:col-span-5">
        <div className="sticky top-6">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'ru' ? 'Итоги заказа' : 'Order summary'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {locale === 'ru' ? 'Итого товаров' : 'Items total'}
                  </span>
                  <span>{formatPrice(total, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {locale === 'ru' ? 'Доставка' : 'Shipping'}
                  </span>
                  <span>{locale === 'ru' ? 'Бесплатно' : 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {locale === 'ru' ? 'Налоги' : 'Taxes'}
                  </span>
                  <span>{locale === 'ru' ? 'Включены' : 'Included'}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-medium text-lg">
                <span>{locale === 'ru' ? 'Итого к оплате' : 'Total'}</span>
                <span>{formatPrice(total, locale)}</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isLoading || !isEmailValid}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    {locale === 'ru' ? 'Обработка...' : 'Processing...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {locale === 'ru' ? 'Перейти к оплате' : 'Proceed to payment'}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <p className="text-xs text-muted-foreground text-center">
                {locale === 'ru'
                  ? 'Оплачивая заказ, вы соглашаетесь с условиями обслуживания и политикой конфиденциальности'
                  : 'By completing your purchase, you agree to our terms of service and privacy policy'}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
