import type { Payload } from 'payload'
import { BaseService } from './base.service'
import type {
  Service,
  ServiceCreateInput,
  ServiceUpdateInput,
  ServiceQueryOptions,
  ServiceListResponse,
} from '@/types/service'

export class ServiceService extends BaseService {
  constructor(payload: Payload) {
    super(payload)
  }

  /**
   * Получение списка услуг с фильтрацией и пагинацией
   */
  async getServices(options: ServiceQueryOptions = {}): Promise<ServiceListResponse> {
    const { page = 1, limit = 10, where = {}, locale } = options

    try {
      const query: Record<string, any> = {
        collection: 'services',
        page,
        limit,
        where: {
          ...where,
          status: where.status || { equals: 'published' },
        },
        depth: 1,
      }

      if (locale) {
        query.locale = locale
      }

      const result = await this.payload.find(query)
      return result as unknown as ServiceListResponse
    } catch (error) {
      this.handleError(error, 'Failed to get services')
      throw error
    }
  }

  /**
   * Получение услуги по ID
   */
  async getServiceById(id: string, locale?: string): Promise<Service> {
    try {
      const query: Record<string, any> = {
        collection: 'services',
        id,
        depth: 1,
      }

      if (locale) {
        query.locale = locale
      }

      const service = await this.payload.findByID(query)
      return service as unknown as Service
    } catch (error) {
      this.handleError(error, `Failed to get service with ID: ${id}`)
      throw error
    }
  }

  /**
   * Получение услуги по slug
   */
  async getServiceBySlug(slug: string, locale?: string): Promise<Service> {
    try {
      const query: Record<string, any> = {
        collection: 'services',
        where: {
          slug: {
            equals: slug,
          },
        },
        depth: 1,
      }

      if (locale) {
        query.locale = locale
      }

      const result = await this.payload.find(query)
      
      if (!result.docs || result.docs.length === 0) {
        throw new Error(`Service with slug '${slug}' not found`)
      }

      return result.docs[0] as unknown as Service
    } catch (error) {
      this.handleError(error, `Failed to get service with slug: ${slug}`)
      throw error
    }
  }

  /**
   * Создание новой услуги
   */
  async createService(data: ServiceCreateInput): Promise<Service> {
    try {
      const service = await this.payload.create({
        collection: 'services',
        data,
      })
      return service as unknown as Service
    } catch (error) {
      this.handleError(error, 'Failed to create service')
      throw error
    }
  }

  /**
   * Обновление существующей услуги
   */
  async updateService(data: ServiceUpdateInput): Promise<Service> {
    try {
      const { id, ...updateData } = data
      const service = await this.payload.update({
        collection: 'services',
        id,
        data: updateData,
      })
      return service as unknown as Service
    } catch (error) {
      this.handleError(error, `Failed to update service with ID: ${data.id}`)
      throw error
    }
  }

  /**
   * Удаление услуги
   */
  async deleteService(id: string): Promise<void> {
    try {
      await this.payload.delete({
        collection: 'services',
        id,
      })
    } catch (error) {
      this.handleError(error, `Failed to delete service with ID: ${id}`)
      throw error
    }
  }

  /**
   * Получение услуг по типу
   */
  async getServicesByType(type: string, locale?: string): Promise<Service[]> {
    try {
      const query: Record<string, any> = {
        collection: 'services',
        where: {
          serviceType: {
            equals: type,
          },
          status: {
            equals: 'published',
          },
        },
        depth: 1,
      }

      if (locale) {
        query.locale = locale
      }

      const result = await this.payload.find(query)
      return result.docs as unknown as Service[]
    } catch (error) {
      this.handleError(error, `Failed to get services of type: ${type}`)
      throw error
    }
  }

  /**
   * Проверка доступности услуги
   */
  async isServiceAvailable(id: string): Promise<boolean> {
    try {
      const service = await this.getServiceById(id)
      return service.status === 'published'
    } catch (error) {
      return false
    }
  }
}
