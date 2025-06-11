#!/usr/bin/env tsx

/**
 * Script to update the systems offer content in TermsPages collection
 * Run with: npx tsx src/scripts/update-systems-offer.ts
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

// Russian systems offer content - Part 1
const russianSystemsContent = createLexicalRoot([
  createHeading('ПУБЛИЧНАЯ ОФЕРТА', 'h1'),
  createParagraph('о заключении договора оказания услуг в электронном виде'),

  createHeading('1. ОБЩИЕ ПОЛОЖЕНИЯ', 'h2'),
  createParagraph(
    '1.1. Настоящая Публичная оферта (далее — "Оферта") является официальным предложением Продавца (далее — "Исполнитель") любому дееспособному лицу (далее — "Клиент") заключить договор на оказание платных электронных услуг через Сайт Исполнителя.',
  ),

  createParagraph(
    '1.2. Настоящая Оферта опубликована в сети Интернет по адресу: https://flow-masters.ru и регулируется положениями статей 437 и 438 Гражданского кодекса РФ.',
  ),

  createParagraph(
    '1.3. Совершение Клиентом действий по акцепту Оферты (оплата, регистрация, заказ доступа и т.п.) означает полное и безоговорочное принятие всех условий настоящей Оферты и заключение договора на указанных в ней условиях.',
  ),

  createParagraph(
    '1.4. Исполнитель вправе в любое время изменить условия Оферты с обязательной публикацией актуальной редакции на Сайте.',
  ),

  createHeading('2. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ', 'h2'),
  createParagraph(
    '2.1. Услуги — доступ к онлайн-сервисам, платформам, API, цифровым инструментам, ИИ-агентам, чат-ботам и другим программно-аппаратным решениям, предоставляемый Исполнителем на условиях доступа, подписки или иного использования.',
  ),

  createParagraph(
    '2.2. Сайт Исполнителя — совокупность информационных и программных ресурсов, размещённых в сети Интернет по адресу: https://flow-masters.ru',
  ),

  createParagraph(
    '2.3. Клиент — физическое или юридическое лицо, принявшее условия настоящей Оферты и оформившее заказ Услуг.',
  ),

  createParagraph(
    '2.4. Акцепт — полное и безоговорочное принятие условий Оферты путём оплаты, регистрации, активации доступа или иного предусмотренного действия.',
  ),

  createParagraph('2.5. Подписка — модель оказания Услуг с периодической оплатой.'),

  createParagraph(
    '2.6. Pay-as-you-go ("оплата по факту") — модель, при которой Клиент оплачивает фактически использованные ресурсы/объём услуг.',
  ),

  createHeading('3. ПРЕДМЕТ ДОГОВОРА', 'h2'),
  createParagraph(
    '3.1. Исполнитель предоставляет Клиенту доступ к выбранным Услугам в объёме и на условиях, предусмотренных выбранным тарифом или моделью монетизации.',
  ),

  createParagraph('3.2. Услуги оказываются в дистанционном режиме с использованием сети Интернет.'),

  createParagraph(
    '3.3. Конкретные условия (объём, доступ, срок, цена) публикуются на Сайте и/или в личном кабинете Клиента, и являются неотъемлемой частью настоящей Оферты.',
  ),

  createHeading('4. ПОРЯДОК ОФОРМЛЕНИЯ, ОПЛАТЫ И ДОСТУПА', 'h2'),
  createParagraph(
    '4.1. Для получения Услуг Клиент оформляет заказ на Сайте или в личном кабинете, выбирая соответствующую модель оплаты: подписка, фиксированная плата, Pay-as-you-go и др.',
  ),

  createParagraph(
    '4.2. Оплата производится в безналичном порядке с использованием поддерживаемых платёжных систем.',
  ),

  createParagraph('4.3. Доступ к Услугам предоставляется:'),

  createList([
    'автоматически после подтверждения оплаты,',
    'или по завершении ручной активации (если указано на Сайте).',
  ]),

  createParagraph(
    '4.4. В случае подписной модели оплата осуществляется с периодичностью, выбранной Клиентом (ежемесячно, ежегодно и пр.).',
  ),

  createParagraph(
    '4.5. При Pay-as-you-go доступ активируется немедленно, а списание средств происходит согласно фактическому объёму потребления.',
  ),

  createParagraph(
    '4.6. Исполнитель вправе приостановить доступ при просрочке оплаты или превышении лимитов.',
  ),

  createHeading('5. ПРАВА И ОБЯЗАННОСТИ СТОРОН', 'h2'),
  createHeading('5.1. Исполнитель обязуется:', 'h3'),

  createList([
    'предоставить доступ к Услугам в срок, указанный на Сайте;',
    'обеспечить работоспособность и техническую поддержку Услуг (в рамках тарифа);',
    'информировать Клиента об изменениях условий оказания Услуг.',
  ]),

  createHeading('5.2. Исполнитель вправе:', 'h3'),

  createList([
    'изменять функциональность или структуру Услуг, не ухудшая их потребительские свойства;',
    'ограничивать или приостанавливать доступ при нарушении Клиентом условий настоящей Оферты;',
    'устанавливать индивидуальные условия для отдельных Клиентов.',
  ]),

  createHeading('5.3. Клиент обязуется:', 'h3'),

  createList([
    'предоставить достоверные регистрационные и платёжные данные;',
    'использовать Услуги только в рамках действующего законодательства РФ;',
    'не допускать несанкционированного доступа третьих лиц к Услугам;',
    'соблюдать условия тарифов и моделей оплаты.',
  ]),

  createHeading('6. ОТКАЗ ОТ УСЛУГ И ВОЗВРАТ', 'h2'),
  createParagraph(
    '6.1. Возврат денежных средств возможен только при невозможности оказания Услуг по вине Исполнителя либо при подтверждённой технической неисправности в течение первых 3 рабочих дней с момента начала использования.',
  ),

  createParagraph(
    '6.2. В случае автоматической подписки Клиент вправе отказаться от последующих списаний, отменив подписку в личном кабинете или через уведомление Исполнителю не позднее чем за 24 часа до следующего платёжного периода.',
  ),

  createParagraph(
    '6.3. Частичный возврат по Pay-as-you-go не производится, если Услуги были предоставлены и использованы.',
  ),

  createParagraph(
    '6.4. При одностороннем отказе от Услуг со стороны Клиента возврат не осуществляется.',
  ),

  createHeading('7. КОНФИДЕНЦИАЛЬНОСТЬ', 'h2'),
  createParagraph(
    '7.1. Исполнитель обрабатывает персональные данные Клиента в соответствии с ФЗ-152 "О персональных данных".',
  ),

  createParagraph(
    '7.2. Все данные, передаваемые Клиентом при использовании Услуг, считаются конфиденциальными и не подлежат передаче третьим лицам, за исключением случаев, предусмотренных законодательством.',
  ),

  createHeading('8. ФОРС-МАЖОР', 'h2'),
  createParagraph(
    '8.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящей Оферте, если такое неисполнение явилось следствием обстоятельств непреодолимой силы (форс-мажор).',
  ),

  createHeading('9. ОТВЕТСТВЕННОСТЬ СТОРОН', 'h2'),
  createParagraph(
    '9.1. Стороны несут ответственность в соответствии с законодательством РФ и условиями настоящей Оферты.',
  ),

  createParagraph(
    '9.2. Исполнитель не несёт ответственности за невозможность доступа к Услугам, вызванную действиями/бездействием третьих лиц или форс-мажорными обстоятельствами.',
  ),

  createHeading('10. СРОК ДЕЙСТВИЯ ОФЕРТЫ', 'h2'),
  createParagraph(
    '10.1. Оферта действует бессрочно до момента её отзыва или замены новой редакцией.',
  ),

  createParagraph('10.2. Изменения вступают в силу с момента публикации на Сайте.'),

  createParagraph(
    '10.3. Договор между Сторонами считается заключённым с момента акцепта Оферты и действует до полного исполнения обязательств.',
  ),

  createHeading('11. ДОПОЛНИТЕЛЬНЫЕ УСЛОВИЯ', 'h2'),
  createParagraph('11.1. К отношениям Сторон применяется право Российской Федерации.'),

  createParagraph(
    '11.2. Все споры и разногласия, не урегулированные путём переговоров, подлежат рассмотрению в суде по месту нахождения Исполнителя.',
  ),

  createParagraph(
    '11.3. Электронная переписка, чеки и иные цифровые документы признаются юридически значимыми.',
  ),

  createHeading('12. РЕКВИЗИТЫ ИСПОЛНИТЕЛЯ', 'h2'),
  createParagraph('Полное наименование: ИП Юдин Александр Евгеньевич'),
  createParagraph('ИНН: 032628977859'),
  createParagraph('ОГРН/ОГРНИП: 325237500240543'),
  createParagraph('Контактный e-mail: admin@flow-masters.ru'),
  createParagraph('Сайт: https://flow-masters.ru'),
])

// English systems offer content
const englishSystemsContent = createLexicalRoot([
  createHeading('PUBLIC OFFER', 'h1'),
  createParagraph('for concluding an electronic services agreement'),

  createHeading('1. GENERAL PROVISIONS', 'h2'),
  createParagraph(
    '1.1. This Public Offer (hereinafter — "Offer") is an official proposal by the Seller (hereinafter — "Executor") to any capable person (hereinafter — "Client") to conclude an agreement for paid electronic services through the Executor\'s Website.',
  ),

  createParagraph(
    '1.2. This Offer is published on the Internet at: https://flow-masters.ru and is governed by the provisions of Articles 437 and 438 of the Civil Code of the Russian Federation.',
  ),

  createParagraph(
    "1.3. The Client's actions to accept the Offer (payment, registration, access order, etc.) mean full and unconditional acceptance of all terms of this Offer and conclusion of an agreement under the conditions specified therein.",
  ),

  createHeading('2. TERMS AND DEFINITIONS', 'h2'),
  createParagraph(
    '2.1. Services — access to online services, platforms, APIs, digital tools, AI agents, chatbots and other software and hardware solutions provided by the Executor under the terms of access, subscription or other use.',
  ),

  createParagraph(
    "2.2. Executor's Website — a collection of information and software resources located on the Internet at: https://flow-masters.ru",
  ),

  createParagraph(
    '2.3. Client — an individual or legal entity that has accepted the terms of this Offer and placed an order for Services.',
  ),

  createParagraph(
    '2.4. Acceptance — full and unconditional acceptance of the terms of the Offer through payment, registration, access activation or other provided action.',
  ),

  createParagraph('2.5. Subscription — a model of providing Services with periodic payment.'),

  createParagraph(
    '2.6. Pay-as-you-go — a model in which the Client pays for actually used resources/volume of services.',
  ),

  createHeading('3. SUBJECT OF THE AGREEMENT', 'h2'),
  createParagraph(
    '3.1. The Executor provides the Client with access to selected Services in the volume and under the conditions provided by the selected tariff or monetization model.',
  ),

  createParagraph('3.2. Services are provided remotely using the Internet.'),

  createParagraph(
    "3.3. Specific conditions (volume, access, term, price) are published on the Website and/or in the Client's personal account, and are an integral part of this Offer.",
  ),

  createHeading('4. ORDER PLACEMENT, PAYMENT AND ACCESS PROCEDURE', 'h2'),
  createParagraph(
    '4.1. To receive Services, the Client places an order on the Website or in the personal account, choosing the appropriate payment model: subscription, fixed fee, Pay-as-you-go, etc.',
  ),

  createParagraph('4.2. Payment is made in non-cash form using supported payment systems.'),

  createParagraph(
    '4.3. Access to Services is provided: automatically after payment confirmation, or upon completion of manual activation (if indicated on the Website).',
  ),

  createHeading('5. RIGHTS AND OBLIGATIONS OF THE PARTIES', 'h2'),
  createHeading('5.1. The Executor undertakes to:', 'h3'),
  createParagraph(
    '• provide access to Services within the time specified on the Website; • ensure functionality and technical support of Services (within the tariff); • inform the Client about changes in the terms of providing Services.',
  ),

  createHeading('5.2. The Executor has the right to:', 'h3'),
  createParagraph(
    '• change the functionality or structure of Services without deteriorating their consumer properties; • restrict or suspend access in case of violation by the Client of the terms of this Offer; • establish individual conditions for individual Clients.',
  ),

  createHeading('5.3. The Client undertakes to:', 'h3'),
  createParagraph(
    '• provide reliable registration and payment data; • use Services only within the framework of the current legislation of the Russian Federation; • not allow unauthorized access of third parties to Services; • comply with the terms of tariffs and payment models.',
  ),

  createHeading('6. SERVICE REFUSAL AND REFUND', 'h2'),
  createParagraph(
    '6.1. Refund is possible only in case of impossibility to provide Services due to the fault of the Executor or in case of confirmed technical malfunction within the first 3 working days from the start of use.',
  ),

  createParagraph(
    '6.2. In case of automatic subscription, the Client has the right to refuse subsequent charges by canceling the subscription in the personal account or through notification to the Executor no later than 24 hours before the next payment period.',
  ),

  createHeading('7. CONFIDENTIALITY', 'h2'),
  createParagraph(
    '7.1. The Executor processes the Client\'s personal data in accordance with Federal Law-152 "On Personal Data".',
  ),

  createParagraph(
    '7.2. All data transmitted by the Client when using Services are considered confidential and are not subject to transfer to third parties, except in cases provided by law.',
  ),

  createHeading('8. FORCE MAJEURE', 'h2'),
  createParagraph(
    '8.1. The parties are released from liability for partial or complete non-performance of obligations under this Offer if such non-performance was a consequence of force majeure circumstances.',
  ),

  createHeading('9. LIABILITY OF THE PARTIES', 'h2'),
  createParagraph(
    '9.1. The parties bear responsibility in accordance with the legislation of the Russian Federation and the terms of this Offer.',
  ),

  createHeading('10. TERM OF VALIDITY OF THE OFFER', 'h2'),
  createParagraph(
    '10.1. The Offer is valid indefinitely until it is withdrawn or replaced by a new version.',
  ),

  createHeading('11. ADDITIONAL CONDITIONS', 'h2'),
  createParagraph(
    '11.1. The law of the Russian Federation applies to the relations of the Parties.',
  ),

  createHeading("12. EXECUTOR'S DETAILS", 'h2'),
  createParagraph('Full name: Individual Entrepreneur Yudin Alexander Evgenievich'),
  createParagraph('TIN: 032628977859'),
  createParagraph('OGRN/OGRNIP: 325237500240543'),
  createParagraph('Contact e-mail: admin@flow-masters.ru'),
  createParagraph('Website: https://flow-masters.ru'),
])

// Important note content for Russian
const russianSystemsImportantNote = createLexicalRoot([
  createParagraph(
    'Настоящая публичная оферта регулирует предоставление доступа к электронным сервисам и системам. Доступ предоставляется на основе выбранной модели оплаты: подписка, фиксированная плата или Pay-as-you-go.',
  ),
  createParagraph(
    'По вопросам использования сервисов обращайтесь к нашим специалистам по электронной почте admin@flow-masters.ru',
  ),
])

// Important note content for English
const englishSystemsImportantNote = createLexicalRoot([
  createParagraph(
    'This public offer governs the provision of access to electronic services and systems. Access is provided based on the selected payment model: subscription, fixed fee or Pay-as-you-go.',
  ),
  createParagraph(
    'For questions regarding the use of services, please contact our specialists at admin@flow-masters.ru',
  ),
])

async function updateSystemsOffer() {
  console.log('📄 Updating systems offer content in TermsPages collection...')

  try {
    const payload = await getPayload({ config })
    console.log('✅ Payload client initialized')

    // Update Russian content
    const russianResult = await payload.update({
      collection: 'terms-pages',
      locale: 'ru',
      where: {
        tabType: {
          equals: 'systems',
        },
      },
      data: {
        title: 'Сервисы',
        subtitle: 'Публичная оферта оказания услуг в электронном виде',
        content: russianSystemsContent,
        importantNote: russianSystemsImportantNote,
      },
    })

    console.log(`✅ Updated ${russianResult.docs.length} Russian systems terms page(s)`)

    // Update English content
    const englishResult = await payload.update({
      collection: 'terms-pages',
      locale: 'en',
      where: {
        tabType: {
          equals: 'systems',
        },
      },
      data: {
        title: 'Systems',
        subtitle: 'Public offer for electronic services provision',
        content: englishSystemsContent,
        importantNote: englishSystemsImportantNote,
      },
    })

    console.log(`✅ Updated ${englishResult.docs.length} English systems terms page(s)`)
    console.log('🎉 Systems offer content updated successfully!')
  } catch (error) {
    console.error('❌ Error updating systems offer:', error)
    process.exit(1)
  }
}

// Run the script if called directly
updateSystemsOffer()
