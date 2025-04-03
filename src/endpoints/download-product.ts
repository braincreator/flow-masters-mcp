import { Endpoint } from 'payload'
import type { PayloadRequest } from 'payload/types'
import type { Order, Product, User } from '@/payload-types' // Импортируем типы

const downloadProductHandler: Endpoint['handler'] = async (req): Promise<Response> => {
  const { orderId, productId } = req.params
  // Заголовки по умолчанию для ошибок
  const jsonHeaders = { 'Content-Type': 'application/json' }

  // 1. Проверка аутентификации
  if (!req.user) {
    return new Response(JSON.stringify({ message: 'Unauthorized. Please log in.' }), {
      status: 401,
      headers: jsonHeaders,
    })
  }
  const userId = (req.user as User).id

  // Валидация ID
  if (!orderId || !productId) {
    return new Response(JSON.stringify({ message: 'Order ID and Product ID are required.' }), {
      status: 400,
      headers: jsonHeaders,
    })
  }

  try {
    const payload = req.payload

    // 2. Найти заказ и проверить владельца/статус
    let order: Order | null = null
    try {
      order = await payload.findByID<Order>({
        collection: 'orders',
        id: orderId,
        depth: 1, // Нужно для user и items.product
        user: req.user, // Для проверки прав доступа к заказу
      })
    } catch (findError: any) {
      // Если findByID бросает ошибку из-за неверного ID формата
      if (findError?.message?.includes('Cast to ObjectId failed')) {
        return new Response(JSON.stringify({ message: 'Invalid Order ID format.' }), {
          status: 400,
          headers: jsonHeaders,
        })
      }
      // Другие ошибки поиска заказа
      payload.logger.error(`Error finding order ${orderId}: ${findError.message}`)
      return new Response(JSON.stringify({ message: 'Error retrieving order details.' }), {
        status: 500,
        headers: jsonHeaders,
      })
    }

    if (!order) {
      return new Response(JSON.stringify({ message: 'Order not found.' }), {
        status: 404,
        headers: jsonHeaders,
      })
    }

    // Проверяем, принадлежит ли заказ пользователю
    const orderUserId = typeof order.user === 'string' ? order.user : order.user?.id
    if (orderUserId !== userId) {
      return new Response(JSON.stringify({ message: 'Forbidden. You do not own this order.' }), {
        status: 403,
        headers: jsonHeaders,
      })
    }

    // Проверяем статус заказа (подставьте актуальный статус 'completed')
    if (order.status !== 'completed') {
      // ЗАМЕНИТЬ 'completed' на реальный статус
      return new Response(
        JSON.stringify({ message: 'Order is not completed. Download unavailable.' }),
        { status: 403, headers: jsonHeaders },
      )
    }

    // 3. Проверить наличие продукта в заказе
    const productInOrder = order.items?.some((item) => {
      const itemProductId = typeof item.product === 'string' ? item.product : item.product?.id
      return itemProductId === productId
    })

    if (!productInOrder) {
      return new Response(JSON.stringify({ message: 'Product not found in this order.' }), {
        status: 404,
        headers: jsonHeaders,
      })
    }

    // 4. Найти продукт и проверить тип/ссылку
    const product = await payload.findByID<Product>({
      collection: 'products',
      id: productId,
      depth: 0, // Нужны только поля самого продукта
    })

    if (!product) {
      return new Response(JSON.stringify({ message: 'Product details not found.' }), {
        status: 404,
        headers: jsonHeaders,
      })
    }

    if (product.productType !== 'digital') {
      return new Response(JSON.stringify({ message: 'This product is not downloadable.' }), {
        status: 400,
        headers: jsonHeaders,
      })
    }

    if (!product.downloadLink || typeof product.downloadLink !== 'string') {
      payload.logger.error(`Download link missing or invalid for digital product ${productId}`)
      return new Response(JSON.stringify({ message: 'Download link is currently unavailable.' }), {
        status: 500,
        headers: jsonHeaders,
      })
    }

    // 5. Выполнить перенаправление
    // Используем статус 302 Found для временного редиректа
    return Response.redirect(product.downloadLink, 302)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    req.payload.logger.error(
      `Failed to process download for order ${orderId}, product ${productId}: ${message}`,
    )
    return new Response(JSON.stringify({ success: false, message: 'Failed to process download' }), {
      status: 500,
      headers: jsonHeaders, // Используем jsonHeaders
    })
  }
}

export default downloadProductHandler
