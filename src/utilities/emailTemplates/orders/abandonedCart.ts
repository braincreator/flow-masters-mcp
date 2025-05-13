import type { AbandonedCartEmailData } from '../../../types/emailTemplates' // Assuming this type will be added
import { generateBaseEmailLayout } from '../baseLayout'

export const generateAbandonedCartEmail = (
  data: AbandonedCartEmailData,
): string => {
  const { userName, items, total, currency, lastUpdated, cartUrl, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? 'Вы что-то забыли в корзине!'
      : 'Did You Forget Something in Your Cart?'

  let itemsHtml = '<ul>'
  if (items && items.length > 0) {
    items.forEach((item: NonNullable<AbandonedCartEmailData['items']>[number]) => {
      itemsHtml += `<li>${item.title} (x${item.quantity}) - ${currency}${item.price}</li>`
    })
  } else {
    itemsHtml += `<li>${locale === 'ru' ? 'Ваша корзина пуста.' : 'Your cart is empty.'}</li>`
  }
  itemsHtml += '</ul>'

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Мы заметили, что вы оставили товары в вашей корзине. Не упустите их!` : `We noticed you left some items in your shopping cart. Don't miss out!`}
    </p>
    <p>${locale === 'ru' ? 'Товары в корзине:' : 'Items in your cart:'}</p>
    ${itemsHtml}
    <p>
      ${locale === 'ru' ? `Общая сумма: ${total} ${currency}` : `Total: ${currency}${total}`}
    </p>
    <p>
      ${locale === 'ru' ? `Корзина обновлена:` : `Cart last updated:`} ${new Date(lastUpdated).toLocaleDateString(locale)}
    </p>
    <p>
      <a href="${cartUrl}" class="button">${locale === 'ru' ? 'Завершить покупку' : 'Complete Your Purchase'}</a>
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}