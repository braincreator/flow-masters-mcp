import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { API_CONFIG, buildApiPath } from '@/config/api-routes'

// Конфигурация API (теперь централизованная)
const BASE_URL = API_CONFIG.VERSION ? `/api/${API_CONFIG.VERSION}` : '/api'

// Тип для параметров запроса
interface RequestParams {
  [key: string]: any
}

// Класс API клиента
export class ApiClient {
  private client: AxiosInstance

  constructor(config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    })
  }

  // GET запрос
  async get<T = any>(path: string, params?: RequestParams): Promise<T> {
    const response = await this.client.get<T>(path, { params })
    return response.data
  }

  // POST запрос
  async post<T = any>(path: string, data?: any, params?: RequestParams): Promise<T> {
    const response = await this.client.post<T>(path, data, { params })
    return response.data
  }

  // PUT запрос
  async put<T = any>(path: string, data?: any, params?: RequestParams): Promise<T> {
    const response = await this.client.put<T>(path, data, { params })
    return response.data
  }

  // DELETE запрос
  async delete<T = any>(path: string, params?: RequestParams): Promise<T> {
    const response = await this.client.delete<T>(path, { params })
    return response.data
  }

  // Установить заголовок авторизации
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Удалить заголовок авторизации
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization']
  }
}

// Создаем и экспортируем экземпляр клиента по умолчанию
export const api = new ApiClient()

// Вспомогательные функции для работы с API

// Продукты
export const getProducts = (params = {}) => api.get('/products', params)
export const getProduct = (id: string) => api.get(`/products/${id}`)

// Заказы
export const getOrders = (params = {}) => api.get('/orders', params)
export const getOrder = (id: string) => api.get(`/orders/${id}`)
export const createOrder = (data: any) => api.post('/orders', data)
export const updateOrder = (id: string, data: any) => api.put(`/orders/${id}`, data)

// Корзина
export const getCart = () => api.get('/cart')
export const addToCart = (data: any) => api.post('/cart', data)
export const updateCartItem = (data: any) => api.put('/cart', data)
export const removeFromCart = (data: any) => api.post('/cart/remove-item', data)
export const clearCart = () => api.post('/cart/clear')

// Пользователи
export const getCurrentUser = () => api.get('/users/me')
export const updateUser = (data: any) => api.put('/users/me', data)

// Категории
export const getCategories = (params = {}) => api.get('/categories', params)

// Версия API
export const getApiInfo = () => api.get('/docs')
