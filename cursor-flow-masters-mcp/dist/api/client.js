"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Клиент API для взаимодействия с Flow Masters
 */
class ApiClient {
    constructor(config) {
        this.config = config;
        this.client = axios_1.default.create({
            baseURL: config.apiUrl,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `ApiKey ${config.apiKey}`,
                'X-Client': 'Cursor-MCP-Server',
            },
            timeout: 10000,
        });
        // Добавляем интерцептор для обработки ошибок
        this.client.interceptors.response.use((response) => response, (error) => {
            console.error('API Error:', error.response?.data || error.message);
            return Promise.reject(error);
        });
    }
    /**
     * Получить информацию о версии API
     */
    async getVersion() {
        try {
            const response = await this.client.get('/api/version');
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Проверить подключение к API
     */
    async testConnection() {
        try {
            const response = await this.client.get('/api/health');
            return response.data.success === true;
        }
        catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
    /**
     * Получить интеграции по типу
     */
    async getIntegrations(type) {
        try {
            const params = type ? { type } : undefined;
            const response = await this.client.get('/api/integrations', { params });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Отправить данные на вебхук
     */
    async sendWebhookData(webhookUrl, data) {
        try {
            const response = await this.client.post(webhookUrl, data);
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Получить обновления для MCP сервера
     */
    async checkForUpdates(currentVersion) {
        try {
            const response = await this.client.get('/api/mcp/updates', {
                params: { version: currentVersion },
            });
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
exports.ApiClient = ApiClient;
