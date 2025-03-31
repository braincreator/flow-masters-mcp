import { Locale } from '@/constants'
import { BlockSettings, Media } from '@/components/shared/GridContainer'

// Base block type
export interface BlockBase {
  id?: string
  blockType: string
}

// Common action type used across blocks
export interface Action {
  label: string
  type: 'button' | 'link'
  url?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  newTab?: boolean
  icon?: string
  href: string
  style?: 'primary' | 'secondary' | 'outline' | 'link'
  isExternal?: boolean
}

// Rich text content type
export interface RichTextContent {
  [key: string]: any // For flexibility with different rich text implementations
}

// Hero block
export interface HeroBlock extends BlockBase {
  blockType: 'hero'
  heading: string
  subheading?: string
  content?: string
  primaryAction?: Action
  secondaryAction?: Action
  media?: Media
  layout?: 'left' | 'right' | 'center' | 'fullWidth'
  settings?: BlockSettings
}

// Content block with columns
export interface ContentBlock extends BlockBase {
  blockType: 'content'
  columns: {
    size?: 'full' | 'half' | 'oneThird' | 'twoThirds'
    richText?: RichTextContent
    enableActions?: boolean
    actions?: Action[]
  }[]
  settings?: BlockSettings
}

// Feature grid block
export interface FeatureGridBlock extends BlockBase {
  blockType: 'featureGrid'
  heading?: string
  subheading?: string
  features: {
    title?: string
    description?: string
    icon?: string
    media?: Media
    actions?: Action[]
  }[]
  columns?: 1 | 2 | 3 | 4
  settings?: BlockSettings
}

// Media block (image, video, etc.)
export interface MediaBlock extends BlockBase {
  blockType: 'media'
  media: Media
  caption?: string
  settings?: BlockSettings
}

// Testimonial block
export interface TestimonialBlock extends BlockBase {
  blockType: 'testimonial'
  heading?: string
  subheading?: string
  description?: string
  testimonials: {
    quote: string
    author?: string
    role?: string
    company?: string
    avatar?: Media
    rating?: number
  }[]
  layout?: 'grid' | 'slider' | 'list'
  settings?: BlockSettings
}

// Call to action block
export interface CTABlock extends BlockBase {
  blockType: 'cta'
  heading: string
  subheading?: string
  content?: string
  primaryAction?: Action
  secondaryAction?: Action
  media?: Media
  layout?: 'default' | 'split' | 'centered'
  settings?: BlockSettings
}

// Pricing table block
export interface PricingTableBlock extends BlockBase {
  blockType: 'pricingTable'
  heading?: string
  subheading?: string
  plans: {
    name: string
    price: string | number
    interval?: string
    description?: string
    features?: string[]
    isPopular?: boolean
    actions?: Action[]
  }[]
  settings?: BlockSettings
}

// FAQ block
export interface FaqBlock extends BlockBase {
  blockType: 'faq'
  heading?: string
  subheading?: string
  description?: string
  faqs: {
    question: string
    answer: string | RichTextContent
  }[]
  layout?: 'accordion' | 'grid'
  settings?: BlockSettings
}

// Stats block
export interface StatsBlock extends BlockBase {
  blockType: 'stats'
  heading?: string
  subheading?: string
  description?: string
  stats: {
    value: string | number
    label: string
    description?: string
    prefix?: string
    suffix?: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
  }[]
  layout?: 'grid' | 'cards' | 'inline'
  settings?: BlockSettings
}

// Product list block
export interface ProductsListBlock extends BlockBase {
  blockType: 'productsList'
  heading?: string
  subheading?: string
  enableFiltering?: boolean
  products?: any[] // Specific product type from your system
  limit?: number
  layout?: 'grid' | 'list'
  settings?: BlockSettings
}

// Form block
export interface FormBlock extends BlockBase {
  blockType: 'form'
  heading?: string
  subheading?: string
  form?: any // Form configuration
  settings?: BlockSettings
}

// Tabs block
export interface TabsBlock extends BlockBase {
  blockType: 'tabs'
  tabs: {
    label: string
    content: RichTextContent
    media?: Media
  }[]
  layout?: 'horizontal' | 'vertical'
  settings?: BlockSettings
}

// Timeline block
export interface TimelineBlock extends BlockBase {
  blockType: 'timeline'
  heading?: string
  items: {
    title: string
    date?: string
    description?: string
    media?: Media
  }[]
  settings?: BlockSettings
}

// Divider block
export interface DividerBlock extends BlockBase {
  blockType: 'divider'
  style?: 'solid' | 'dashed' | 'dotted'
  color?: string
  width?: 'narrow' | 'medium' | 'wide' | 'full'
  settings?: BlockSettings
}

// Container block - can contain other blocks
export interface ContainerBlock extends BlockBase {
  blockType: 'container'
  blocks: Block[]
  settings?: BlockSettings
}

// Code block
export interface CodeBlock extends BlockBase {
  blockType: 'code'
  code: string
  language?: string
  showLineNumbers?: boolean
  allowCopy?: boolean
  settings?: BlockSettings
}

// Banner block
export interface BannerBlock extends BlockBase {
  blockType: 'banner'
  heading?: string
  content?: string | RichTextContent
  media?: Media
  actions?: Action[]
  dismissible?: boolean
  settings?: BlockSettings
}

// Carousel/Slider block
export interface CarouselBlock extends BlockBase {
  blockType: 'carousel'
  heading?: string
  subheading?: string
  description?: string
  items: {
    media?: Media
    caption?: string
    heading?: string
    content?: string | RichTextContent
    actions?: Action[]
  }[]
  autoplay?: boolean
  interval?: number
  showControls?: boolean
  showIndicators?: boolean
  settings?: BlockSettings
}

// Video block
export interface VideoBlock extends BlockBase {
  blockType: 'video'
  videoUrl: string
  videoType?: 'youtube' | 'vimeo' | 'custom'
  thumbnailUrl?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  caption?: string
  settings?: BlockSettings
}

// Countdown Timer block
export interface CountdownBlock extends BlockBase {
  blockType: 'countdown'
  heading?: string
  subheading?: string
  targetDate: string
  format?: 'short' | 'medium' | 'long'
  expiredText?: string
  actions?: Action[]
  settings?: BlockSettings
}

// Team Members block
export interface TeamMembersBlock extends BlockBase {
  blockType: 'teamMembers'
  heading?: string
  subheading?: string
  description?: string
  members: {
    name: string
    role?: string
    bio?: string
    avatar?: Media
    social?: {
      twitter?: string
      linkedin?: string
      github?: string
      website?: string
    }
  }[]
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
  settings?: BlockSettings
}

// Image Gallery block
export interface GalleryBlock extends BlockBase {
  blockType: 'gallery'
  heading?: string
  images: Media[]
  layout?: 'grid' | 'masonry'
  columns?: 2 | 3 | 4 | 5
  lightbox?: boolean
  settings?: BlockSettings
}

// Newsletter Signup block
export interface NewsletterBlock extends BlockBase {
  blockType: 'newsletter'
  heading: string
  subheading?: string
  description?: string
  formPlaceholder?: string
  submitText?: string
  successMessage?: string
  layout?: 'inline' | 'stacked' | 'card'
  settings?: BlockSettings
}

// Article Header block for blog posts
export interface ArticleHeaderBlock extends BlockBase {
  blockType: 'articleHeader'
  title: string
  subtitle?: string
  authorInfo?: {
    name: string
    avatar?: Media
    role?: string
  }
  publishDate?: string
  readTime?: string
  featuredImage?: Media
  categories?: string[]
  settings?: BlockSettings
}

// Table of Contents block
export interface TableOfContentsBlock extends BlockBase {
  blockType: 'tableOfContents'
  title?: string
  autoGenerate?: boolean
  items?: {
    title: string
    anchor: string
    level: 1 | 2 | 3
  }[]
  sticky?: boolean
  settings?: BlockSettings
}

// Blockquote block
export interface BlockquoteBlock extends BlockBase {
  blockType: 'blockquote'
  quote: string
  author?: string
  source?: string
  alignment?: 'left' | 'center' | 'right'
  settings?: BlockSettings
}

// Related Posts block
export interface RelatedPostsBlock extends BlockBase {
  blockType: 'relatedPosts'
  title?: string
  posts: {
    title: string
    excerpt?: string
    featuredImage?: Media
    url: string
    date?: string
  }[]
  layout?: 'grid' | 'list'
  columns?: 2 | 3 | 4
  settings?: BlockSettings
}

// Author Bio block
export interface AuthorBioBlock extends BlockBase {
  blockType: 'authorBio'
  author: {
    name: string
    avatar?: Media
    bio?: string
    role?: string
    company?: string
    socialLinks?: {
      platform: string
      url: string
      icon?: string
    }[]
  }
  layout?: 'inline' | 'card'
  settings?: BlockSettings
}

// Audio block for podcasts
export interface AudioBlock extends BlockBase {
  blockType: 'audio'
  audioUrl: string
  title?: string
  artwork?: Media
  showControls?: boolean
  autoplay?: boolean
  settings?: BlockSettings
}

// Social Share block
export interface SocialShareBlock extends BlockBase {
  blockType: 'socialShare'
  title?: string
  platforms: ('twitter' | 'facebook' | 'linkedin' | 'reddit' | 'email' | 'copy')[]
  layout?: 'horizontal' | 'vertical'
  showShareCount?: boolean
  settings?: BlockSettings
}

// Comments Section block
export interface CommentsBlock extends BlockBase {
  blockType: 'comments'
  title?: string
  provider?: 'native' | 'disqus' | 'facebook'
  showCount?: boolean
  settings?: BlockSettings
}

// Features Block
export interface FeaturesBlock extends BlockBase {
  blockType: 'features'
  heading?: string
  subheading?: string
  description?: string
  features: Feature[]
  layout?: 'grid' | 'list' | 'cards'
  settings?: BlockSettings
}

// Blog Block
export interface BlogBlock extends BlockBase {
  blockType: 'blog'
  title?: string
  description?: string
  layout?: 'grid' | 'list'
  postsPerPage?: number
  showFeaturedPost?: boolean
  showSearch?: boolean
  showCategories?: boolean
  showTags?: boolean
  showPagination?: boolean
  categoryID?: string
  tagID?: string
  authorID?: string
  initialPosts?: BlogPost[]
  initialCategories?: BlogCategory[]
  initialTags?: BlogTag[]
}

// Blog Post Block
export interface BlogPostBlock extends BlockBase {
  blockType: 'blogPost'
  post: BlogPost
  relatedPosts?: BlogPost[]
  showTableOfContents?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showReadingTime?: boolean
  showComments?: boolean
  showShareButtons?: boolean
  showRelatedPosts?: boolean
  showTags?: boolean
  showReadingProgress?: boolean
  settings?: BlockSettings
}

// Types
export interface Feature {
  title: string
  description?: string
  icon?: string
  media?: Media
  action?: Action
}

export interface Testimonial {
  quote: string
  author: string
  role?: string
  company?: string
  avatar?: string
  rating?: number
}

export interface Stat {
  value: string
  label: string
  description?: string
  prefix?: string
  suffix?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface CarouselItem {
  heading?: string
  caption?: string
  content?: string
  media?: string
  actions?: Action[]
}

export interface GalleryImage {
  src: string
  alt?: string
  caption?: string
  width?: number
  height?: number
}

export interface TeamMember {
  name: string
  role: string
  bio?: string
  avatar?: string
  social?: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  }
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  publishedAt?: string
  heroImage?: {
    url: string
    alt: string
  }
  excerpt?: string
  content?: any
  author?: {
    id?: string
    name: string
    avatar?: string
  }
  categories?: BlogCategory[]
  tags?: BlogTag[]
  readTime?: number
}

export interface BlogCategory {
  id: string
  title: string
  slug: string
  count?: number
}

export interface BlogTag {
  id: string
  title: string
  slug: string
  count?: number
}

// Union type of all block types
export type Block =
  | HeroBlock
  | ContentBlock
  | FeatureGridBlock
  | MediaBlock
  | TestimonialBlock
  | CTABlock
  | PricingTableBlock
  | FaqBlock
  | StatsBlock
  | ProductsListBlock
  | FormBlock
  | TabsBlock
  | TimelineBlock
  | DividerBlock
  | ContainerBlock
  | CodeBlock
  | BannerBlock
  | CarouselBlock
  | VideoBlock
  | CountdownBlock
  | TeamMembersBlock
  | GalleryBlock
  | NewsletterBlock
  | ArticleHeaderBlock
  | TableOfContentsBlock
  | BlockquoteBlock
  | RelatedPostsBlock
  | AuthorBioBlock
  | AudioBlock
  | SocialShareBlock
  | CommentsBlock
  | FeaturesBlock
  | BlogBlock
  | BlogPostBlock
