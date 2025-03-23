import { Endpoint } from 'payload/config'
import { DiscountService } from '../services/discount.service'

const validateDiscountHandler: Endpoint['handler'] = async (req, res) => {
  const { code, cartTotal } = req.body
  const userId = req.user?.id

  try {
    const discountService = DiscountService.getInstance()
    const result = await discountService.validateCode(code, userId, cartTotal)

    if (result.isValid) {
      res.status(200).json({
        success: true,
        discount: result.discount,
      })
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate discount code',
    })
  }
}

export default validateDiscountHandler
