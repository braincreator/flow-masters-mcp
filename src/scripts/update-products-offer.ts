#!/usr/bin/env tsx

/**
 * Script to update the products offer content in TermsPages collection
 * Run with: npx tsx src/scripts/update-products-offer.ts
 */

import { getPayload } from 'payload'
import config from '../../payload.config'

// Helper function to create Lexical paragraph
function createParagraph(text: string) {
  return {
    type: 'paragraph',
    version: 1,
    children: [
      {
        type: 'text',
        version: 1,
        text,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
  }
}

// Helper function to create Lexical heading
function createHeading(text: string, tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h2') {
  return {
    type: 'heading',
    version: 1,
    tag,
    children: [
      {
        type: 'text',
        version: 1,
        text,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
  }
}

// Helper function to create Lexical list
function createList(items: string[], ordered = false) {
  return {
    type: 'list',
    version: 1,
    listType: ordered ? 'number' : 'bullet',
    start: 1,
    tag: ordered ? 'ol' : 'ul',
    children: items.map((item) => ({
      type: 'listitem',
      version: 1,
      value: 1,
      children: [
        {
          type: 'text',
          version: 1,
          text: item,
        },
      ],
      direction: null,
      format: '',
      indent: 0,
    })),
    direction: null,
    format: '',
    indent: 0,
  }
}

// Helper function to create Lexical root
function createLexicalRoot(children: any[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: null,
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// Russian products offer content - Part 1
const russianProductsContent = createLexicalRoot([
  createHeading('ПУБЛИЧНАЯ ОФЕРТА', 'h1'),
  createParagraph('о заключении договора купли-продажи электронного товара'),

  createHeading('1. ОБЩИЕ ПОЛОЖЕНИЯ', 'h2'),
  createParagraph(
    '1.1. Настоящая Публичная оферта (далее — "Оферта") является официальным предложением Продавца любому дееспособному лицу (далее — "Покупатель") заключить договор купли-продажи электронного товара на условиях, изложенных ниже.',
  ),

  createParagraph(
    '1.2. Настоящая Оферта опубликована в сети Интернет по адресу: https://flow-masters.ru и действует в соответствии со статьей 437 Гражданского кодекса РФ.',
  ),

  createParagraph(
    '1.3. Совершение Покупателем действий по оформлению и оплате заказа считается акцептом Оферты и подтверждает заключение договора купли-продажи электронного товара (далее — "Договор") на условиях, изложенных в настоящем документе.',
  ),

  createParagraph(
    '1.4. Продавец оставляет за собой право вносить изменения в настоящую Оферту без предварительного уведомления, с обязательной публикацией актуальной версии на сайте.',
  ),

  createHeading('2. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ', 'h2'),
  createParagraph(
    '2.1. Электронный товар (далее — "Товар") — цифровой контент, включая, но не ограничиваясь: видеокурсы, текстовые материалы, доступ к онлайн-сервисам, программные продукты, электронные книги, шаблоны, графику и иные нематериальные объекты, предназначенные для использования на электронных устройствах и передаваемые через интернет.',
  ),

  createParagraph(
    '2.2. Сайт Продавца — совокупность страниц в сети Интернет, размещённых по адресу: https://flow-masters.ru',
  ),

  createParagraph('2.3. Продавец — лицо, размещающее настоящую Оферту и предоставляющее Товар.'),

  createParagraph(
    '2.4. Покупатель — физическое или юридическое лицо, оформившее заказ и оплатившее Товар.',
  ),

  createParagraph('2.5. Акцепт — полное и безоговорочное принятие условий настоящей Оферты.'),

  createHeading('3. ПРЕДМЕТ ДОГОВОРА', 'h2'),
  createParagraph(
    '3.1. Продавец обязуется предоставить Покупателю доступ к Товару в электронном виде, а Покупатель обязуется оплатить Товар в порядке, предусмотренном настоящей Офертой.',
  ),

  createParagraph(
    '3.2. Условия предоставления доступа, цена, функциональность и ограничения Товара указываются на соответствующей странице описания Товара на Сайте Продавца.',
  ),

  createHeading('4. ПОРЯДОК ОФОРМЛЕНИЯ И ОПЛАТЫ ЗАКАЗА', 'h2'),
  createParagraph(
    '4.1. Заказ Товара осуществляется Покупателем самостоятельно на Сайте Продавца путём выбора Товара, заполнения формы заказа и оплаты через платёжный интерфейс.',
  ),

  createParagraph(
    '4.2. Оплата осуществляется в безналичном порядке с использованием платёжных систем, поддерживаемых Сайтом Продавца.',
  ),

  createParagraph(
    '4.3. Факт оплаты фиксируется системой и считается подтверждением заключения Договора.',
  ),

  createParagraph(
    '4.4. После подтверждения оплаты Покупателю предоставляется доступ к Товару посредством:',
  ),

  createList([
    'автоматической переадресации на страницу скачивания;',
    'отправки ссылки на электронную почту;',
    'открытия доступа в личный кабинет.',
  ]),

  createHeading('5. ПРАВА И ОБЯЗАННОСТИ СТОРОН', 'h2'),
  createHeading('5.1. Продавец обязуется:', 'h3'),

  createList([
    'предоставить доступ к Товару в разумный срок (не более 24 часов);',
    'обеспечить техническую поддержку при затруднении доступа к Товару;',
    'не разглашать персональные данные Покупателя.',
  ]),

  createHeading('5.2. Покупатель обязуется:', 'h3'),

  createList([
    'предоставить достоверную информацию при оформлении заказа;',
    'не распространять Товар третьим лицам без письменного согласия Продавца;',
    'использовать Товар только в личных целях (если не предусмотрено иное).',
  ]),

  createHeading('6. ВОЗВРАТ ТОВАРА', 'h2'),
  createParagraph(
    '6.1. Электронные товары, полученные в полном объёме и надлежащего качества, возврату и обмену не подлежат (п. 4 ст. 26.1 Закона РФ "О защите прав потребителей").',
  ),

  createParagraph(
    '6.2. Возврат денежных средств возможен, если Товар не был предоставлен Покупателю по техническим причинам, по вине Продавца, либо существенно не соответствует описанию.',
  ),

  createParagraph(
    '6.3. Для возврата необходимо направить письменное заявление на адрес электронной почты Продавца, приложив доказательства несоответствия.',
  ),

  createHeading('7. КОНФИДЕНЦИАЛЬНОСТЬ', 'h2'),
  createParagraph(
    '7.1. Продавец обязуется соблюдать положения ФЗ-152 "О персональных данных" и не передавать сведения о Покупателе третьим лицам без его согласия.',
  ),

  createHeading('8. ФОРС-МАЖОР', 'h2'),
  createParagraph(
    '8.1. Стороны освобождаются от ответственности за неисполнение обязательств в случае наступления обстоятельств непреодолимой силы: стихийных бедствий, аварий, военных действий, запретов и ограничений со стороны государственных органов.',
  ),

  createHeading('9. ОТВЕТСТВЕННОСТЬ СТОРОН', 'h2'),
  createParagraph(
    '9.1. Покупатель несёт ответственность за правомерность использования Товара, включая соблюдение авторских и лицензионных прав.',
  ),

  createParagraph(
    '9.2. Продавец не несёт ответственности за невозможность использования Товара по причинам, не зависящим от него (технические сбои на стороне Покупателя, блокировки, сбои Интернета и т.п.).',
  ),

  createHeading('10. СРОК ДЕЙСТВИЯ ОФЕРТЫ', 'h2'),
  createParagraph(
    '10.1. Настоящая Оферта вступает в силу с момента размещения на Сайте Продавца и действует до момента её отзыва Продавцом.',
  ),

  createParagraph(
    '10.2. Оферта может быть изменена в любое время. Новая редакция вступает в силу с момента публикации на Сайте Продавца.',
  ),

  createHeading('11. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ', 'h2'),
  createParagraph(
    '11.1. Ко всем отношениям между Продавцом и Покупателем применяется действующее законодательство Российской Федерации.',
  ),

  createParagraph(
    '11.2. Все споры подлежат разрешению в досудебном порядке. При недостижении соглашения — в суде по месту нахождения Продавца.',
  ),

  createParagraph(
    '11.3. Электронные документы (чек, подтверждение оплаты, акцепт Оферты) являются юридически значимыми и могут использоваться как доказательства при разрешении споров.',
  ),

  createHeading('12. РЕКВИЗИТЫ ПРОДАВЦА', 'h2'),
  createParagraph('Полное наименование: ИП Юдин Александр Евгеньевич'),
  createParagraph('ИНН: 032628977859'),
  createParagraph('ОГРН/ОГРНИП: 325237500240543'),
  createParagraph('Контактный e-mail: admin@flow-masters.ru'),
  createParagraph('Сайт: https://flow-masters.ru'),
])

// English products offer content
const englishProductsContent = createLexicalRoot([
  createHeading('PUBLIC OFFER', 'h1'),
  createParagraph('for concluding an electronic goods purchase agreement'),

  createHeading('1. GENERAL PROVISIONS', 'h2'),
  createParagraph(
    '1.1. This Public Offer (hereinafter — "Offer") is an official proposal by the Seller to any capable person (hereinafter — "Buyer") to conclude an electronic goods purchase agreement under the conditions set forth below.',
  ),

  createParagraph(
    '1.2. This Offer is published on the Internet at: https://flow-masters.ru and is valid in accordance with Article 437 of the Civil Code of the Russian Federation.',
  ),

  createParagraph(
    '1.3. The Buyer\'s actions to place and pay for an order are considered acceptance of the Offer and confirm the conclusion of an electronic goods purchase agreement (hereinafter — "Agreement") under the conditions set forth in this document.',
  ),

  createHeading('2. TERMS AND DEFINITIONS', 'h2'),
  createParagraph(
    '2.1. Electronic goods (hereinafter — "Goods") — digital content, including but not limited to: video courses, text materials, access to online services, software products, electronic books, templates, graphics and other intangible objects intended for use on electronic devices and transmitted via the internet.',
  ),

  createParagraph(
    "2.2. Seller's Website — a collection of pages on the Internet located at: https://flow-masters.ru",
  ),

  createParagraph('2.3. Seller — the person posting this Offer and providing the Goods.'),

  createParagraph(
    '2.4. Buyer — an individual or legal entity that has placed an order and paid for the Goods.',
  ),

  createHeading('3. SUBJECT OF THE AGREEMENT', 'h2'),
  createParagraph(
    '3.1. The Seller undertakes to provide the Buyer with access to the Goods in electronic form, and the Buyer undertakes to pay for the Goods in the manner provided by this Offer.',
  ),

  createParagraph(
    "3.2. The conditions for providing access, price, functionality and limitations of the Goods are indicated on the corresponding product description page on the Seller's Website.",
  ),

  createHeading('4. ORDER PLACEMENT AND PAYMENT PROCEDURE', 'h2'),
  createParagraph(
    "4.1. The Goods are ordered by the Buyer independently on the Seller's Website by selecting the Goods, filling out the order form and paying through the payment interface.",
  ),

  createParagraph(
    "4.2. Payment is made in non-cash form using payment systems supported by the Seller's Website.",
  ),

  createParagraph(
    '4.3. The fact of payment is recorded by the system and is considered confirmation of the conclusion of the Agreement.',
  ),

  createHeading('5. RIGHTS AND OBLIGATIONS OF THE PARTIES', 'h2'),
  createHeading('5.1. The Seller undertakes to:', 'h3'),
  createParagraph(
    "• provide access to the Goods within a reasonable time (no more than 24 hours); • provide technical support in case of difficulty accessing the Goods; • not disclose the Buyer's personal data.",
  ),

  createHeading('5.2. The Buyer undertakes to:', 'h3'),
  createParagraph(
    '• provide reliable information when placing an order; • not distribute the Goods to third parties without the written consent of the Seller; • use the Goods only for personal purposes (unless otherwise provided).',
  ),

  createHeading('6. PRODUCT RETURN', 'h2'),
  createParagraph(
    '6.1. Electronic goods received in full and of proper quality are not subject to return or exchange (clause 4 of Article 26.1 of the Law of the Russian Federation "On Consumer Rights Protection").',
  ),

  createParagraph(
    '6.2. Refund is possible if the Goods were not provided to the Buyer for technical reasons, through the fault of the Seller, or significantly do not correspond to the description.',
  ),

  createHeading('7. CONFIDENTIALITY', 'h2'),
  createParagraph(
    '7.1. The Seller undertakes to comply with the provisions of Federal Law-152 "On Personal Data" and not to transfer information about the Buyer to third parties without their consent.',
  ),

  createHeading('8. FORCE MAJEURE', 'h2'),
  createParagraph(
    '8.1. The parties are released from liability for non-performance of obligations in case of force majeure circumstances: natural disasters, accidents, military actions, prohibitions and restrictions by government authorities.',
  ),

  createHeading('9. LIABILITY OF THE PARTIES', 'h2'),
  createParagraph(
    '9.1. The Buyer is responsible for the lawful use of the Goods, including compliance with copyright and licensing rights.',
  ),

  createHeading('10. TERM OF VALIDITY OF THE OFFER', 'h2'),
  createParagraph(
    "10.1. This Offer comes into force from the moment of posting on the Seller's Website and is valid until it is withdrawn by the Seller.",
  ),

  createHeading('11. FINAL PROVISIONS', 'h2'),
  createParagraph(
    '11.1. The current legislation of the Russian Federation applies to all relations between the Seller and the Buyer.',
  ),

  createHeading("12. SELLER'S DETAILS", 'h2'),
  createParagraph('Full name: Individual Entrepreneur Yudin Alexander Evgenievich'),
  createParagraph('TIN: 032628977859'),
  createParagraph('OGRN/OGRNIP: 325237500240543'),
  createParagraph('Contact e-mail: admin@flow-masters.ru'),
  createParagraph('Website: https://flow-masters.ru'),
])

// Important note content for Russian
const russianProductsImportantNote = createLexicalRoot([
  createParagraph(
    'Настоящая публичная оферта регулирует покупку электронных товаров и цифрового контента. Электронные товары не подлежат возврату согласно законодательству РФ.',
  ),
  createParagraph(
    'По вопросам приобретения продуктов обращайтесь к нашим специалистам по электронной почте admin@flow-masters.ru',
  ),
])

// Important note content for English
const englishProductsImportantNote = createLexicalRoot([
  createParagraph(
    'This public offer governs the purchase of electronic goods and digital content. Electronic goods are not subject to return according to Russian Federation legislation.',
  ),
  createParagraph(
    'For questions regarding product purchases, please contact our specialists at admin@flow-masters.ru',
  ),
])

async function updateProductsOffer() {
  console.log('📄 Updating products offer content in TermsPages collection...')

  try {
    const payload = await getPayload({ config })
    console.log('✅ Payload client initialized')

    // Update Russian content
    const russianResult = await payload.update({
      collection: 'terms-pages',
      locale: 'ru',
      where: {
        tabType: {
          equals: 'products',
        },
      },
      data: {
        title: 'Продукты',
        subtitle: 'Публичная оферта купли-продажи электронного товара',
        content: russianProductsContent,
        importantNote: russianProductsImportantNote,
      },
    })

    console.log(`✅ Updated ${russianResult.docs.length} Russian products terms page(s)`)

    // Update English content
    const englishResult = await payload.update({
      collection: 'terms-pages',
      locale: 'en',
      where: {
        tabType: {
          equals: 'products',
        },
      },
      data: {
        title: 'Products',
        subtitle: 'Public offer for electronic goods purchase',
        content: englishProductsContent,
        importantNote: englishProductsImportantNote,
      },
    })

    console.log(`✅ Updated ${englishResult.docs.length} English products terms page(s)`)
    console.log('🎉 Products offer content updated successfully!')
  } catch (error) {
    console.error('❌ Error updating products offer:', error)
    process.exit(1)
  }
}

// Run the script if called directly
updateProductsOffer()
