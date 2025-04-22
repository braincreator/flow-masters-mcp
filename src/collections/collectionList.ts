import { Pages } from './Pages'
import { Media } from './Media'
import { Users } from './Users'
import { Categories } from './Categories' // General categories, maybe split later?
import { Tags } from './Tags' // General tags

// Analytics
import CourseAnalytics from './CourseAnalytics'

// Blog
import { Posts } from './Posts'
import { PostMetrics } from './PostMetrics'
import { Authors } from './Authors' // Could be related to Users
import { Comments } from './Comments'

// Store / E-commerce
import { Products } from './Products'
import { ProductCategories } from './ProductCategories'
import { Orders } from './Orders'
import { OrderTracking } from './OrderTracking'
import { CartSessions } from './CartSessions'
import { Discounts } from './Discounts'
import { Promotions } from './Promotions'
import { Reviews } from './Reviews'

// Courses / LMS
import { Courses } from './Courses'
import { Modules } from './Modules'
import { Lessons } from './Lessons'
import { Resources } from './Resources' // Learning resources?
import { Achievements } from './Achievements'
import Templates from './Templates'
import AutomationJobs from './AutomationJobs'

// Community / Forum
import { ForumCategories } from './ForumCategories'
import { Messages } from './Messages' // Assuming this is forum/user messages

// Marketing / Communication
import { NewsletterSubscribers } from './newsletter-subscribers'
import { EmailTemplates } from './EmailTemplates'
import { SenderEmails } from './SenderEmails'
import { Broadcasts } from './Broadcasts'
import { BroadcastReports } from './BroadcastReports'
import { Popups } from './Popups'
import { UserSegments } from './UserSegments'
import { Testimonials } from './Testimonials'

// User Specific
import { UserFavorites } from './UserFavorites'
import { SubscriptionPlans } from './subscription-plans'
import { Subscriptions } from './subscriptions'
import { SubscriptionPayments } from './subscription-payments'

// Integrations / Settings / Other
import { Integrations } from './Integrations'
import { Projects } from './Projects' // User projects? Or internal?
import { Solutions } from './Solutions' // Needs clarification
import { Events } from './Events' // Needs clarification

const collections = [
  // Core / Site
  Pages,
  Media,
  Users,
  Categories,
  Tags,

  // Analytics
  CourseAnalytics,

  // Blog
  Posts,
  PostMetrics,
  Authors,
  Comments,

  // Store / E-commerce
  Products,
  ProductCategories,
  Orders,
  OrderTracking,
  CartSessions,
  Discounts,
  Promotions,
  Reviews,

  // Courses / LMS
  Courses,
  Modules,
  Lessons,
  Resources,
  Achievements,
  Templates,

  // Automation
  AutomationJobs,

  // Community / Forum
  ForumCategories,
  Messages,

  // Marketing / Communication
  NewsletterSubscribers,
  EmailTemplates,
  SenderEmails,
  Broadcasts,
  BroadcastReports,
  Popups,
  UserSegments,
  Testimonials,

  // User Specific
  UserFavorites,
  SubscriptionPlans,
  Subscriptions,
  SubscriptionPayments,

  // Integrations / Settings / Other
  Integrations,
  Projects,
  Solutions,
  Events,
]

export default collections
