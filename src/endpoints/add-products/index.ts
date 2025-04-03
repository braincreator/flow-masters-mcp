import { PayloadRequest } from 'payload'
import { getProductService } from '@/services'

/**
 * Handler for adding products and updating the header
 */
const addProductsHandler = async (req: PayloadRequest): Promise<Response> => {
  const headers = { 'Content-Type': 'application/json' }
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Method not allowed',
        }),
        { status: 405, headers },
      )
    }

    const productService = await getProductService()
    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body

    const product = await productService.create(requestBody)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Product added successfully',
        data: product,
      }),
      { status: 200, headers },
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    req.payload.logger.error(`Error in addProductsHandler: ${message}`)
    return new Response(
      JSON.stringify({
        success: false,
        message: message,
      }),
      { status: 500, headers },
    )
  }
}

export default addProductsHandler
