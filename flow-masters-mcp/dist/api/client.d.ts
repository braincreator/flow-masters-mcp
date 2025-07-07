import { ApiConfig, ApiResponse, VersionInfo, FlowMastersIntegration, ApiEndpoint, EndpointKnowledgeBase } from '../types';
/**
 * Клиент API для взаимодействия с Flow Masters
 */
export declare class ApiClient {
    private client;
    private config;
    constructor(config: ApiConfig);
    /**
     * Построение URL API с версионированием
     */
    private buildApiUrl;
    /**
     * Получить информацию о версии API
     */
    getVersion(): Promise<ApiResponse<VersionInfo>>;
    /**
     * Проверить подключение к API
     */
    testConnection(): Promise<boolean>;
    /**
     * Получить интеграции по типу
     */
    getIntegrations(type?: string): Promise<ApiResponse<FlowMastersIntegration[]>>;
    /**
     * Отправить данные на вебхук
     */
    sendWebhookData(webhookUrl: string, data: any): Promise<ApiResponse>;
    /**
     * Получить обновления для MCP сервера
     */
    checkForUpdates(currentVersion: string): Promise<ApiResponse<{
        hasUpdate: boolean;
        latestVersion: string;
        downloadUrl?: string;
        releaseNotes?: string;
    }>>;
    /**
     * Получить список доступных эндпоинтов API
     */
    getApiEndpoints(): Promise<ApiResponse<ApiEndpoint[]>>;
    /**
     * Получить базу знаний эндпоинтов для LLM
     */
    getEndpointKnowledgeBase(): Promise<ApiResponse<EndpointKnowledgeBase>>;
    /**
     * Получить список доступных блоков для шаблонов страниц
     */
    getAvailableBlocks(): Promise<ApiResponse<any[]>>;
    /**
     * Выполнить GraphQL запрос
     */
    graphqlRequest<T = any>(query: string, variables?: any, operationName?: string): Promise<ApiResponse<T>>;
    /**
     * Получить посты через GraphQL
     */
    getPostsGraphQL(limit?: number, page?: number): Promise<ApiResponse<any>>;
    /**
     * Получить услуги через GraphQL
     */
    getServicesGraphQL(limit?: number): Promise<ApiResponse<any>>;
    /**
     * Выполнить общий запрос к API
     */
    request<T = any>(method: string, path: string, data?: any, params?: any, headers?: Record<string, string>): Promise<ApiResponse<T>>;
}
