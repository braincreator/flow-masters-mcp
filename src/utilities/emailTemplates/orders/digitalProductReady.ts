import type { DigitalProductReadyEmailData } from '../../../types/emailTemplates' // Assuming this type will be added
import { generateBaseEmailLayout } from '../baseLayout'

export const generateDigitalProductReadyEmail = (
  data: DigitalProductReadyEmailData,
): string => {
  const { userName, orderNumber, items, downloadLinks, locale = 'ru', siteUrl = 'https://flow-masters.ru' } = data

  const subject =
    locale === 'ru'
      ? `Ваши цифровые товары по заказу #${orderNumber} готовы`
      : `Your Digital Products for Order #${orderNumber} Are Ready`

  let itemsHtml = '<ul>'
  if (items && items.length > 0) {
    items.forEach((item: NonNullable<DigitalProductReadyEmailData['items']>[number]) => {
      itemsHtml += `<li>${item.name}</li>`
    })
  } else {
    itemsHtml += `<li>${locale === 'ru' ? 'Детали заказа доступны в вашем аккаунте.' : 'Order details are available in your account.'}</li>`
  }
  itemsHtml += '</ul>'

  let downloadLinksHtml = ''
  if (downloadLinks && downloadLinks.length > 0) {
    downloadLinksHtml = `<p>${locale === 'ru' ? 'Ссылки для скачивания:' : 'Download links:'}</p><ul>`
    downloadLinks.forEach((link: string) => {
      downloadLinksHtml += `<li><a href="${link}">${link}</a></li>`
    })
    downloadLinksHtml += '</ul>'
  } else {
    downloadLinksHtml = `<p>${locale === 'ru' ? 'Вы можете получить доступ к вашим товарам в личном кабинете.' : 'You can access your products in your account area.'}</p>`
  }

  const bodyContent = `
    <h1>${subject}</h1>
    <p>${locale === 'ru' ? `Здравствуйте, ${userName},` : `Hello ${userName},`}</p>
    <p>
      ${locale === 'ru' ? `Ваши цифровые товары по заказу <strong>#${orderNumber}</strong> готовы к скачиванию или доступу.` : `Your digital products for order <strong>#${orderNumber}</strong> are ready for download or access.`}
    </p>
    ${items && items.length > 0 ? `<p>${locale === 'ru' ? 'Приобретенные товары:' : 'Purchased items:'}</p>${itemsHtml}` : ''}
    ${downloadLinksHtml}
    <p>
      ${locale === 'ru' ? 'Вы также можете просмотреть детали вашего заказа и получить доступ к товарам в вашем личном кабинете:' : 'You can also view your order details and access your products in your account area:'}
      <a href="${siteUrl}/account/orders/${orderNumber}">${siteUrl}/account/orders/${orderNumber}</a>
    </p>
  `

  return generateBaseEmailLayout({
    locale,
    siteUrl,
    pageTitle: subject,
    bodyContent,
  })
}