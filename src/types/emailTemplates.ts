/**
 * Email template types for Flow Masters
 * This file defines the types for email templates and their data
 */

// Base email template data interface
export interface BaseEmailTemplateData {
  email: string
  locale?: string
  siteUrl?: string
  unsubscribeUrl?: string
  previewText?: string
}

// Authentication email templates
export interface WelcomeEmailData extends BaseEmailTemplateData {
  name?: string
  unsubscribeToken?: string
}

export interface PasswordResetEmailData extends BaseEmailTemplateData {
  name?: string
  resetToken: string
}

export interface UnsubscribeConfirmationEmailData extends BaseEmailTemplateData {
  // No additional fields needed
}

// Course email templates
export interface CourseEnrollmentEmailData extends BaseEmailTemplateData {
  userName: string
  courseName: string
  courseId: string
  courseUrl?: string
  expiresAt?: string
  isPaid?: boolean
  orderNumber?: string
}

export interface CourseCompletionEmailData extends BaseEmailTemplateData {
  userName: string
  courseName: string
  courseId: string
  certificateId?: string
  certificateUrl?: string
  completionDate?: string
  nextCourseId?: string
  nextCourseName?: string
}

export interface CourseProgressEmailData extends BaseEmailTemplateData {
  userName: string
  courseName: string
  courseId: string
  progressPercentage: number
  nextLessonName?: string
  nextLessonUrl?: string
  remainingLessons?: number
  estimatedTimeToComplete?: string
}

export interface CourseCertificateEmailData extends BaseEmailTemplateData {
  userName: string
  courseName: string
  courseId: string
  certificateId: string
  certificateUrl?: string
  completionDate: string
  instructorName?: string
  shareableUrl?: string
}

// Order email templates
export interface OrderConfirmationEmailData extends BaseEmailTemplateData {
  userName: string
  orderNumber: string
  orderDate: string
  items: Array<{
    name: string
    description?: string
    quantity: number
    price: number
    total: number
    type: 'course' | 'product' | 'subscription' | 'other'
    id: string
    url?: string
  }>
  subtotal: number
  discount?: number
  tax?: number
  total: number
  currency?: string
  paymentMethod?: string
  paymentStatus: 'paid' | 'pending' | 'failed'
  billingAddress?: string
  invoiceUrl?: string
}

export interface PaymentConfirmationEmailData extends BaseEmailTemplateData {
  userName: string
  orderNumber: string
  paymentDate: string
  paymentAmount: number
  currency?: string
  paymentMethod?: string
  transactionId?: string
  orderUrl?: string
  receiptUrl?: string
  purchasedItems?: Array<{
    name: string
    type: 'course' | 'product' | 'subscription' | 'other'
    id: string
    url?: string
  }>
}

// Reward email templates
export interface RewardEmailData extends BaseEmailTemplateData {
  userName: string
  rewardTitle: string
  rewardDescription?: string
  rewardType: 'generic' | 'discount' | 'free_course' | 'badge' | 'certificate' | 'exclusive_content'
  rewardId: string
  rewardCode?: string
  expiresAt?: string
  rewardUrl?: string
}

export interface RewardDiscountEmailData extends RewardEmailData {
  discountAmount?: string
  discountType?: 'percentage' | 'fixed'
  applicableTo?: string
}

export interface RewardFreeCourseEmailData extends RewardEmailData {
  courseId?: string
  courseUrl?: string
  courseDuration?: string
  courseLevel?: string
}

// Newsletter email templates
export interface NewsletterEmailData extends BaseEmailTemplateData {
  title?: string
  content?: string | Record<string, unknown>
  unsubscribeToken?: string
}

export interface AdminNewSubscriberNotificationEmailData extends BaseEmailTemplateData {
  newSubscriberEmail: string
  newSubscriberName?: string
  adminPanelUrl?: string
}

// Template slugs enum for type safety
export enum EmailTemplateSlug {
  // Authentication
  WELCOME = 'welcome-email',
  PASSWORD_RESET = 'password-reset',
  UNSUBSCRIBE_CONFIRMATION = 'unsubscribe-confirmation',
  
  // Courses
  COURSE_ENROLLMENT = 'course-enrollment',
  COURSE_COMPLETION = 'course-completion',
  COURSE_PROGRESS = 'course-progress',
  COURSE_CERTIFICATE = 'course-certificate',
  
  // Orders
  ORDER_CONFIRMATION = 'order-confirmation',
  PAYMENT_CONFIRMATION = 'payment-confirmation',
  
  // Rewards
  REWARD_GENERIC = 'reward-generic',
  REWARD_DISCOUNT = 'reward-discount',
  REWARD_FREE_COURSE = 'reward-free-course',
  
  // Newsletters
  NEWSLETTER = 'newsletter',
  ADMIN_NEW_SUBSCRIBER = 'admin-new-subscriber'
}

// Map template slugs to their data types
export interface TemplateDataMap {
  [EmailTemplateSlug.WELCOME]: WelcomeEmailData
  [EmailTemplateSlug.PASSWORD_RESET]: PasswordResetEmailData
  [EmailTemplateSlug.UNSUBSCRIBE_CONFIRMATION]: UnsubscribeConfirmationEmailData
  [EmailTemplateSlug.COURSE_ENROLLMENT]: CourseEnrollmentEmailData
  [EmailTemplateSlug.COURSE_COMPLETION]: CourseCompletionEmailData
  [EmailTemplateSlug.COURSE_PROGRESS]: CourseProgressEmailData
  [EmailTemplateSlug.COURSE_CERTIFICATE]: CourseCertificateEmailData
  [EmailTemplateSlug.ORDER_CONFIRMATION]: OrderConfirmationEmailData
  [EmailTemplateSlug.PAYMENT_CONFIRMATION]: PaymentConfirmationEmailData
  [EmailTemplateSlug.REWARD_GENERIC]: RewardEmailData
  [EmailTemplateSlug.REWARD_DISCOUNT]: RewardDiscountEmailData
  [EmailTemplateSlug.REWARD_FREE_COURSE]: RewardFreeCourseEmailData
  [EmailTemplateSlug.NEWSLETTER]: NewsletterEmailData
  [EmailTemplateSlug.ADMIN_NEW_SUBSCRIBER]: AdminNewSubscriberNotificationEmailData
  [key: string]: Record<string, any> // Allow custom templates
}
