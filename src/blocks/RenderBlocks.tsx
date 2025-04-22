import React from 'react'
import dynamic from 'next/dynamic'

// Основные блоки
const ContentBlock = dynamic(() => import('./Content/Component').then((mod) => mod.ContentBlock))
const CallToActionBlock = dynamic(() =>
  import('./CallToAction/Component').then((mod) => mod.CallToActionBlock),
)
const CTABlock = dynamic(() => import('./CTA/Component').then((mod) => mod.CTABlock))
const HeroBlock = dynamic(() => import('./Hero/Component').then((mod) => mod.HeroBlock))
const BlogBlock = dynamic(() => import('./Blog/Component').then((mod) => mod.BlogBlock))

// Медиа и контент блоки
const MediaBlock = dynamic(() => import('./MediaBlock/Component').then((mod) => mod.MediaBlock))
const CodeBlock = dynamic(() => import('./Code/Component').then((mod) => mod.CodeBlock))
const Video = dynamic(() => import('./Video/Component').then((mod) => mod.VideoComponent))
const AudioBlock = dynamic(() => import('./Audio/Component').then((mod) => mod.AudioBlock))

// Информационные блоки
const BannerBlock = dynamic(() => import('./Banner/Component').then((mod) => mod.BannerBlock))
const FaqBlock = dynamic(() => import('./FAQ/Component').then((mod) => mod.FaqBlock))
const TestimonialBlock = dynamic(() =>
  import('./Testimonial/Component').then((mod) => mod.TestimonialBlock),
)
const BlockquoteBlock = dynamic(() =>
  import('./Blockquote/Component').then((mod) => mod.BlockquoteBlock),
)

// Структурные блоки
const TabsBlock = dynamic(() => import('./Tabs/Component').then((mod) => mod.TabsComponent))
const TimelineBlock = dynamic(() => import('./Timeline/Component').then((mod) => mod.TimelineBlock))
const DividerBlock = dynamic(() => import('./Divider/Component').then((mod) => mod.DividerBlock))

// Функциональные блоки
const FormBlock = dynamic(() => import('./Form/Component').then((mod) => mod.FormBlock))
const NewsletterBlock = dynamic(() =>
  import('./Newsletter/Component').then((mod) => mod.NewsletterBlock),
)
const CountdownBlock = dynamic(() =>
  import('./Countdown/Component').then((mod) => mod.CountdownBlock),
)
const LeadMagnetOfferBlock = dynamic(() =>
  import('./LeadMagnetOffer/Component').then((mod) => mod.LeadMagnetOfferBlock),
)

// Блоки для отображения данных
const FeatureGridBlock = dynamic(() =>
  import('./FeatureGrid/Component').then((mod) => mod.FeatureGridBlock),
)
const FeaturesBlock = dynamic(() => import('./Features/Component').then((mod) => mod.Features))
const StatsBlock = dynamic(() => import('./Stats/Component').then((mod) => mod.Stats))
const TeamMembersBlock = dynamic(() =>
  import('./TeamMembers/Component').then((mod) => mod.TeamMembersBlock),
)
const GalleryBlock = dynamic(() => import('./Gallery/Component').then((mod) => mod.GalleryBlock))
const CarouselBlock = dynamic(() => import('./Carousel/Component').then((mod) => mod.CarouselBlock))

// Блоки для блога
const BlogPostBlock = dynamic(() => import('./BlogPost/Component').then((mod) => mod.BlogPostBlock))
const RelatedPostsBlock = dynamic(() =>
  import('./RelatedPosts/Component').then((mod) => mod.RelatedPostsBlock),
)
const TableOfContentsBlock = dynamic(() =>
  import('./TableOfContents/Component').then((mod) => mod.TableOfContents),
)
const ArticleHeaderBlock = dynamic(() =>
  import('./ArticleHeader/Component').then((mod) => mod.ArticleHeaderBlock),
)
const AuthorBioBlock = dynamic(() =>
  import('./AuthorBio/Component').then((mod) => mod.AuthorBioBlock),
)
const CommentsBlock = dynamic(() => import('./Comments/Component').then((mod) => mod.CommentsBlock))
const SocialShareBlock = dynamic(() =>
  import('./SocialShare/Component').then((mod) => mod.SocialShareBlock),
)

// Блоки для продуктов
const ProductsListBlock = dynamic(() =>
  import('./ProductsList/Component').then((mod) => mod.ProductsList),
)
const ProductsFilterBlock = dynamic(() =>
  import('./ProductsFilter/Component').then((mod) => mod.ProductsFilter),
)
const PricingTableBlock = dynamic(() =>
  import('./PricingTable/Component').then((mod) => mod.PricingTableBlock),
)

// Интеграционные блоки
const ChatBlock = dynamic(() => import('./Chat/Component').then((mod) => mod.default))

// Объединяем все блоки в один объект
const blockComponents = {
  // Основные блоки
  content: ContentBlock,
  callToAction: CallToActionBlock,
  cta: CTABlock,
  hero: HeroBlock,
  blog: BlogBlock,

  // Медиа и контент блоки
  media: MediaBlock,
  code: CodeBlock,
  video: Video,
  audio: AudioBlock,

  // Информационные блоки
  banner: BannerBlock,
  faq: FaqBlock,
  testimonial: TestimonialBlock,
  blockquote: BlockquoteBlock,

  // Структурные блоки
  tabs: TabsBlock,
  timeline: TimelineBlock,
  divider: DividerBlock,

  // Функциональные блоки
  form: FormBlock,
  newsletter: NewsletterBlock,
  countdown: CountdownBlock,
  leadMagnetOffer: LeadMagnetOfferBlock,

  // Блоки для отображения данных
  featureGrid: FeatureGridBlock,
  features: FeaturesBlock,
  stats: StatsBlock,
  teamMembers: TeamMembersBlock,
  gallery: GalleryBlock,
  carousel: CarouselBlock,

  // Блоки для блога
  blogPost: BlogPostBlock,
  relatedPosts: RelatedPostsBlock,
  tableOfContents: TableOfContentsBlock,
  articleHeader: ArticleHeaderBlock,
  authorBio: AuthorBioBlock,
  comments: CommentsBlock,
  socialShare: SocialShareBlock,

  // Блоки для продуктов
  productsList: ProductsListBlock,
  productsFilter: ProductsFilterBlock,
  pricingTable: PricingTableBlock,

  // Интеграционные блоки
  chat: ChatBlock,
  n8nChatDemo: ChatBlock, // Для обратной совместимости
} as const

type Props = {
  blocks?: {
    blockType: keyof typeof blockComponents
    [key: string]: any
  }[]
}

export const RenderBlocks: React.FC<Props> = ({ blocks = [] }) => {
  if (!Array.isArray(blocks)) {
    console.warn('RenderBlocks: blocks is not an array', blocks)
    return null
  }

  if (blocks.length === 0) {
    console.info('RenderBlocks: blocks array is empty')
  }

  return (
    <>
      {blocks.map((block, i) => {
        const blockType = block.blockType
        const Block = blockComponents[blockType]

        if (!Block) {
          console.warn(`RenderBlocks: No component found for blockType '${blockType}'`, block)
          return (
            <div key={i} className="p-4 border border-red-300 bg-red-50 text-red-700 rounded my-4">
              <p>Unknown block type: {blockType}</p>
            </div>
          )
        }

        try {
          return <Block key={i} {...(block as any)} />
        } catch (error) {
          console.error(`Error rendering block of type '${blockType}':`, error)
          return (
            <div key={i} className="p-4 border border-red-300 bg-red-50 text-red-700 rounded my-4">
              <p>Error rendering {blockType} block</p>
            </div>
          )
        }
      })}
    </>
  )
}
