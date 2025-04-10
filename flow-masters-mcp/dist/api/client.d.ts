import { ApiConfig, ApiResponse, VersionInfo, FlowMastersIntegration } from '../types';
/**
 * Клиент API для взаимодействия с Flow Masters
 */
export declare class ApiClient {
    private client;
    private config;
    constructor(config: ApiConfig);
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
}
