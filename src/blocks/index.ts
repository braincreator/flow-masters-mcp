import type { Block } from 'payload'

// Раскомментируем все импорты

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
import { AccordionBlock } from './Accordion/config'
import { Newsletter } from './Newsletter/config'
import { Carousel } from './Carousel/config'
import { Gallery } from './Gallery/config'
import { ProductsFilter } from './ProductsFilter/config'
import { ProductsList } from './ProductsList/config'
import { Features } from './Features/config'
import { Divider } from './Divider/config'
import { Steps } from './Steps/config'
import { PricingTable } from './PricingTable/config'
import { ArticleHeader } from './ArticleHeader/config'
import { AuthorBio } from './AuthorBio/config'
import { Blockquote } from './Blockquote/config'
import { Comments } from './Comments/config'
import { RelatedPosts } from './RelatedPosts/config'
import { SocialShare } from './SocialShare/config'
// Импорт новых блоков
import { Stats } from './Stats/config'
import { Tabs } from './Tabs/config'
import { Timeline } from './Timeline/config'
import { TeamMembers } from './TeamMembers/config'
import { TableOfContents } from './TableOfContents/config'
import { Testimonials } from './Testimonials/config'
import { Header } from './Header/config'
import { Footer } from './Footer/config'
import { Card } from './Card/config'
import { Services } from './Services/config'
import { CaseStudies } from './CaseStudies/config'
import { TechStack } from './TechStack/config'
import { Course } from './Course/config'
import { Curriculum } from './Curriculum/config'
import { PlansComparison } from './PlansComparison/config'
import { InteractiveDemo } from './InteractiveDemo/config'
import { Calendar } from './Calendar/config'
import { UserProgress } from './UserProgress/config'
import { Certificates } from './Certificates/config'
import { ResourceLibrary } from './ResourceLibrary/config'
import { AiTools } from './AiTools/config'
import { Feedback } from './Feedback/config'
import { Poll } from './Poll/config'
import { AiAssistant } from './AiAssistant/config'
import { VideoLessons } from './VideoLessons/config'
import { Roadmap } from './Roadmap/config'
import { Leaderboard } from './Leaderboard/config'
import { CourseOverview } from './CourseOverview/config'
import { InstructorProfile } from './InstructorProfile/config'
import { BenefitsOutcomes } from './BenefitsOutcomes/config'
import { TargetAudience } from './TargetAudience/config'
import { CourseFAQ } from './CourseFAQ/config'
import { Guarantee } from './Guarantee/config'
import { LeadMagnetOffer } from './LeadMagnetOffer/config'
import { SocialProofAdvanced } from './SocialProofAdvanced/config'
import { CoursePricingComparison } from './CoursePricingComparison/config'
import { UrgencyCTA } from './UrgencyCTA/config'
import { EventTracker } from './EventTracker/config'
import { ReportEmbed } from './ReportEmbed/config'
import { QuizAssessment } from './QuizAssessment/config'
import { DiscussionForum } from './DiscussionForum/config'
import { Assignments } from './Assignments/config'
import { AchievementsBlock } from './Achievements/config'
import { ProjectShowcase } from './ProjectShowcase/config'
import { FunnelStep } from './FunnelStep/config'
import { Recommendations } from './Recommendations/config'
import { PopupTriggerConfig } from './PopupTriggerConfig/config'
import { N8nChatDemo } from './N8nChatDemo/config'

// Восстанавливаем объект basicBlocks
const basicBlocks: Record<string, Block> = {
  // Основные блоки
  content: Content,
  callToAction: CallToAction,
  urgencyCTA: UrgencyCTA,
  hero: Hero,
  features: Features,
  divider: Divider,
  steps: Steps,
  accordion: AccordionBlock,
  card: Card,

  // Медиа блоки
  media: MediaBlock,
  code: Code,
  video: Video,
  audio: Audio,
  carousel: Carousel,
  gallery: Gallery,
  videoLessons: VideoLessons,

  // Информационные блоки
  banner: Banner,
  faq: FAQ,
  courseFAQ: CourseFAQ,
  pricingTable: PricingTable,
  coursePricingComparison: CoursePricingComparison,
  stats: Stats,
  tabs: Tabs,
  timeline: Timeline,
  tableOfContents: TableOfContents,
  roadmap: Roadmap,
  benefitsOutcomes: BenefitsOutcomes,
  targetAudience: TargetAudience,
  guarantee: Guarantee,
  socialProofAdvanced: SocialProofAdvanced,

  // Блоки с людьми
  teamMembers: TeamMembers,
  testimonials: Testimonials,
  instructorProfile: InstructorProfile,

  // Структурные блоки
  header: Header,
  footer: Footer,

  // Бизнес-блоки
  services: Services,
  caseStudies: CaseStudies,
  techStack: TechStack,
  plansComparison: PlansComparison,

  // Образовательные блоки
  course: Course,
  curriculum: Curriculum,
  userProgress: UserProgress,
  certificates: Certificates,
  resourceLibrary: ResourceLibrary,
  aiTools: AiTools,
  leaderboard: Leaderboard,
  courseOverview: CourseOverview,
  quizAssessment: QuizAssessment,
  assignments: Assignments,
  achievementsBlock: AchievementsBlock,
  projectShowcase: ProjectShowcase,
  funnelStep: FunnelStep,
  recommendations: Recommendations,
  popupTriggerConfig: PopupTriggerConfig,

  // Продуктовые блоки
  productsFilter: ProductsFilter,
  productsList: ProductsList,

  // Функциональные блоки
  form: FormBlock,
  newsletter: Newsletter,
  feedback: Feedback,
  poll: Poll,
  aiAssistant: AiAssistant,
  leadMagnetOffer: LeadMagnetOffer,
  discussionForum: DiscussionForum,

  // Блоки для блога/статей
  articleHeader: ArticleHeader,
  authorBio: AuthorBio,
  blockquote: Blockquote,
  comments: Comments,
  relatedPosts: RelatedPosts,
  socialShare: SocialShare,

  // Специальные блоки
  interactiveDemo: InteractiveDemo,
  calendar: Calendar,

  // Аналитика
  eventTracker: EventTracker,
  reportEmbed: ReportEmbed,

  // Интеграции
  n8nChatDemo: N8nChatDemo,
}

// Список всех доступных блоков для использования в конфигурации
export const availableBlocks = Object.values(basicBlocks)

// Экспортируем блоки для использования в компонентах
export const blocks = basicBlocks
