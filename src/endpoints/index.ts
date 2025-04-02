import type { Payload } from 'payload'
import type { NextApiRequest, NextApiResponse } from 'next'
import { fixProductCategories } from './seed/add-products'

type NextApiEndpoint = Record<
  string,
  (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
>

export default (payload: Payload): NextApiEndpoint => {
  payload.listen(process.env.PORT || 3001)

  return {
    'seed-db': async (req, res) => {
      // ... existing code ...
    },

    'fix-product-categories': async (req, res) => {
      try {
        await fixProductCategories(payload)
        res.status(200).json({ success: true, message: 'Product categories fixed' })
      } catch (error) {
        console.error('Error fixing product categories:', error)
        res.status(500).json({
          success: false,
          message: 'Failed to fix product categories',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    },
  }
}
