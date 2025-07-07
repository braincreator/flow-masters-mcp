import { ApiClient } from '../api/client';
/**
 * Класс для управления обновлениями MCP сервера
 */
export declare class Updater {
    private apiClient;
    private currentVersion;
    private packageJsonPath;
    private updateCheckIntervalMs;
    private autoUpdate;
    private updateCheckInterval;
    constructor(apiClient: ApiClient, currentVersion: string, autoUpdate: boolean, intervalMinutes?: number);
    /**
     * Запустить проверку обновлений по таймеру
     */
    startUpdateChecker(): void;
    /**
     * Остановить проверку обновлений
     */
    stopUpdateChecker(): void;
    /**
     * Освобождение ресурсов при завершении работы
     */
    cleanup(): void;
    /**
     * Проверить наличие обновлений
     */
    checkForUpdates(): Promise<boolean>;
    /**
     * Применить обновление
     */
    private applyUpdate;
}
