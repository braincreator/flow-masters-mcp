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

    return this.withErrorHandling(async () => {
      const query: Record<string, any> = {
        collection: 'services',
        page,
        limit,
        where: {
          ...where,
          // Используем только businessStatus, так как versions отключены
          businessStatus: where.businessStatus || { in: ['active'] },
        },
        depth: 1,
      }

      if (locale) {
        query.locale = locale
      }

      const result = await this.payload.find(query)
      return result as unknown as ServiceListResponse
    }, 'Failed to get services')
  }

  /**
   * Получение услуги по ID
   */
  async getServiceById(id: string, locale?: string): Promise<Service> {
    return this.withErrorHandling(async () => {
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
    }, `Failed to get service with ID: ${id}`)
  }

  /**
   * Получение услуги по slug
   */
  async getServiceBySlug(slug: string | { slug: string }, locale?: string): Promise<Service> {
    return this.withErrorHandling(async () => {
      const query: Record<string, any> = {
        collection: 'services',
        where: {
          slug: {
            equals: typeof slug === 'object' ? slug.slug : slug,
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
    }, `Failed to get service with slug: ${slug}`)
  }

  /**
   * Создание новой услуги
   */
  async createService(data: ServiceCreateInput): Promise<Service> {
    return this.withErrorHandling(async () => {
      const service = await this.payload.create({
        collection: 'services',
        data,
      })
      return service as unknown as Service
    }, 'Failed to create service')
  }

  /**
   * Обновление существующей услуги
   */
  async updateService(data: ServiceUpdateInput): Promise<Service> {
    return this.withErrorHandling(async () => {
      const { id, ...updateData } = data
      const service = await this.payload.update({
        collection: 'services',
        id,
        data: updateData,
      })
      return service as unknown as Service
    }, `Failed to update service with ID: ${data.id}`)
  }

  /**
   * Удаление услуги
   */
  async deleteService(id: string): Promise<void> {
    return this.withErrorHandling(async () => {
      await this.payload.delete({
        collection: 'services',
        id,
      })
    }, `Failed to delete service with ID: ${id}`)
  }

  /**
   * Получение услуг по типу
   */
  async getServicesByType(type: string, locale?: string): Promise<Service[]> {
    return this.withErrorHandling(async () => {
      const query: Record<string, any> = {
        collection: 'services',
        where: {
          serviceType: {
            equals: type,
          },
          businessStatus: {
            in: ['active'],
          },
        },
        depth: 1,
      }

      if (locale) {
        query.locale = locale
      }

      const result = await this.payload.find(query)
      return result.docs as unknown as Service[]
    }, `Failed to get services of type: ${type}`)
  }

  /**
   * Проверка доступности услуги
   */
  async isServiceAvailable(id: string): Promise<boolean> {
    try {
      const service = await this.getServiceById(id)
      return service.businessStatus === 'active'
    } catch (error) {
      return false
    }
  }
}
