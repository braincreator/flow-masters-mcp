"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Updater = void 0;
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
/**
 * Класс для управления обновлениями MCP сервера
 */
class Updater {
    constructor(apiClient, currentVersion, autoUpdate, intervalMinutes = 60) {
        this.updateCheckInterval = null;
        this.apiClient = apiClient;
        this.currentVersion = currentVersion;
        this.autoUpdate = autoUpdate;
        this.updateCheckIntervalMs = intervalMinutes * 60 * 1000;
        this.packageJsonPath = path.resolve(process.cwd(), 'package.json');
    }
    /**
     * Запустить проверку обновлений по таймеру
     */
    startUpdateChecker() {
        // Сначала остановим существующий интервал, если он есть
        this.stopUpdateChecker();
        if (this.autoUpdate) {
            console.log(`Автоматические обновления активированы. Проверка каждые ${this.updateCheckIntervalMs / 60000} минут`);
            this.checkForUpdates().catch((err) => console.error('Ошибка при проверке обновлений:', err));
            this.updateCheckInterval = setInterval(() => {
                try {
                    this.checkForUpdates().catch((err) => console.error('Ошибка при периодической проверке обновлений:', err));
                }
                catch (error) {
                    console.error('Критическая ошибка в интервале проверки обновлений:', error);
                }
            }, this.updateCheckIntervalMs);
        }
        else {
            console.log('Автоматические обновления отключены');
        }
    }
    /**
     * Остановить проверку обновлений
     */
    stopUpdateChecker() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
            this.updateCheckInterval = null;
            console.log('Проверка обновлений остановлена');
        }
    }
    /**
     * Освобождение ресурсов при завершении работы
     */
    cleanup() {
        this.stopUpdateChecker();
    }
    /**
     * Проверить наличие обновлений
     */
    async checkForUpdates() {
        try {
            console.log(`Проверка обновлений. Текущая версия: ${this.currentVersion}`);
            const result = await this.apiClient.checkForUpdates(this.currentVersion);
            if (!result.success || !result.data) {
                console.log('Не удалось получить информацию об обновлениях');
                return false;
            }
            const { hasUpdate, latestVersion, downloadUrl, releaseNotes } = result.data;
            if (!hasUpdate || !latestVersion) {
                console.log('Обновления не найдены');
                return false;
            }
            console.log(`Доступно обновление: ${latestVersion} (текущая: ${this.currentVersion})`);
            if (releaseNotes) {
                console.log('Что нового:');
                console.log(releaseNotes);
            }
            if (this.autoUpdate && downloadUrl) {
                return await this.applyUpdate(downloadUrl, latestVersion);
            }
            else if (downloadUrl) {
                console.log(`Для обновления выполните: npm install -g ${downloadUrl}`);
            }
            return true;
        }
        catch (error) {
            console.error('Ошибка при проверке обновлений:', error);
            return false;
        }
    }
    /**
     * Применить обновление
     */
    async applyUpdate(packageUrl, newVersion) {
        try {
            console.log(`Применение обновления до версии ${newVersion}...`);
            // Устанавливаем обновление через npm
            (0, child_process_1.execSync)(`npm install -g ${packageUrl}`, { stdio: 'inherit' });
            console.log(`Обновление до версии ${newVersion} успешно установлено`);
            console.log('Перезапуск сервера...');
            // Перезапуск процесса (в реальном приложении нужно реализовать более плавное обновление)
            process.exit(0);
            return true;
        }
        catch (error) {
            console.error('Ошибка при обновлении:', error);
            return false;
        }
    }
}
exports.Updater = Updater;
