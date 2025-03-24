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
export type ProductStatus = 'draft' | 'published'

export interface Product {
  id: string
  title: Record<string, string> // localized
  productType: ProductType
  category: ProductCategory
  price: number
  description: {
    root: {
      type: string
      children: {
        type: string
        version: number
        [k: string]: unknown
      }[]
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  }
  shortDescription: string
  features: Array<{
    name: string
    value: string
  }>
  fileDetails?: FileDetails
  downloadSettings?: DownloadSettings
  version?: ProductVersion
  thumbnail: string | Media // Media relation ID
  gallery?: Array<{
    image: string | Media // Media relation ID
  }>
  demoUrl?: string
  relatedProducts?: string[] | Product[] // Product relation IDs
  status: ProductStatus
  publishedAt?: string
  updatedAt: string
  createdAt: string
}

// Reference to Media type used above
interface Media {
  id: string
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  url: string
}
