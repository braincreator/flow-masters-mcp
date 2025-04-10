import type { Block } from 'payload'

// Импорт конфигураций блоков
import { Content } from './Content/config'
import { CallToAction } from './CallToAction/config'
import { Hero } from './Hero/config'
import { MediaBlock } from './MediaBlock/config'
import { Code } from './Code/config'
import { Banner } from './Banner/config'
import { FormBlock } from './Form/config'
import { Video } from './Video/config'
import { Audio } from './Audio/config'
import { FAQ } from './FAQ/config'
import { AccordionBlock } from './Accordion/Config'
import { Newsletter } from './Newsletter/config'
import { Carousel } from './Carousel/config'
import { Gallery } from './Gallery/config'
import { ProductsFilter } from './ProductsFilter/config'
import { ProductsList } from './ProductsList/config'
import { Features } from './Features/config'
import { Container } from './Container/config'
import { Divider } from './Divider/config'
import { Steps } from './Steps/config'
import { PricingTable } from './PricingTable/config'
import { ArticleHeader } from './ArticleHeader/config'
import { AuthorBio } from './AuthorBio/config'
import { Blockquote } from './Blockquote/config'
import { Comments } from './Comments/config'
import { RelatedPosts } from './RelatedPosts/config'
import { SocialShare } from './SocialShare/config'

// Базовый набор блоков без компонентов, для которых не требуется отображение в админке
const basicBlocks: Record<string, Block> = {
  // Основные блоки
  content: Content,
  callToAction: CallToAction,
  hero: Hero,
  features: Features,
  container: Container,
  divider: Divider,
  steps: Steps,
  accordion: AccordionBlock,

  // Медиа блоки
  media: MediaBlock,
  code: Code,
  video: Video,
  audio: Audio,
  carousel: Carousel,
  gallery: Gallery,

  // Информационные блоки
  banner: Banner,
  faq: FAQ,
  pricingTable: PricingTable,

  // Продуктовые блоки
  productsFilter: ProductsFilter,
  productsList: ProductsList,

  // Функциональные блоки
  form: FormBlock,
  newsletter: Newsletter,

  // Блоки для блога/статей
  articleHeader: ArticleHeader,
  authorBio: AuthorBio,
  blockquote: Blockquote,
  comments: Comments,
  relatedPosts: RelatedPosts,
  socialShare: SocialShare,
}

// Список всех доступных блоков для использования в конфигурации
export const availableBlocks = Object.values(basicBlocks)

// Экспортируем блоки для использования в компонентах
export const blocks = basicBlocks
