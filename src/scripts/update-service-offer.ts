#!/usr/bin/env tsx

/**
 * Script to update the service offer content in TermsPages collection
 * Run with: npx tsx src/scripts/update-service-offer.ts
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

// Russian service offer content - Complete
const russianOfferContent = createLexicalRoot([
  createHeading('ПУБЛИЧНАЯ ОФЕРТА', 'h1'),
  createParagraph('о заключении договора об оказании услуг'),

  createHeading('1. Общие положения', 'h2'),
  createParagraph(
    'В настоящей Публичной оферте содержатся условия заключения Договора об оказании услуг (далее по тексту - «Договор об оказании услуг» и/или «Договор»). Настоящей офертой признается предложение, адресованное одному или нескольким конкретным лицам, которое достаточно определенно и выражает намерение лица, сделавшего предложение, считать себя заключившим Договор с адресатом, которым будет принято предложение.',
  ),

  createParagraph(
    'Совершение указанных в настоящей Оферте действий является подтверждением согласия обеих Сторон заключить Договор об оказании услуг на условиях, в порядке и объеме, изложенных в настоящей Оферте.',
  ),

  createParagraph(
    'Нижеизложенный текст Публичной оферты является официальным публичным предложением Исполнителя, адресованный заинтересованному кругу лиц заключить Договор об оказании услуг в соответствии с положениями пункта 2 статьи 437 Гражданского кодекса РФ.',
  ),

  createParagraph(
    'Договор об оказании услуг считается заключенным и приобретает силу с момента совершения Сторонами действий, предусмотренных в настоящей Оферте, и, означающих безоговорочное, а также полное принятие всех условий настоящей Оферты без каких-либо изъятий или ограничений на условиях присоединения.',
  ),

  createHeading('Термины и определения:', 'h3'),
  createParagraph(
    'Договор – текст настоящей Оферты с Приложениями, являющимися неотъемлемой частью настоящей Оферты, акцептованный Заказчиком путем совершения конклюдентных действий, предусмотренных настоящей Офертой.',
  ),

  createParagraph(
    'Конклюдентные действия — это поведение, которое выражает согласие с предложением контрагента заключить, изменить или расторгнуть договор. Действия состоят в полном или частичном выполнении условий, которые предложил контрагент.',
  ),

  createParagraph(
    'Сайт Исполнителя в сети «Интернет» – совокупность программ для электронных вычислительных машин и иной информации, содержащейся в информационной системе, доступ к которой обеспечивается посредством сети «Интернет» по доменному имени и сетевому адресу: https://flow-masters.ru/',
  ),

  createParagraph('Стороны Договора (Стороны) – Исполнитель и Заказчик.'),

  createParagraph(
    'Услуга – услуга, оказываемая Исполнителем Заказчику в порядке и на условиях, установленных настоящей Офертой.',
  ),

  createHeading('2. Предмет Договора', 'h2'),
  createParagraph(
    '2.1. Исполнитель обязуется оказать Заказчику Услуги, а Заказчик обязуется оплатить их в размере, порядке и сроки, установленные настоящим Договором.',
  ),

  createParagraph(
    '2.2. Наименование, количество, порядок и иные условия оказания Услуг определяются на основании сведений Исполнителя при оформлении заявки Заказчиком, либо устанавливаются на сайте Исполнителя в сети «Интернет» https://flow-masters.ru/',
  ),

  createParagraph(
    '2.3. Исполнитель оказывает Услуги по настоящему Договору лично, либо с привлечением третьих лиц, при этом за действия третьих лиц Исполнитель отвечает перед Заказчиком как за свои собственные.',
  ),

  createParagraph(
    '2.4. Договор заключается путем акцепта настоящей Оферты через совершение конклюдентных действий, выраженных в:',
  ),

  createList([
    'действиях, связанных с регистрацией учетной записи на Сайте Исполнителя в сети «Интернет» при наличии необходимости регистрации учетной записи;',
    'оформлении и направлении Заказчиком заявки в адрес Исполнителя для оказания Услуг;',
    'действиях, связанных с оплатой Услуг Заказчиком;',
    'действиях, связанных с оказанием Услуг Исполнителем.',
  ]),

  createParagraph(
    'Данный перечень неисчерпывающий, могут быть и другие действия, которые ясно выражают намерение лица принять предложение контрагента.',
  ),

  createHeading('3. Права и обязанности Сторон', 'h2'),
  createHeading('3.1. Права и обязанности Исполнителя:', 'h3'),
  createParagraph(
    '3.1.1. Исполнитель обязуется оказать Услуги в соответствии с положениями настоящего Договора, в сроки и объеме, указанные в настоящем Договоре и (или) в порядке, указанном на Сайте Исполнителя.',
  ),

  createParagraph(
    '3.1.2. Исполнитель обязуется предоставлять Заказчику доступ к разделам Сайта, необходимым для получения информации, согласно пункту 2.1. Договора.',
  ),

  createParagraph(
    '3.1.3. Исполнитель несет ответственность за хранение и обработку персональных данных Заказчика, обеспечивает сохранение конфиденциальности этих данных и использует их исключительно для качественного оказания Услуг Заказчику.',
  ),

  createParagraph(
    '3.1.4. Исполнитель оставляет за собой право изменять сроки (период) оказания Услуг и условия настоящей Оферты в одностороннем порядке без предварительного уведомления Заказчика, публикуя указанные изменения на Сайте Исполнителя в сети «Интернет». При этом новые / измененные условия, указываемые на Сайте, действуют только в отношении вновь заключаемых Договоров.',
  ),

  createHeading('3.2. Права и обязанности Заказчика:', 'h3'),
  createParagraph(
    '3.2.1. Заказчик обязан предоставлять достоверную информацию о себе при получении соответствующих Услуг.',
  ),

  createParagraph(
    '3.2.2. Заказчик обязуется не воспроизводить, не повторять, не копировать, не продавать, а также не использовать в каких бы то ни было целях информацию и материалы, ставшие ему доступными в связи с оказанием Услуг, за исключением личного использования непосредственно самим Заказчиком без предоставления в какой-либо форме доступа каким-либо третьим лицам.',
  ),

  createParagraph('3.2.3. Заказчик обязуется принять Услуги, оказанные Исполнителем;'),

  createParagraph(
    '3.2.4. Заказчик вправе потребовать от Исполнителя вернуть денежные средства за неоказанные услуги, некачественно оказанные услуги, услуги, оказанные с нарушением сроков оказания, а также, если Заказчик решил отказаться от услуг по причинам, не связанным с нарушением обязательств со стороны Исполнителя, исключительно по основаниям, предусмотренным действующим законодательством Российской Федерации.',
  ),

  createParagraph(
    '3.2.5. Заказчик гарантирует, что все условия Договора ему понятны; Заказчик принимает условия без оговорок, а также в полном объеме.',
  ),

  createHeading('4. Цена и порядок расчетов', 'h2'),
  createParagraph(
    '4.1. Стоимость услуг Исполнителя, оказываемых Заказчиком и порядок их оплаты, определяются на основании сведений Исполнителя при оформлении заявки Заказчиком либо устанавливаются на Сайте Исполнителя в сети «Интернет»: https://flow-masters.ru/',
  ),

  createParagraph('4.2. Все расчеты по Договору производятся в безналичном порядке.'),

  createHeading('5. Конфиденциальность и безопасность', 'h2'),
  createParagraph(
    '5.1. При реализации настоящего Договора Стороны обеспечивают конфиденциальность и безопасность персональных данных в соответствии с актуальной редакцией ФЗ от 27.07.2006 г. № 152-ФЗ «О персональных данных» и ФЗ от 27.07.2006 г. № 149-ФЗ «Об информации, информационных технологиях и о защите информации».',
  ),

  createParagraph(
    '5.2. Стороны обязуются сохранять конфиденциальность информации, полученной в ходе исполнения настоящего Договора, и принять все возможные меры, чтобы предохранить полученную информацию от разглашения.',
  ),

  createHeading('6. Форс-мажор', 'h2'),
  createParagraph(
    '6.1. Стороны освобождаются от ответственности за неисполнение или ненадлежащее исполнение обязательств по Договору, если надлежащее исполнение оказалось невозможным вследствие непреодолимой силы, то есть чрезвычайных и непредотвратимых при данных условиях обстоятельств, под которыми понимаются: запретные действия властей, эпидемии, блокада, эмбарго, землетрясения, наводнения, пожары или другие стихийные бедствия.',
  ),

  createHeading('7. Ответственность Сторон', 'h2'),
  createParagraph(
    '7.1. В случае неисполнения и/или ненадлежащего исполнения своих обязательств по Договору, Стороны несут ответственность в соответствии с условиями настоящей Оферты.',
  ),

  createParagraph(
    '7.2. Исполнитель не несет ответственности за неисполнение и/или ненадлежащее исполнение обязательств по Договору, если такое неисполнение и/или ненадлежащее исполнение произошло по вине Заказчика.',
  ),

  createHeading('8. Срок действия настоящей Оферты', 'h2'),
  createParagraph(
    '8.1. Оферта вступает в силу с момента размещения на Сайте Исполнителя и действует до момента её отзыва Исполнителем.',
  ),

  createParagraph(
    '8.2. Исполнитель оставляет за собой право внести изменения в условия Оферты и/или отозвать Оферту в любой момент по своему усмотрению.',
  ),

  createHeading('9. Дополнительные условия', 'h2'),
  createParagraph(
    '9.1. Договор, его заключение и исполнение регулируется действующим законодательством Российской Федерации. Все вопросы, не урегулированные настоящей Офертой или урегулированные не полностью, регулируются в соответствии с материальным правом Российской Федерации.',
  ),

  createParagraph(
    '9.2. В случае возникновения спора, который может возникнуть между Сторонами в ходе исполнения ими своих обязательств по Договору, заключенному на условиях настоящей Оферты, Стороны обязаны урегулировать спор мирным путем до начала судебного разбирательства.',
  ),

  createHeading('10. Реквизиты Исполнителя', 'h2'),
  createParagraph('Полное наименование: ИП Юдин Александр Евгеньевич'),
  createParagraph('ИНН: 032628977859'),
  createParagraph('ОГРН/ОГРНИП: 325237500240543'),
  createParagraph('Контактный e-mail: admin@flow-masters.ru'),
])

// English service offer content
const englishOfferContent = createLexicalRoot([
  createHeading('PUBLIC OFFER', 'h1'),
  createParagraph('for concluding a service agreement'),

  createHeading('1. General Provisions', 'h2'),
  createParagraph(
    'This Public Offer contains the terms for concluding a Service Agreement (hereinafter referred to as the "Service Agreement" and/or "Agreement"). This offer is a proposal addressed to one or more specific persons, which is sufficiently definite and expresses the intention of the person making the proposal to consider themselves as having concluded an Agreement with the addressee who accepts the proposal.',
  ),

  createParagraph(
    'The performance of the actions specified in this Offer is confirmation of the agreement of both Parties to conclude a Service Agreement on the terms, in the manner and scope set forth in this Offer.',
  ),

  createParagraph(
    'The Agreement is considered concluded and comes into force from the moment the Parties perform the actions provided for in this Offer, which means unconditional and complete acceptance of all terms of this Offer without any exceptions or restrictions on the terms of accession.',
  ),

  createHeading('Terms and Definitions:', 'h3'),
  createParagraph(
    'Agreement – the text of this Offer with Appendices, which are an integral part of this Offer, accepted by the Customer through conclusive actions provided for by this Offer.',
  ),

  createParagraph(
    "Conclusive actions – behavior that expresses agreement with the counterparty's proposal to conclude, modify or terminate an agreement.",
  ),

  createParagraph(
    "Executor's Website on the Internet – a set of computer programs and other information contained in an information system, access to which is provided via the Internet by domain name and network address: https://flow-masters.ru/",
  ),

  createParagraph('Parties to the Agreement (Parties) – Executor and Customer.'),

  createParagraph(
    'Service – a service provided by the Executor to the Customer in the manner and on the terms established by this Offer.',
  ),

  createHeading('2. Subject of the Agreement', 'h2'),
  createParagraph(
    '2.1. The Executor undertakes to provide Services to the Customer, and the Customer undertakes to pay for them in the amount, manner and terms established by this Agreement.',
  ),

  createParagraph(
    "2.2. The name, quantity, procedure and other conditions for the provision of Services are determined based on the Executor's information when the Customer places an order, or are established on the Executor's website on the Internet https://flow-masters.ru/",
  ),

  createParagraph(
    '2.3. The Executor provides Services under this Agreement personally or with the involvement of third parties, while the Executor is responsible to the Customer for the actions of third parties as for their own.',
  ),

  createHeading('3. Rights and Obligations of the Parties', 'h2'),
  createHeading('3.1. Rights and obligations of the Executor:', 'h3'),
  createParagraph(
    "3.1.1. The Executor undertakes to provide Services in accordance with the provisions of this Agreement, within the time frame and scope specified in this Agreement and/or in the manner specified on the Executor's Website.",
  ),

  createParagraph(
    '3.1.2. The Executor undertakes to provide the Customer with access to the sections of the Website necessary to obtain information, according to clause 2.1. of the Agreement.',
  ),

  createParagraph(
    "3.1.3. The Executor is responsible for the storage and processing of the Customer's personal data, ensures the confidentiality of this data and uses it exclusively for the quality provision of Services to the Customer.",
  ),

  createHeading('3.2. Rights and obligations of the Customer:', 'h3'),
  createParagraph(
    '3.2.1. The Customer is obliged to provide reliable information about themselves when receiving the relevant Services.',
  ),

  createParagraph(
    '3.2.2. The Customer undertakes not to reproduce, repeat, copy, sell, or use for any purpose information and materials that became available to them in connection with the provision of Services, except for personal use directly by the Customer themselves without providing access in any form to any third parties.',
  ),

  createParagraph(
    '3.2.3. The Customer undertakes to accept the Services provided by the Executor.',
  ),

  createHeading('4. Price and Payment Procedure', 'h2'),
  createParagraph(
    "4.1. The cost of the Executor's services provided to the Customer and the procedure for their payment are determined based on the Executor's information when the Customer places an order or are established on the Executor's Website on the Internet: https://flow-masters.ru/",
  ),

  createParagraph('4.2. All settlements under the Agreement are made in non-cash form.'),

  createHeading('5. Confidentiality and Security', 'h2'),
  createParagraph(
    '5.1. When implementing this Agreement, the Parties ensure the confidentiality and security of personal data in accordance with the current version of Federal Law No. 152-FZ of July 27, 2006 "On Personal Data" and Federal Law No. 149-FZ of July 27, 2006 "On Information, Information Technologies and Information Protection".',
  ),

  createParagraph(
    '5.2. The Parties undertake to maintain the confidentiality of information received during the execution of this Agreement and take all possible measures to protect the received information from disclosure.',
  ),

  createHeading('6. Force Majeure', 'h2'),
  createParagraph(
    '6.1. The Parties are released from liability for non-performance or improper performance of obligations under the Agreement if proper performance became impossible due to force majeure, that is, extraordinary and unavoidable circumstances under the given conditions, which include: prohibitive actions of authorities, epidemics, blockade, embargo, earthquakes, floods, fires or other natural disasters.',
  ),

  createHeading('7. Liability of the Parties', 'h2'),
  createParagraph(
    '7.1. In case of non-performance and/or improper performance of their obligations under the Agreement, the Parties bear responsibility in accordance with the terms of this Offer.',
  ),

  createParagraph(
    '7.2. The Executor is not liable for non-performance and/or improper performance of obligations under the Agreement if such non-performance and/or improper performance occurred through the fault of the Customer.',
  ),

  createHeading('8. Term of Validity of this Offer', 'h2'),
  createParagraph(
    "8.1. The Offer comes into force from the moment of posting on the Executor's Website and is valid until it is withdrawn by the Executor.",
  ),

  createParagraph(
    '8.2. The Executor reserves the right to make changes to the terms of the Offer and/or withdraw the Offer at any time at their discretion.',
  ),

  createHeading('9. Additional Terms', 'h2'),
  createParagraph(
    '9.1. The Agreement, its conclusion and execution are governed by the current legislation of the Russian Federation. All issues not regulated by this Offer or not fully regulated are governed in accordance with the substantive law of the Russian Federation.',
  ),

  createParagraph(
    '9.2. In case of a dispute that may arise between the Parties during the performance of their obligations under the Agreement concluded on the terms of this Offer, the Parties are obliged to settle the dispute peacefully before the start of legal proceedings.',
  ),

  createHeading("10. Executor's Details", 'h2'),
  createParagraph('Full name: Individual Entrepreneur Yudin Alexander Evgenievich'),
  createParagraph('TIN: 032628977859'),
  createParagraph('OGRN/OGRNIP: 325237500240543'),
  createParagraph('Contact e-mail: admin@flow-masters.ru'),
])

// Important note content for Russian
const russianImportantNote = createLexicalRoot([
  createParagraph(
    'Настоящая публичная оферта является официальным предложением о заключении договора об оказании услуг. Принимая условия данной оферты, вы соглашаетесь с полным объемом прав и обязанностей, изложенных в документе.',
  ),
  createParagraph(
    'При возникновении вопросов обращайтесь к нашим специалистам по электронной почте admin@flow-masters.ru',
  ),
])

// Important note content for English
const englishImportantNote = createLexicalRoot([
  createParagraph(
    'This public offer is an official proposal for concluding a service agreement. By accepting the terms of this offer, you agree to the full scope of rights and obligations set forth in the document.',
  ),
  createParagraph(
    'If you have any questions, please contact our specialists at admin@flow-masters.ru',
  ),
])

async function updateServiceOffer() {
  console.log('📄 Updating service offer content in TermsPages collection...')

  try {
    const payload = await getPayload({ config })
    console.log('✅ Payload client initialized')

    // Update Russian content
    const russianResult = await payload.update({
      collection: 'terms-pages',
      locale: 'ru',
      where: {
        tabType: {
          equals: 'services',
        },
      },
      data: {
        title: 'Услуги',
        subtitle: 'Публичная оферта об оказании услуг',
        content: russianOfferContent,
        importantNote: russianImportantNote,
      },
    })

    console.log(`✅ Updated ${russianResult.docs.length} Russian terms page(s)`)

    // Update English content
    const englishResult = await payload.update({
      collection: 'terms-pages',
      locale: 'en',
      where: {
        tabType: {
          equals: 'services',
        },
      },
      data: {
        title: 'Services',
        subtitle: 'Public offer for service provision',
        content: englishOfferContent,
        importantNote: englishImportantNote,
      },
    })

    console.log(`✅ Updated ${englishResult.docs.length} English terms page(s)`)
    console.log('🎉 Service offer content updated successfully!')
  } catch (error) {
    console.error('❌ Error updating service offer:', error)
    process.exit(1)
  }
}

// Run the script if called directly
updateServiceOffer()
