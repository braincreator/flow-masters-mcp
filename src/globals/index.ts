import { AboutPage } from './AboutPage'
import { Header } from './Header/config'
import { Footer } from './Footer/config'
import { EmailSettings } from './EmailSettings'
import { PaymentProviders } from './PaymentProviders/config'
import { NotificationSettings } from './NotificationSettings/config'
import { WebhookSettings } from './WebhookSettings/config'
import { AnalyticsSettings } from './AnalyticsSettings'

// Array containing all global configurations
const globalsList = [
  AboutPage,
  Header,
  Footer,
  EmailSettings,
  PaymentProviders,
  NotificationSettings,
  WebhookSettings,
  AnalyticsSettings,
]

export default globalsList
