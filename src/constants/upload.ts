export const UPLOAD_CONFIG = {
  LIMITS: {
    FILE_SIZE: 10000000, // 10MB
    MAX_FILES: 10,
  },
  PATHS: {
    TEMP: '/tmp',
  },
  IMAGE: {
    MAX_CONCURRENCY: 4,
    MAX_MEMORY_PER_TASK: 512,
  },
  ALLOWED_MIME_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword'],
    ARCHIVE: ['application/zip', 'application/x-rar-compressed'],
  },
} as const

export const IMAGE_SIZES = {
  THUMBNAIL: {
    width: 200,
    height: 200,
  },
  PREVIEW: {
    width: 800,
    height: 600,
  },
  FULL: {
    width: 1920,
    height: 1080,
  },
} as const