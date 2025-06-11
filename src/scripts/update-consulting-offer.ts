#!/usr/bin/env tsx

/**
 * Script to update the consulting offer content in TermsPages collection
 * Run with: npx tsx src/scripts/update-consulting-offer.ts
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

// Russian consulting offer content - Part 1
const russianConsultingContent = createLexicalRoot([
  createHeading('ПУБЛИЧНАЯ ОФЕРТА', 'h1'),
  createParagraph('о заключении договора информационно-консультативных услуг'),

  createHeading('1. Общие положения', 'h2'),
  createParagraph(
    'В настоящей Публичной оферте содержатся условия заключения Договора информационно-консультативных услуг (далее по тексту - «Договор информационно-консультативных услуг» и/или «Оферта», «Договор»). Настоящей офертой признается предложение, адресованное одному или нескольким конкретным лицам, которое достаточно определенно и выражает намерение лица, сделавшего предложение, считать себя заключившим Договор с адресатом, которым будет принято предложение.',
  ),

  createParagraph(
    'Совершение указанных в настоящей Оферте действий является подтверждением согласия обеих Сторон заключить Договор информационно-консультативных услуг на условиях, в порядке и объеме, изложенных в настоящей Оферте.',
  ),

  createParagraph(
    'Нижеизложенный текст Публичной оферты является официальным публичным предложением Исполнителя, адресованный заинтересованному кругу лиц заключить Договор информационно-консультативных услуг в соответствии с положениями пункта 2 статьи 437 Гражданского кодекса РФ.',
  ),

  createParagraph(
    'Договор информационно-консультативных услуг считается заключенным и приобретает силу с момента совершения Сторонами действий, предусмотренных в настоящей Оферте, и, означающих безоговорочное, а также полное принятие всех условий настоящей Оферты без каких-либо изъятий или ограничений на условиях присоединения.',
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
    'Услуга – информационно-консультативные услуги, оказываемые Исполнителем Заказчику в порядке и на условиях, установленных настоящей Офертой.',
  ),

  createHeading('2. Предмет Договора', 'h2'),
  createParagraph(
    '2.1. Исполнитель обязуется оказать Заказчику информационно-консультационные услуги, а Заказчик обязуется оплатить их в размере, порядке и сроки, установленные настоящим Договором.',
  ),

  createParagraph(
    '2.2. Наименование, количество, порядок и иные условия оказания Услуг определяются на основании сведений Исполнителя при оформлении заявки Заказчиком, либо устанавливаются на Cайте Исполнителя в сети «Интернет».',
  ),

  createParagraph(
    '2.3. Исполнитель оказывает услуги по настоящему Договору лично, либо с привлечением третьих лиц, при этом за действия третьих лиц Исполнитель отвечает перед Заказчиком как за свои собственные.',
  ),

  createParagraph(
    '2.4. Акцепт настоящей Оферты выражается в совершении конклюдентных действий, в частности:',
  ),

  createList([
    'действиях, связанных с регистрацией учетной записи на Сайте Исполнителя в сети «Интернет» при наличии необходимости регистрации учетной записи;',
    'путем составления и заполнения заявки на оформление заказа по оказанию Услуг;',
    'путем сообщения требуемых для заключения Договора сведений по телефону, электронной почте, указанными на сайте Исполнителя в сети «Интернет», в том числе, при обратном звонке Исполнителя по заявке Заказчика;',
    'оплаты Услуг Заказчиком.',
  ]),

  createParagraph(
    'Данный перечень не является исчерпывающим, могут быть и другие действия, которые ясно выражают намерение лица принять предложение контрагента.',
  ),

  createHeading('3. Права и обязанности Сторон', 'h2'),
  createHeading('3.1. Исполнитель обязан:', 'h3'),
  createParagraph('3.1.1. Во исполнение заявки Заказчика:'),

  createList([
    'проанализировать информацию, документы и иные материалы, предоставленные Заказчиком;',
    'ответить на вопросы Заказчика, исходя из изученных документов и полученной от Заказчика информации;',
    'описать потенциальные риски и дать прогноз развития ситуации;',
    'при необходимости составить проекты документов.',
  ]),

  createParagraph(
    '3.1.2. Оказать информационно-консультативные услуги в сроки, согласно условиям настоящего Договора, и с надлежащим качеством.',
  ),

  createHeading('3.2. Заказчик обязан:', 'h3'),
  createParagraph(
    '3.2.1. Предоставить Исполнителю документацию и информацию, необходимые последнему для исполнения принятых на себя обязательств',
  ),

  createParagraph(
    '3.2.2. Оказывать всевозможное содействие Исполнителю в исполнении последним своих обязательств по настоящему Договору.',
  ),

  createParagraph(
    '3.2.3. Своевременно произвести оплату стоимости услуг Исполнителя в соответствии с условиями настоящей Оферты.',
  ),

  createHeading('3.3. Исполнитель имеет право:', 'h3'),
  createParagraph(
    '3.3.1. Получать от Заказчика документы, разъяснения и дополнительные сведения, касающиеся вопроса консультирования и необходимые для качественного оказания услуг.',
  ),

  createHeading('3.4. Заказчик имеет право:', 'h3'),
  createParagraph(
    '3.4.1. Осуществлять контроль за ходом оказания услуг, не вмешиваясь при этом в деятельность Исполнителя.',
  ),

  createParagraph(
    '3.4.2. Отказаться от исполнения настоящего Договора при условии оплаты Исполнителю фактически понесенных им расходов.',
  ),

  createParagraph(
    '3.4.3. Заказчик гарантирует, что все условия Договора ему понятны; Заказчик принимает условия без оговорок, а также в полном объеме.',
  ),

  createHeading('4. Цена и порядок расчетов', 'h2'),
  createParagraph(
    '4.1. Стоимость, а также порядок оказания информационно-консультативных услуг определяется на основании сведений Исполнителя при оформлении заявки Заказчиком, либо устанавливаются на Сайте Исполнителя в сети «Интернет». Все расчеты по Договору производятся в безналичном порядке.',
  ),

  createHeading('5. Надлежащее оказание услуг', 'h2'),
  createParagraph(
    '5.1. Возврат Исполнителем денежных средств за неоказанные (некачественно оказанные, оказанные не в полном объеме, оказанные с нарушением сроков) услуги по настоящей Оферте осуществляется по основаниям и в соответствии с требованиями Закона Российской Федерации от 07.02.1992 N 2300-1 "О защите прав потребителей", иными правовыми актами, принятыми в соответствии с ним, требованиями Гражданского кодекса Российской Федерации, иными применимыми нормативно-правовыми актами РФ.',
  ),

  createParagraph(
    '5.2. Возврат денежных средств за неоказанные (некачественно оказанные) услуги по настоящей Оферте осуществляется на основании требования (претензии) Заказчика в порядке и в сроки, установленные законодательством РФ. Соблюдение претензионного порядка является обязательным, срок ответа на претензию – 10 рабочих дней.',
  ),

  createHeading('6. Конфиденциальность и безопасность', 'h2'),
  createParagraph(
    '6.1. При реализации настоящего Договора Стороны обеспечивают конфиденциальность и безопасность персональных данных в соответствии с актуальной редакцией ФЗ от 27.07.2006 г. № 152-ФЗ «О персональных данных» и ФЗ от 27.07.2006 г. № 149-ФЗ «Об информации, информационных технологиях и о защите информации».',
  ),

  createParagraph(
    '6.2. Стороны обязуются сохранять конфиденциальность информации, полученной в ходе исполнения настоящего Договора, и принять все возможные меры, чтобы предохранить полученную информацию от разглашения.',
  ),

  createHeading('7. Форс-мажор', 'h2'),
  createParagraph(
    '7.1. Стороны освобождаются от ответственности за неисполнение или ненадлежащее исполнение обязательств по Договору, если надлежащее исполнение оказалось невозможным вследствие непреодолимой силы, то есть чрезвычайных и непредотвратимых при данных условиях обстоятельств, под которыми понимаются: запретные действия властей, эпидемии, блокада, эмбарго, землетрясения, наводнения, пожары или другие стихийные бедствия.',
  ),

  createHeading('8. Ответственность Сторон', 'h2'),
  createParagraph(
    '8.1. В случае неисполнения и/или ненадлежащего исполнения своих обязательств по Договору, Стороны несут ответственность в соответствии с условиями настоящей Оферты.',
  ),

  createParagraph(
    '8.2. Сторона, не исполнившая или ненадлежащим образом исполнившая обязательства по Договору, обязана возместить другой Стороне причиненные такими нарушениями убытки.',
  ),

  createHeading('9. Срок действия настоящей Оферты', 'h2'),
  createParagraph(
    '9.1. Оферта вступает в силу с момента ее размещения на Сайте Исполнителя и действует до момента её отзыва Исполнителем.',
  ),

  createParagraph(
    '9.2. Исполнитель оставляет за собой право внести изменения в условия Оферты и/или отозвать Оферту в любой момент по своему усмотрению.',
  ),

  createHeading('10. Дополнительные условия', 'h2'),
  createParagraph(
    '10.1. Договор, его заключение и исполнение регулируется действующим законодательством Российской Федерации. Все вопросы, не урегулированные настоящей Офертой или урегулированные не полностью, регулируются в соответствии с материальным правом Российской Федерации.',
  ),

  createParagraph(
    '10.2. В случае возникновения спора, который может возникнуть между Сторонами в ходе исполнения ими своих обязательств по Договору, заключенному на условиях настоящей Оферты, Стороны обязаны урегулировать спор мирным путем до начала судебного разбирательства.',
  ),

  createHeading('11. Реквизиты Исполнителя', 'h2'),
  createParagraph('Полное наименование: ИП Юдин Александр Евгеньевич'),
  createParagraph('ИНН: 032628977859'),
  createParagraph('ОГРН/ОГРНИП: 325237500240543'),
  createParagraph('Контактный e-mail: admin@flow-masters.ru'),
])

// English consulting offer content
const englishConsultingContent = createLexicalRoot([
  createHeading('PUBLIC OFFER', 'h1'),
  createParagraph('for concluding an information and consulting services agreement'),

  createHeading('1. General Provisions', 'h2'),
  createParagraph(
    'This Public Offer contains the terms for concluding an Information and Consulting Services Agreement (hereinafter referred to as the "Information and Consulting Services Agreement" and/or "Offer", "Agreement"). This offer is a proposal addressed to one or more specific persons, which is sufficiently definite and expresses the intention of the person making the proposal to consider themselves as having concluded an Agreement with the addressee who accepts the proposal.',
  ),

  createParagraph(
    'The performance of the actions specified in this Offer is confirmation of the agreement of both Parties to conclude an Information and Consulting Services Agreement on the terms, in the manner and scope set forth in this Offer.',
  ),

  createParagraph(
    'The Agreement is considered concluded and comes into force from the moment the Parties perform the actions provided for in this Offer, which means unconditional and complete acceptance of all terms of this Offer without any exceptions or restrictions on the terms of accession.',
  ),

  createHeading('Terms and Definitions:', 'h3'),
  createParagraph(
    'Agreement – the text of this Offer with Appendices, which are an integral part of this Offer, accepted by the Customer through conclusive actions provided for by this Offer.',
  ),

  createParagraph(
    'Service – information and consulting services provided by the Executor to the Customer in the manner and on the terms established by this Offer.',
  ),

  createHeading('2. Subject of the Agreement', 'h2'),
  createParagraph(
    '2.1. The Executor undertakes to provide information and consulting services to the Customer, and the Customer undertakes to pay for them in the amount, manner and terms established by this Agreement.',
  ),

  createParagraph(
    "2.2. The name, quantity, procedure and other conditions for the provision of Services are determined based on the Executor's information when the Customer places an order, or are established on the Executor's website on the Internet.",
  ),

  createHeading('3. Rights and Obligations of the Parties', 'h2'),
  createHeading('3.1. The Executor is obliged to:', 'h3'),
  createParagraph(
    "3.1.1. In fulfillment of the Customer's request: analyze information, documents and other materials provided by the Customer; answer the Customer's questions based on the studied documents and information received from the Customer; describe potential risks and provide a forecast of the situation development; if necessary, prepare draft documents.",
  ),

  createParagraph(
    '3.1.2. Provide information and consulting services within the timeframe according to the terms of this Agreement and with proper quality.',
  ),

  createHeading('3.2. The Customer is obliged to:', 'h3'),
  createParagraph(
    '3.2.1. Provide the Executor with documentation and information necessary for the latter to fulfill the obligations undertaken.',
  ),

  createParagraph(
    "3.2.2. Provide all possible assistance to the Executor in fulfilling the latter's obligations under this Agreement.",
  ),

  createParagraph(
    "3.2.3. Timely pay for the cost of the Executor's services in accordance with the terms of this Offer.",
  ),

  createHeading('4. Price and Payment Procedure', 'h2'),
  createParagraph(
    "4.1. The cost and procedure for providing information and consulting services are determined based on the Executor's information when the Customer places an order, or are established on the Executor's Website on the Internet. All settlements under the Agreement are made in non-cash form.",
  ),

  createHeading('5. Proper Service Provision', 'h2'),
  createParagraph(
    '5.1. The return of funds by the Executor for services not provided (poorly provided, provided not in full, provided in violation of deadlines) under this Offer is carried out on the grounds and in accordance with the requirements of the Law of the Russian Federation dated 07.02.1992 N 2300-1 "On Consumer Rights Protection".',
  ),

  createHeading('6. Confidentiality and Security', 'h2'),
  createParagraph(
    '6.1. When implementing this Agreement, the Parties ensure the confidentiality and security of personal data in accordance with the current version of Federal Law No. 152-FZ of July 27, 2006 "On Personal Data".',
  ),

  createHeading('7. Force Majeure', 'h2'),
  createParagraph(
    '7.1. The Parties are released from liability for non-performance or improper performance of obligations under the Agreement if proper performance became impossible due to force majeure circumstances.',
  ),

  createHeading('8. Liability of the Parties', 'h2'),
  createParagraph(
    '8.1. In case of non-performance and/or improper performance of their obligations under the Agreement, the Parties bear responsibility in accordance with the terms of this Offer.',
  ),

  createHeading('9. Term of Validity of this Offer', 'h2'),
  createParagraph(
    "9.1. The Offer comes into force from the moment of its posting on the Executor's Website and is valid until it is withdrawn by the Executor.",
  ),

  createHeading('10. Additional Terms', 'h2'),
  createParagraph(
    '10.1. The Agreement, its conclusion and execution are governed by the current legislation of the Russian Federation.',
  ),

  createHeading("11. Executor's Details", 'h2'),
  createParagraph('Full name: Individual Entrepreneur Yudin Alexander Evgenievich'),
  createParagraph('TIN: 032628977859'),
  createParagraph('OGRN/OGRNIP: 325237500240543'),
  createParagraph('Contact e-mail: admin@flow-masters.ru'),
])

// Important note content for Russian
const russianConsultingImportantNote = createLexicalRoot([
  createParagraph(
    'Настоящая публичная оферта регулирует предоставление информационно-консультативных услуг. Консультации носят рекомендательный характер и не являются юридически обязывающими.',
  ),
  createParagraph(
    'Для получения персональной консультации обращайтесь к нашим специалистам по электронной почте admin@flow-masters.ru',
  ),
])

// Important note content for English
const englishConsultingImportantNote = createLexicalRoot([
  createParagraph(
    'This public offer governs the provision of information and consulting services. Consultations are advisory in nature and are not legally binding.',
  ),
  createParagraph(
    'For personalized consultation, please contact our specialists at admin@flow-masters.ru',
  ),
])

async function updateConsultingOffer() {
  console.log('📄 Updating consulting offer content in TermsPages collection...')

  try {
    const payload = await getPayload({ config })
    console.log('✅ Payload client initialized')

    // Update Russian content
    const russianResult = await payload.update({
      collection: 'terms-pages',
      locale: 'ru',
      where: {
        tabType: {
          equals: 'consulting',
        },
      },
      data: {
        title: 'Консультации',
        subtitle: 'Публичная оферта информационно-консультативных услуг',
        content: russianConsultingContent,
        importantNote: russianConsultingImportantNote,
      },
    })

    console.log(`✅ Updated ${russianResult.docs.length} Russian consulting terms page(s)`)

    // Update English content
    const englishResult = await payload.update({
      collection: 'terms-pages',
      locale: 'en',
      where: {
        tabType: {
          equals: 'consulting',
        },
      },
      data: {
        title: 'Consulting',
        subtitle: 'Public offer for information and consulting services',
        content: englishConsultingContent,
        importantNote: englishConsultingImportantNote,
      },
    })

    console.log(`✅ Updated ${englishResult.docs.length} English consulting terms page(s)`)
    console.log('🎉 Consulting offer content updated successfully!')
  } catch (error) {
    console.error('❌ Error updating consulting offer:', error)
    process.exit(1)
  }
}

// Run the script if called directly
updateConsultingOffer()
