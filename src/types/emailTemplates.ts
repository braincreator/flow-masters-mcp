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

export interface PasswordChangedEmailData extends BaseEmailTemplateData {
  userName: string;
  // No other specific fields needed, just a confirmation
}

export interface EmailAddressChangedEmailData extends BaseEmailTemplateData {
  userName: string;
  newEmail: string;
  oldEmail?: string; // Optional, for notifying the old address
}

export interface AccountUpdatedEmailData extends BaseEmailTemplateData {
  userName: string;
  updatedFieldsText: string; // A summary of what was updated
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

export interface OrderCompletedEmailData extends BaseEmailTemplateData {
  userName: string
  orderNumber: string
  orderDate: string
  items?: Array<{ // Items are optional as we might just link to the order
    name: string
    quantity: number
    // Other item details if needed for the email
  }>
  // No financial details usually, as it's about fulfillment complete
}

export interface OrderCancelledEmailData extends BaseEmailTemplateData {
  userName: string
  orderNumber: string
  cancellationDate?: string // Optional: date of cancellation
  cancellationReason?: string // Optional: reason for cancellation
  // You might want to include a summary of items if relevant, or link to order details
}

export interface RefundProcessedEmailData extends BaseEmailTemplateData {
  userName: string
  orderNumber: string
  refundAmount: number
  currency: string
  processedAt: string
  // refundMethod?: string; // Optional: e.g., "to original payment method"
}

export interface InitialPaymentFailedEmailData extends BaseEmailTemplateData {
  userName: string
  orderNumber: string
  failureReason?: string
  // Include payment amount/currency if helpful
  // paymentAmount?: number;
  // currency?: string;
}

export interface OrderShippedFulfilledEmailData extends BaseEmailTemplateData {
  userName: string;
  orderNumber: string;
  shippedAt?: string; // Date of shipment/fulfillment
  trackingNumber?: string;
  carrier?: string;
  items?: Array<{ // Optional, but good to list what was shipped/fulfilled
    name: string;
    quantity: number;
  }>;
  // deliveryEstimate?: string; // Optional
}

export interface DigitalProductReadyEmailData extends BaseEmailTemplateData {
  userName: string;
  orderNumber: string;
  items?: Array<{ // Optional, but good to list what was fulfilled
    name: string;
    // quantity?: number; // Quantity might not be relevant if it's about access
  }>;
  downloadLinks?: string[]; // Array of direct download links if applicable
  accessInstructions?: string; // Or general instructions on how to access
}

export interface AbandonedCartEmailData extends BaseEmailTemplateData {
  userName: string;
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    // imageUrl?: string; // Optional
  }>;
  total: number;
  currency: string;
  lastUpdated: string; // ISO date string
  cartUrl: string;
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

// Subscription email templates
export interface SubscriptionActivatedEmailData extends BaseEmailTemplateData {
  userName: string
  planName: string
  startDate: string
  nextPaymentDate: string
}

export interface SubscriptionCancelledEmailData extends BaseEmailTemplateData {
  userName: string
  planName: string
  endDate: string
}

export interface SubscriptionPaymentFailedEmailData extends BaseEmailTemplateData {
  userName: string
  planName: string
  nextPaymentDate: string
  amount?: number // Optional, as plan might not always have price directly
  currency?: string // Optional
}

export interface SubscriptionPlanChangedEmailData extends BaseEmailTemplateData {
  userName: string
  oldPlanName: string
  newPlanName: string
  effectiveDate: string
}

export interface SubscriptionPausedEmailData extends BaseEmailTemplateData {
  userName: string
  planName: string
  pausedAt: string
}

export interface SubscriptionResumedEmailData extends BaseEmailTemplateData {
  userName: string
  planName: string
  resumedAt: string
  nextPaymentDate: string
}

export interface SubscriptionExpiredEmailData extends BaseEmailTemplateData {
  userName: string
  planName: string
  expiredAt: string
}

export interface SubscriptionRenewalReminderEmailData extends BaseEmailTemplateData {
  userName: string
  planName: string
  renewalDate: string
}

export interface SubscriptionRenewedSuccessfullyEmailData extends BaseEmailTemplateData {
  userName: string
  planName: string
  newExpiryDate: string
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
  ADMIN_NEW_SUBSCRIBER = 'admin-new-subscriber',

  // Subscriptions
  SUBSCRIPTION_ACTIVATED = 'subscription-activated',
  SUBSCRIPTION_CANCELLED = 'subscription-cancelled',
  SUBSCRIPTION_PAYMENT_FAILED = 'subscription-payment-failed',
  SUBSCRIPTION_PLAN_CHANGED = 'subscription-plan-changed',
  SUBSCRIPTION_PAUSED = 'subscription-paused',
  SUBSCRIPTION_RESUMED = 'subscription-resumed',
  SUBSCRIPTION_EXPIRED = 'subscription-expired',
  SUBSCRIPTION_RENEWAL_REMINDER = 'subscription-renewal-reminder',
  SUBSCRIPTION_RENEWED_SUCCESSFULLY = 'subscription-renewed', // or 'subscription-renewed-successfully'

  // More Order Statuses
  ORDER_COMPLETED = 'order_completed', // For digital fulfillment, etc.
  ORDER_CANCELLED = 'order-cancelled',
  REFUND_PROCESSED = 'refund-processed',
  INITIAL_PAYMENT_FAILED = 'initial-payment-failed',
  PASSWORD_CHANGED = 'password-changed',
  EMAIL_ADDRESS_CHANGED = 'email-address-changed', // For the new email address
  EMAIL_ADDRESS_CHANGE_SECURITY_ALERT = 'email-address-change-security-alert', // For the old email address
  ACCOUNT_UPDATED = 'account-updated',
  ORDER_SHIPPED_FULFILLED = 'order-shipped-fulfilled',
  DIGITAL_PRODUCT_READY = 'digital_product_ready',
  ABANDONED_CART = 'abandoned-cart',
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
  [EmailTemplateSlug.SUBSCRIPTION_ACTIVATED]: SubscriptionActivatedEmailData
  [EmailTemplateSlug.SUBSCRIPTION_CANCELLED]: SubscriptionCancelledEmailData
  [EmailTemplateSlug.SUBSCRIPTION_PAYMENT_FAILED]: SubscriptionPaymentFailedEmailData
  [EmailTemplateSlug.SUBSCRIPTION_PLAN_CHANGED]: SubscriptionPlanChangedEmailData
  [EmailTemplateSlug.SUBSCRIPTION_PAUSED]: SubscriptionPausedEmailData
  [EmailTemplateSlug.SUBSCRIPTION_RESUMED]: SubscriptionResumedEmailData
  [EmailTemplateSlug.SUBSCRIPTION_EXPIRED]: SubscriptionExpiredEmailData
  [EmailTemplateSlug.SUBSCRIPTION_RENEWAL_REMINDER]: SubscriptionRenewalReminderEmailData
  [EmailTemplateSlug.SUBSCRIPTION_RENEWED_SUCCESSFULLY]: SubscriptionRenewedSuccessfullyEmailData
  [EmailTemplateSlug.ORDER_COMPLETED]: OrderCompletedEmailData
  [EmailTemplateSlug.ORDER_CANCELLED]: OrderCancelledEmailData
  [EmailTemplateSlug.REFUND_PROCESSED]: RefundProcessedEmailData
  [EmailTemplateSlug.INITIAL_PAYMENT_FAILED]: InitialPaymentFailedEmailData
  [EmailTemplateSlug.PASSWORD_CHANGED]: PasswordChangedEmailData
  [EmailTemplateSlug.EMAIL_ADDRESS_CHANGED]: EmailAddressChangedEmailData
  [EmailTemplateSlug.EMAIL_ADDRESS_CHANGE_SECURITY_ALERT]: EmailAddressChangedEmailData // Uses the same data structure
  [EmailTemplateSlug.ACCOUNT_UPDATED]: AccountUpdatedEmailData
  [EmailTemplateSlug.ORDER_SHIPPED_FULFILLED]: OrderShippedFulfilledEmailData
  [EmailTemplateSlug.DIGITAL_PRODUCT_READY]: DigitalProductReadyEmailData
  [EmailTemplateSlug.ABANDONED_CART]: AbandonedCartEmailData
  [key: string]: Record<string, any> // Allow custom templates
}
