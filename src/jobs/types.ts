export interface NewsletterBroadcastJobData {
  broadcastId: string
  title: string
  content: string
  locale?: string
  smtp?: {
    host: string
    port: number
    user: string
    password: string
  }
}

export interface SendToAllResult {
  totalSubscribers: number
  successfullySent: number
  failedToSend: number
  sendErrors: Array<{
    error: string
    id?: string
  }>
}

export interface BroadcastReport {
  broadcastId: string
  status: 'completed' | 'failed'
  title: string
  locale: string
  totalSubscribers: number
  successfullySent: number
  failedToSend: number
  errors: Array<{
    error: string
    id?: string
  }>
}

export interface EmailCampaignJobData {
  campaignId: string
}
