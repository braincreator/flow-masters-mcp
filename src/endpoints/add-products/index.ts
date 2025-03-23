import { PayloadRequest } from 'payload'
import { getProductService } from '@/services'

/**
 * Handler for adding products and updating the header
 */
const addProductsHandler = async (req: PayloadRequest, res: any) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      })
    }

    const productService = await getProductService()
    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const product = await productService.create(requestBody)

    return res.json({
      success: true,
      message: 'Product added successfully',
      data: product
    })
  } catch (error) {
    console.error('Error in addProductsHandler:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}

export default addProductsHandler
