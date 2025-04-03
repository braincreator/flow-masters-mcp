import { Endpoint } from 'payload/config'
import { DiscountService } from '../services/discount.service'

const validateDiscountHandler: Endpoint['handler'] = async (req): Promise<Response> => {
  const { code, cartTotal } = req.body
  const userId = req.user?.id
  const headers = { 'Content-Type': 'application/json' }

  try {
    const discountService = DiscountService.getInstance()
    const result = await discountService.validateCode(code, userId, cartTotal)

    if (result.isValid) {
      return new Response(
        JSON.stringify({
          success: true,
          discount: result.discount,
        }),
        { status: 200, headers },
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: result.message,
        }),
        { status: 400, headers },
      )
    }
  } catch (error) {
    req.payload.logger.error(
      `Failed to validate discount code ${code}: ${error instanceof Error ? error.message : error}`,
    )
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to validate discount code',
      }),
      { status: 500, headers },
    )
  }
}

export default validateDiscountHandler
