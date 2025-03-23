export const DATABASE_CONFIG = {
  CONNECTION: {
    directConnection: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
    w: 'majority',
    maxPoolSize: 10,
    minPoolSize: 1,
  },
  COLLECTIONS: {
    USERS: 'users',
    PRODUCTS: 'products',
    ORDERS: 'orders',
    CATEGORIES: 'categories',
    MEDIA: 'media',
    PAGES: 'pages',
    POSTS: 'posts',
    SOLUTIONS: 'solutions',
    EVENTS: 'events',
  },
} as const