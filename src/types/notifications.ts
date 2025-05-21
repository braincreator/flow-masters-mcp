// Define the types of notifications that are actually stored in the database
export enum NotificationStoredType {
  // Course Related
  COURSE_ENROLLED = 'course_enrolled',
  LESSON_COMPLETED = 'lesson_completed',
  MODULE_COMPLETED = 'module_completed',
  ASSESSMENT_SUBMITTED = 'assessment_submitted',
  ASSESSMENT_GRADED = 'assessment_graded',
  COURSE_COMPLETED = 'course_completed',
  CERTIFICATE_ISSUED = 'certificate_issued',
  // Gamification
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  LEVEL_UP = 'level_up',
  // System & General
  SYSTEM_ALERT = 'system_alert', // Critical system, security, major billing issues
  GENERAL_INFO = 'general_info', // General announcements, non-critical updates
  // Specific Categories
  ORDER_UPDATE = 'order_update', // For most order-related statuses
  SUBSCRIPTION_UPDATE = 'subscription_update', // For most subscription statuses
  ACCOUNT_ACTIVITY = 'account_activity', // For password changes, email changes, profile updates
  PROMOTIONAL = 'promotional', // For marketing, discounts, abandoned cart
  SOCIAL_INTERACTION = 'social_interaction', // For comments, replies, mentions
  // Project Related
  PROJECT_STATUS_UPDATED = 'project_status_updated', // For project status updates
}