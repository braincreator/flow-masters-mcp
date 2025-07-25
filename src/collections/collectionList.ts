import { Pages } from './Pages'
import { Media } from './Media'
import { Users } from './Users'
import { Categories } from './Categories' // General categories, maybe split later?
import { Tags } from './Tags' // General tags
import { Notifications } from './Notifications'

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
import { Services } from './Services'
import { Orders } from './Orders'
import { OrderTracking } from './OrderTracking'
import { CartSessions } from './CartSessions'
import { Discounts } from './Discounts'
import { Promotions } from './Promotions'
import { Reviews } from './Reviews'

// Service Projects
import ServiceProjects from './ServiceProjects'
import Tasks from './Tasks'
import ProjectMessages from './ProjectMessages'
import ProjectMilestones from './ProjectMilestones'
import ProjectReports from './ProjectReports'
import ProjectTemplates from './ProjectTemplates'
import ProjectFeedback from './ProjectFeedback'

// Courses / LMS
import { Courses } from './Courses'
import { Modules } from './Modules'
import { Lessons } from './Lessons'
import { Resources } from './Resources' // Learning resources?
import { Achievements } from './Achievements'
import { UserAchievements } from './UserAchievements'
import { CourseEnrollments } from './CourseEnrollments'
import { LessonProgress } from './LessonProgress'
import { Leaderboard } from './Leaderboard'
import { Rewards } from './Rewards'
import { UserRewards } from './UserRewards'
import { Certificates } from './Certificates'
import Templates from './Templates'
import AutomationJobs from './AutomationJobs'

// Community / Forum
import { ForumCategories } from './ForumCategories'
import { Messages } from './Messages' // Assuming this is forum/user messages

// Marketing / Communication
import { NewsletterSubscribers } from './newsletter-subscribers'
import { EmailTemplates } from './EmailTemplates'
import { SenderEmails } from './SenderEmails'
import { EmailCampaigns } from './EmailCampaigns'
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
import { CalendlySettings } from './CalendlySettings'
import { Bookings } from './Bookings'
import ExpertiseTags from './ExpertiseTags' // Import the new collection
import { Leads } from './Leads' // Import Leads collection
import { FeatureFlags } from './FeatureFlags' // Import FeatureFlags collection

import { TermsPages } from './TermsPages' // Import TermsPages collection
import { ServiceQuestions } from './ServiceQuestions' // Import ServiceQuestions collection
import { ServiceFAQs } from './ServiceFAQs' // Import ServiceFAQs collection

// Forms
import { Forms } from './Forms' // Import Forms collection
import { FormSubmissions } from './FormSubmissions' // Import FormSubmissions collection

// Events and Integrations
import { EventSubscriptions } from './EventSubscriptions' // Import EventSubscriptions collection
import { EventLogs } from './EventLogs' // Import EventLogs collection
import { WebhookLogs } from './WebhookLogs' // Import WebhookLogs collection

// Marketing and Analytics
import { Pixels } from './Pixels' // Import Pixels collection

// Security
import { ApiKeys } from '../payload/collections/ApiKeys' // Import ApiKeys collection

const collections = [
  // Core / Site
  Pages,
  Media,
  Users,
  Categories,
  Tags,
  Notifications,

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
  Services,
  Orders,
  OrderTracking,
  CartSessions,
  Discounts,
  Promotions,
  Reviews,

  // Service Projects
  ServiceProjects,
  Tasks,
  ProjectMessages,
  ProjectMilestones,
  ProjectReports,
  ProjectTemplates,
  ProjectFeedback,

  // Courses / LMS
  Courses,
  Modules,
  Lessons,
  Resources,
  Achievements,
  UserAchievements,
  CourseEnrollments,
  LessonProgress,
  Leaderboard,
  Rewards,
  UserRewards,
  Certificates,
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
  EmailCampaigns,
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
  CalendlySettings,
  Bookings,
  ExpertiseTags, // Add the new collection to the array
  Leads, // Add Leads collection to the array
  FeatureFlags, // Add FeatureFlags collection to the array
  TermsPages, // Add TermsPages collection to the array

  // Forms
  Forms, // Add Forms collection to the array
  FormSubmissions, // Add FormSubmissions collection to the array

  // Events and Integrations
  EventSubscriptions, // Add EventSubscriptions collection to the array
  EventLogs, // Add EventLogs collection to the array
  WebhookLogs, // Add WebhookLogs collection to the array

  // Marketing and Analytics
  Pixels, // Add Pixels collection to the array

  // Security
  ApiKeys, // Add ApiKeys collection to the array
]

export default collections
