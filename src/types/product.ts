export interface FileDetails {
  key: string
  size: number
  mimeType: string
  version: number
}

export interface DownloadSettings {
  maxDownloads: number
  accessDuration: number // in days
}

export interface ProductVersion {
  number: string
  releaseNotes?: string
}

export type ProductType = 'digital' | 'subscription'
export type ProductCategory = 'n8n' | 'make' | 'tutorials' | 'courses'

export interface Product {
  id: string
  title: Record<string, string> // localized
  productType: ProductType
  category: ProductCategory
  price: number
  description: any // richText
  fileDetails?: FileDetails
  downloadSettings: DownloadSettings
  version?: ProductVersion
  status: 'draft' | 'published'
  publishedAt?: Date
}