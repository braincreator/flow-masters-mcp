import { PayloadRequest } from 'payload/types'

export type ContentType = 'page' | 'layout' | 'route'

export interface RevalidateOptions {
  path?: string
  tag?: string
  collection?: string
  slug?: string
  payload?: any
  context?: any
  type?: ContentType | ContentType[]
}

export interface RevalidateCollectionArgs {
  doc: any
  previousDoc?: any
  req: PayloadRequest
  collection: string
}

export interface RevalidateDeleteArgs {
  doc: any
  req: PayloadRequest
  collection: string
}

export interface CollectionHookOptions {
  handleSlug?: (doc: any) => string
  types?: ContentType[]
}

export interface GlobalHookOptions {
  types?: ContentType[]
}