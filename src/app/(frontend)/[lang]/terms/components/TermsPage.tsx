'use client'

import React from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Users, Cog, ShoppingCart } from 'lucide-react'
import { cn } from '@/utilities/ui'

// Content data separated from translations to avoid HTML parsing issues
const getTabContent = (locale: string) => {
  const isRussian = locale === 'ru'

  return {
    services: isRussian ? `
      <h2>1. ОБЩИЕ ПОЛОЖЕНИЯ</h2>
      <p>1.1. Настоящая публичная оферта (далее - «Оферта») является официальным предложением ООО «Флоу Мастерс» (далее - «Исполнитель») заключить договор оказания услуг по разработке и внедрению искусственного интеллекта.</p>
      <p>1.2. Акцептом настоящей оферты является оплата услуг Заказчиком любым из предложенных способов.</p>
      <h2>2. ПРЕДМЕТ ДОГОВОРА</h2>
      <p>2.1. Исполнитель обязуется оказать услуги по разработке, настройке и внедрению ИИ-решений согласно техническому заданию.</p>
      <p>2.2. Перечень услуг включает:</p>
      <ul>
        <li>Разработка чат-ботов и виртуальных ассистентов</li>
        <li>Создание систем автоматизации бизнес-процессов</li>
        <li>Интеграция ИИ в существующие системы</li>
        <li>Обучение и поддержка персонала</li>
      </ul>
      <h2>3. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ</h2>
      <p>3.1. Стоимость услуг определяется согласно прайс-листу на сайте или индивидуальному коммерческому предложению.</p>
      <p>3.2. Оплата производится в рублях РФ по безналичному расчету или банковской картой.</p>
      <p>3.3. Предоплата составляет 50% от общей стоимости проекта.</p>
      <h2>4. СРОКИ ВЫПОЛНЕНИЯ</h2>
      <p>4.1. Сроки выполнения работ определяются техническим заданием и составляют от 5 до 30 рабочих дней.</p>
      <p>4.2. Сроки могут быть изменены по согласованию сторон.</p>
      <h2>5. ОТВЕТСТВЕННОСТЬ СТОРОН</h2>
      <p>5.1. За нарушение сроков выполнения работ Исполнитель выплачивает неустойку в размере 0,1% от стоимости за каждый день просрочки.</p>
      <p>5.2. Исполнитель не несет ответственности за убытки, возникшие вследствие неправильного использования ИИ-решений Заказчиком.</p>
    ` : `
      <h2>1. GENERAL PROVISIONS</h2>
      <p>1.1. This public offer (hereinafter - "Offer") is an official proposal by Flow Masters LLC (hereinafter - "Contractor") to conclude a service agreement for the development and implementation of artificial intelligence.</p>
      <p>1.2. Acceptance of this offer is payment for services by the Customer using any of the proposed methods.</p>
      <h2>2. SUBJECT OF THE CONTRACT</h2>
      <p>2.1. The Contractor undertakes to provide services for the development, configuration and implementation of AI solutions according to the technical specification.</p>
      <p>2.2. The list of services includes:</p>
      <ul>
        <li>Development of chatbots and virtual assistants</li>
        <li>Creation of business process automation systems</li>
        <li>AI integration into existing systems</li>
        <li>Staff training and support</li>
      </ul>
      <h2>3. COST AND PAYMENT PROCEDURE</h2>
      <p>3.1. The cost of services is determined according to the price list on the website or individual commercial proposal.</p>
      <p>3.2. Payment is made in Russian rubles by bank transfer or bank card.</p>
      <p>3.3. Prepayment is 50% of the total project cost.</p>
      <h2>4. EXECUTION TERMS</h2>
      <p>4.1. Work completion terms are determined by the technical specification and range from 5 to 30 working days.</p>
      <p>4.2. Terms may be changed by agreement of the parties.</p>
      <h2>5. RESPONSIBILITY OF THE PARTIES</h2>
      <p>5.1. For violation of work completion terms, the Contractor pays a penalty of 0.1% of the cost for each day of delay.</p>
      <p>5.2. The Contractor is not liable for losses arising from improper use of AI solutions by the Customer.</p>
    `,
    consulting: isRussian ? `
      <h2>1. ВИДЫ КОНСУЛЬТАЦИОННЫХ УСЛУГ</h2>
      <p>1.1. Исполнитель предоставляет следующие виды консультаций:</p>
      <ul>
        <li>Стратегическое планирование внедрения ИИ</li>
        <li>Техническая экспертиза существующих решений</li>
        <li>Обучение команды работе с ИИ-инструментами</li>
        <li>Аудит ИИ-процессов и систем</li>
      </ul>
      <h2>2. ФОРМАТ КОНСУЛЬТАЦИЙ</h2>
      <p>2.1. Консультации проводятся в следующих форматах:</p>
      <ul>
        <li>Онлайн-встречи (Zoom, Google Meet, Teams)</li>
        <li>Очные встречи в офисе клиента или исполнителя</li>
        <li>Письменные заключения и рекомендации</li>
        <li>Телефонные консультации</li>
      </ul>
      <h2>3. СТОИМОСТЬ КОНСУЛЬТАЦИЙ</h2>
      <p>3.1. Стоимость консультаций:</p>
      <ul>
        <li>Разовая консультация (1 час) - 5 000 руб.</li>
        <li>Пакет из 5 консультаций - 20 000 руб.</li>
        <li>Месячное сопровождение - 50 000 руб.</li>
        <li>Индивидуальные тарифы для крупных проектов</li>
      </ul>
      <p>3.2. Оплата производится до начала консультации или по факту для постоянных клиентов.</p>
      <h2>4. ПОРЯДОК ПРОВЕДЕНИЯ</h2>
      <p>4.1. Запись на консультацию осуществляется через сайт или по телефону.</p>
      <p>4.2. За 24 часа до консультации клиент получает ссылку для подключения или адрес встречи.</p>
      <p>4.3. Отмена или перенос консультации возможны не позднее чем за 4 часа до начала.</p>
      <h2>5. КОНФИДЕНЦИАЛЬНОСТЬ</h2>
      <p>5.1. Исполнитель гарантирует конфиденциальность всей информации, полученной в ходе консультаций.</p>
      <p>5.2. По требованию клиента заключается дополнительное соглашение о неразглашении.</p>
    ` : `
      <h2>1. TYPES OF CONSULTING SERVICES</h2>
      <p>1.1. The Contractor provides the following types of consultations:</p>
      <ul>
        <li>Strategic planning for AI implementation</li>
        <li>Technical expertise of existing solutions</li>
        <li>Team training on AI tools</li>
        <li>AI process and system audits</li>
      </ul>
      <h2>2. CONSULTATION FORMATS</h2>
      <p>2.1. Consultations are conducted in the following formats:</p>
      <ul>
        <li>Online meetings (Zoom, Google Meet, Teams)</li>
        <li>In-person meetings at client or contractor office</li>
        <li>Written conclusions and recommendations</li>
        <li>Phone consultations</li>
      </ul>
      <h2>3. CONSULTATION COSTS</h2>
      <p>3.1. Consultation costs:</p>
      <ul>
        <li>One-time consultation (1 hour) - $65</li>
        <li>Package of 5 consultations - $260</li>
        <li>Monthly support - $650</li>
        <li>Individual rates for large projects</li>
      </ul>
      <p>3.2. Payment is made before the consultation or upon completion for regular clients.</p>
      <h2>4. PROCEDURE</h2>
      <p>4.1. Consultation booking is done through the website or by phone.</p>
      <p>4.2. 24 hours before the consultation, the client receives a connection link or meeting address.</p>
      <p>4.3. Cancellation or rescheduling is possible no later than 4 hours before the start.</p>
      <h2>5. CONFIDENTIALITY</h2>
      <p>5.1. The Contractor guarantees confidentiality of all information received during consultations.</p>
      <p>5.2. At the client's request, an additional non-disclosure agreement is concluded.</p>
    `,
    systems: isRussian ? `
      <h2>1. ОПИСАНИЕ СЕРВИСОВ</h2>
      <p>1.1. Исполнитель предоставляет доступ к следующим сервисам:</p>
      <ul>
        <li>ИИ-платформа для автоматизации бизнес-процессов</li>
        <li>Конструктор чат-ботов</li>
        <li>Система аналитики и отчетности</li>
        <li>API для интеграции с внешними системами</li>
      </ul>
      <h2>2. УСЛОВИЯ ДОСТУПА</h2>
      <p>2.1. Доступ к сервисам предоставляется после регистрации и подтверждения email.</p>
      <p>2.2. Для полного функционала требуется активная подписка.</p>
      <p>2.3. Бесплатный тариф включает ограниченный функционал на 14 дней.</p>
      <h2>3. ТАРИФНЫЕ ПЛАНЫ</h2>
      <p>3.1. Базовый тариф - 2 990 руб./месяц:</p>
      <ul>
        <li>До 1000 запросов в месяц</li>
        <li>Базовая аналитика</li>
        <li>Email поддержка</li>
      </ul>
      <p>3.2. Профессиональный тариф - 9 990 руб./месяц:</p>
      <ul>
        <li>До 10 000 запросов в месяц</li>
        <li>Расширенная аналитика</li>
        <li>Приоритетная поддержка</li>
        <li>API доступ</li>
      </ul>
      <p>3.3. Корпоративный тариф - от 29 990 руб./месяц:</p>
      <ul>
        <li>Неограниченные запросы</li>
        <li>Персональный менеджер</li>
        <li>SLA 99.9%</li>
        <li>Кастомизация под потребности</li>
      </ul>
      <h2>4. ОГРАНИЧЕНИЯ ИСПОЛЬЗОВАНИЯ</h2>
      <p>4.1. Запрещается использование сервисов для:</p>
      <ul>
        <li>Нарушения авторских прав</li>
        <li>Создания вредоносного контента</li>
        <li>Спама и массовых рассылок</li>
        <li>Нарушения законодательства РФ</li>
      </ul>
      <h2>5. ТЕХНИЧЕСКАЯ ПОДДЕРЖКА</h2>
      <p>5.1. Поддержка предоставляется в рабочие дни с 9:00 до 18:00 МСК.</p>
      <p>5.2. Время ответа зависит от тарифного плана:</p>
      <ul>
        <li>Базовый - до 24 часов</li>
        <li>Профессиональный - до 4 часов</li>
        <li>Корпоративный - до 1 часа</li>
      </ul>
    ` : `
      <h2>1. SERVICE DESCRIPTION</h2>
      <p>1.1. The Contractor provides access to the following services:</p>
      <ul>
        <li>AI platform for business process automation</li>
        <li>Chatbot constructor</li>
        <li>Analytics and reporting system</li>
        <li>API for integration with external systems</li>
      </ul>
      <h2>2. ACCESS CONDITIONS</h2>
      <p>2.1. Access to services is provided after registration and email confirmation.</p>
      <p>2.2. Full functionality requires an active subscription.</p>
      <p>2.3. Free tier includes limited functionality for 14 days.</p>
      <h2>3. PRICING PLANS</h2>
      <p>3.1. Basic plan - $39/month:</p>
      <ul>
        <li>Up to 1,000 requests per month</li>
        <li>Basic analytics</li>
        <li>Email support</li>
      </ul>
      <p>3.2. Professional plan - $129/month:</p>
      <ul>
        <li>Up to 10,000 requests per month</li>
        <li>Advanced analytics</li>
        <li>Priority support</li>
        <li>API access</li>
      </ul>
      <p>3.3. Enterprise plan - from $389/month:</p>
      <ul>
        <li>Unlimited requests</li>
        <li>Personal manager</li>
        <li>99.9% SLA</li>
        <li>Custom solutions</li>
      </ul>
      <h2>4. USAGE RESTRICTIONS</h2>
      <p>4.1. It is prohibited to use services for:</p>
      <ul>
        <li>Copyright infringement</li>
        <li>Creating malicious content</li>
        <li>Spam and mass mailings</li>
        <li>Violating Russian Federation laws</li>
      </ul>
      <h2>5. TECHNICAL SUPPORT</h2>
      <p>5.1. Support is provided on working days from 9:00 to 18:00 MSK.</p>
      <p>5.2. Response time depends on the pricing plan:</p>
      <ul>
        <li>Basic - up to 24 hours</li>
        <li>Professional - up to 4 hours</li>
        <li>Enterprise - up to 1 hour</li>
      </ul>
    `,
    products: isRussian ? `
      <h2>1. ВИДЫ ЭЛЕКТРОННЫХ ТОВАРОВ</h2>
      <p>1.1. В каталоге представлены следующие виды цифровых продуктов:</p>
      <ul>
        <li>Готовые ИИ-боты и автоматизации</li>
        <li>Шаблоны и конфигурации систем</li>
        <li>Обучающие курсы и материалы</li>
        <li>Программное обеспечение и плагины</li>
        <li>Базы данных и датасеты</li>
      </ul>
      <h2>2. УСЛОВИЯ ПОКУПКИ</h2>
      <p>2.1. Покупка осуществляется через корзину на сайте с мгновенной доставкой.</p>
      <p>2.2. После оплаты товар становится доступен в личном кабинете.</p>
      <p>2.3. Все цифровые товары предоставляются с лицензией на использование.</p>
      <h2>3. ЛИЦЕНЗИОННЫЕ УСЛОВИЯ</h2>
      <p>3.1. Стандартная лицензия включает:</p>
      <ul>
        <li>Право использования в коммерческих целях</li>
        <li>Техническая поддержка в течение 6 месяцев</li>
        <li>Бесплатные обновления в течение года</li>
        <li>Использование на неограниченном количестве проектов</li>
      </ul>
      <p>3.2. Расширенная лицензия дополнительно включает:</p>
      <ul>
        <li>Право перепродажи (white-label)</li>
        <li>Исходный код и возможность модификации</li>
        <li>Приоритетная техническая поддержка</li>
        <li>Персональные консультации по внедрению</li>
      </ul>
      <h2>4. ВОЗВРАТ И ОБМЕН</h2>
      <p>4.1. Возврат цифровых товаров возможен в течение 14 дней при условии:</p>
      <ul>
        <li>Товар не был скачан или использован</li>
        <li>Отсутствуют технические нарушения со стороны покупателя</li>
        <li>Предоставлено обоснование причины возврата</li>
      </ul>
      <p>4.2. Обмен товара на аналогичный возможен в течение 30 дней.</p>
      <h2>5. ТЕХНИЧЕСКАЯ ПОДДЕРЖКА</h2>
      <p>5.1. Поддержка цифровых товаров включает:</p>
      <ul>
        <li>Помощь в установке и настройке</li>
        <li>Консультации по использованию</li>
        <li>Устранение технических проблем</li>
        <li>Предоставление обновлений</li>
      </ul>
      <p>5.2. Время ответа службы поддержки:</p>
      <ul>
        <li>Стандартная лицензия - до 48 часов</li>
        <li>Расширенная лицензия - до 12 часов</li>
        <li>Критические проблемы - до 4 часов</li>
      </ul>
      <h2>6. ОГРАНИЧЕНИЯ ИСПОЛЬЗОВАНИЯ</h2>
      <p>6.1. Запрещается:</p>
      <ul>
        <li>Передача товара третьим лицам без лицензии</li>
        <li>Обратная разработка и декомпиляция</li>
        <li>Использование в незаконных целях</li>
        <li>Нарушение авторских прав</li>
      </ul>
    ` : `
      <h2>1. TYPES OF DIGITAL PRODUCTS</h2>
      <p>1.1. Our catalog includes the following types of digital products:</p>
      <ul>
        <li>Ready-made AI bots and automations</li>
        <li>System templates and configurations</li>
        <li>Training courses and materials</li>
        <li>Software and plugins</li>
        <li>Databases and datasets</li>
      </ul>
      <h2>2. PURCHASE CONDITIONS</h2>
      <p>2.1. Purchase is made through the website cart with instant delivery.</p>
      <p>2.2. After payment, the product becomes available in your personal account.</p>
      <p>2.3. All digital products are provided with a usage license.</p>
      <h2>3. LICENSE TERMS</h2>
      <p>3.1. Standard license includes:</p>
      <ul>
        <li>Right to use for commercial purposes</li>
        <li>Technical support for 6 months</li>
        <li>Free updates for one year</li>
        <li>Use on unlimited number of projects</li>
      </ul>
      <p>3.2. Extended license additionally includes:</p>
      <ul>
        <li>Right to resell (white-label)</li>
        <li>Source code and modification rights</li>
        <li>Priority technical support</li>
        <li>Personal implementation consultations</li>
      </ul>
      <h2>4. RETURNS AND EXCHANGES</h2>
      <p>4.1. Digital product returns are possible within 14 days provided:</p>
      <ul>
        <li>Product was not downloaded or used</li>
        <li>No technical violations by the buyer</li>
        <li>Justified reason for return provided</li>
      </ul>
      <p>4.2. Product exchange for similar item possible within 30 days.</p>
      <h2>5. TECHNICAL SUPPORT</h2>
      <p>5.1. Digital product support includes:</p>
      <ul>
        <li>Installation and setup assistance</li>
        <li>Usage consultations</li>
        <li>Technical problem resolution</li>
        <li>Update provision</li>
      </ul>
      <p>5.2. Support response time:</p>
      <ul>
        <li>Standard license - up to 48 hours</li>
        <li>Extended license - up to 12 hours</li>
        <li>Critical issues - up to 4 hours</li>
      </ul>
      <h2>6. USAGE RESTRICTIONS</h2>
      <p>6.1. Prohibited:</p>
      <ul>
        <li>Transfer to third parties without license</li>
        <li>Reverse engineering and decompilation</li>
        <li>Use for illegal purposes</li>
        <li>Copyright infringement</li>
      </ul>
    `
  }
}

export function TermsPage() {
  const t = useTranslations('Terms')
  const locale = useLocale()
  const content = getTabContent(locale)

  const tabs = [
    {
      id: 'services',
      label: t('tabs.services.label'),
      icon: FileText,
      content: content.services,
      badge: t('tabs.services.badge'),
    },
    {
      id: 'consulting',
      label: t('tabs.consulting.label'),
      icon: Users,
      content: content.consulting,
      badge: t('tabs.consulting.badge'),
    },
    {
      id: 'systems',
      label: t('tabs.systems.label'),
      icon: Cog,
      content: content.systems,
      badge: t('tabs.systems.badge'),
    },
    {
      id: 'products',
      label: t('tabs.products.label'),
      icon: ShoppingCart,
      content: content.products,
      badge: t('tabs.products.badge'),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            {t('header.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            {t('header.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('header.description')}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-card/50 backdrop-blur-sm border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-2 p-3 md:p-4 h-auto data-[state=active]:bg-background data-[state=active]:shadow-md"
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-medium text-xs md:text-sm">{tab.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {tab.badge}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <tab.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">
                    {t(`tabs.${tab.id}.title`)}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground">
                    {t(`tabs.${tab.id}.subtitle`)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Terms Content */}
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div 
                      className="space-y-6 text-foreground/90 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: tab.content }}
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="bg-muted/50 rounded-xl p-6 border-l-4 border-primary">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {t('common.importantNote')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t(`tabs.${tab.id}.note`)}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                    <h3 className="font-semibold text-lg mb-3">
                      {t('common.contactInfo')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">{t('common.email')}</p>
                        <p className="text-muted-foreground">admin@flow-masters.ru</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">{t('common.lastUpdated')}</p>
                        <p className="text-muted-foreground">{t('common.updateDate')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            {t('footer.text')}
          </p>
        </div>
      </div>
    </div>
  )
}
