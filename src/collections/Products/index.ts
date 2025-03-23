import type { CollectionConfig } from 'payload'
import type { Product } from '@/payload-types'

import { isAdmin } from '@/access/isAdmin'
import { isAdminOrHasProductAccess } from '@/access/isAdminOrHasProductAccess'
import { productFields } from '@/fields/product'
import { beforeProductChange } from '@/hooks/beforeProductChange'
import { afterProductChange } from '@/hooks/afterProductChange'
import { generateProductSlug } from '@/utilities/generateSlug'