// Base email template
export * from './baseEmailTemplate'

// For backward compatibility, re-export the old paths
export * from './passwordReset'
export * from './welcome'
export * from './unsubscribeConfirmation'
export * from './newsletter'
export * from './adminNewSubscriber'

// Authentication emails
export * from './auth/passwordReset'
export * from './auth/welcome'
export * from './auth/unsubscribeConfirmation'

// Course emails
export * from './courses/courseEnrollment'
export * from './courses/courseCompletion'
export * from './courses/courseProgress'
export * from './courses/courseCertificate'

// Order emails
export * from './orders/orderConfirmation'
export * from './orders/paymentConfirmation'

// Newsletter emails
export * from './newsletters/newsletter'
export * from './newsletters/adminNewSubscriber'

// Reward emails
export * from './rewards/rewardGeneric'
export * from './rewards/rewardDiscount'
export * from './rewards/rewardFreeCourse'
