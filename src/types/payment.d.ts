// Define types for PaymentService
export interface PaymentService {
  createPayment(provider: PaymentProvider, params: PaymentCreateParams): Promise<PaymentResult>
  getEnabledProviders(): Promise<{ id: PaymentProvider; name: string; enabled: boolean }[]>
  getDefaultProvider(): Promise<PaymentProvider | null>
  validatePayment(provider: PaymentProvider, params: any): Promise<PaymentValidationResult>
}
