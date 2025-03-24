import { Payload } from 'payload'
import { BaseService } from './base.service'
import { StorageError } from '../errors/storage.error'

export class StorageService extends BaseService {
  private static instance: StorageService | null = null

  private constructor(payload: Payload) {
    super(payload)
  }

  public static getInstance(payload: Payload): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService(payload)
    }
    return StorageService.instance
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      // Implementation here
      return path
    } catch (error) {
      throw new StorageError('Failed to upload file', {
        code: 'UPLOAD_FAILED',
        timestamp: Date.now(),
        context: { path }
      })
    }
  }

  async uploadProductFile(file: Express.Multer.File): Promise<{ filename: string; size: number }> {
    try {
      // Implementation for product file upload
      const result = await this.payload.upload({
        collection: 'media',
        data: {
          alt: file.originalname,
        },
        file: file,
      })

      return {
        filename: result.filename,
        size: file.size,
      }
    } catch (error) {
      throw new StorageError('Failed to upload product file', {
        code: 'PRODUCT_UPLOAD_FAILED',
        timestamp: Date.now(),
        context: { filename: file.originalname }
      })
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      // Implementation here
      await this.payload.delete({
        collection: 'media',
        where: {
          filename: { equals: path }
        }
      })
    } catch (error) {
      throw new StorageError('Failed to delete file', {
        code: 'DELETE_FAILED',
        timestamp: Date.now(),
        context: { path }
      })
    }
  }

  async deleteProductFile(filename: string): Promise<void> {
    try {
      await this.payload.delete({
        collection: 'media',
        where: {
          filename: { equals: filename }
        }
      })
    } catch (error) {
      throw new StorageError('Failed to delete product file', {
        code: 'PRODUCT_DELETE_FAILED',
        timestamp: Date.now(),
        context: { filename }
      })
    }
  }
}
