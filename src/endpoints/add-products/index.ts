import { addProductsAndUpdateHeader } from '../seed/add-products'
import type { Payload } from 'payload'

/**
 * Handler for adding products and updating the header
 */
const addProductsHandler = async (req: any, res: any) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      })
    }

    // Ensure we have a valid request body
    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    await addProductsAndUpdateHeader({
      payload: req.payload as Payload,
      req: {
        ...req,
        body: requestBody
      },
    })

    return res.json({
      success: true,
      message: 'Products added and header updated successfully',
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error in add-products handler:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Failed to add products and update header',
      error: errorMessage,
    })
  }
}

export default addProductsHandler
