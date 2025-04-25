import { getPayloadClient } from '../utilities/payload/index'
import { ProductService } from './product.service'

export async function getProductService(): Promise<ProductService> {
  const payload = await getPayloadClient()
  return new ProductService(payload)
}
