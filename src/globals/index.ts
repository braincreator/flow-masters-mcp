import { Header } from './Header/config'
import { Footer } from './Footer/config'
import { EmailSettings } from './EmailSettings'
import { PaymentProviders } from './PaymentProviders/config' // Assuming this path is correct for now
import { NotificationSettings } from './NotificationSettings/config'
import { CurrencySettings } from './CurrencySettings/config'
import { ExchangeRateSettings } from './ExchangeRateSettings/config'
import { WebhookSettings } from './WebhookSettings/config'

// Array containing all global configurations
const globalsList = [
  Header,
  Footer,
  EmailSettings,
  PaymentProviders,
  NotificationSettings,
  CurrencySettings,
  ExchangeRateSettings,
  WebhookSettings,
]

export default globalsList
