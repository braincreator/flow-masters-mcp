export interface StorageErrorDetails {
  code?: string;
  timestamp?: number;
  context?: Record<string, unknown>;
}

export class StorageError extends Error {
  constructor(
    message: string,
    public details?: StorageErrorDetails
  ) {
    super(message);
    this.name = 'StorageError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleStorageError = (error: unknown): never => {
  if (error instanceof StorageError) {
    console.error('Storage operation error:', error.message, error.details);
    throw error;
  }
  throw error instanceof Error ? error : new StorageError(String(error));
};