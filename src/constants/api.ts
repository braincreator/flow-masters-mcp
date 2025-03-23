export const API_ROUTES = {
  PAYMENT: {
    YOOMONEY: {
      CALLBACK: '/api/payment/yoomoney/callback',
      NOTIFICATION: '/api/payment/yoomoney/notification',
    },
    ROBOKASSA: {
      CALLBACK: '/api/payment/robokassa/callback',
      RESULT: '/api/payment/robokassa/result',
    },
  },
  PRODUCTS: {
    ADD: '/api/add-products',
    DOWNLOAD: '/api/orders/:orderId/products/:productId/download',
  },
  DISCOUNT: {
    VALIDATE: '/api/validate-discount',
  },
} as const

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const

export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
} as const