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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const client_1 = require("./api/client");
const updater_1 = require("./utils/updater");
async function checkForUpdates() {
    try {
        // Чтение package.json для получения текущей версии
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const currentVersion = packageJson.version;
        // Загрузка конфигурации
        let config;
        try {
            const configPath = path.resolve(process.cwd(), 'config.json');
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        catch (error) {
            console.error('Ошибка при загрузке конфигурации:', error);
            console.log('Используем параметры по умолчанию или переменные окружения');
            config = {
                apiUrl: process.env.API_URL || 'https://flow-masters-api.example.com',
                apiKey: process.env.API_KEY || '',
                autoUpdate: process.env.AUTO_UPDATE === 'true',
                updateCheckInterval: parseInt(process.env.UPDATE_CHECK_INTERVAL || '60', 10),
            };
        }
        if (!config.apiKey) {
            console.error('API ключ не указан. Укажите его в config.json или через переменную окружения API_KEY');
            process.exit(1);
        }
        const apiClient = new client_1.ApiClient({
            apiUrl: config.apiUrl,
            apiKey: config.apiKey,
            autoUpdate: config.autoUpdate,
            updateCheckInterval: config.updateCheckInterval,
        });
        const updater = new updater_1.Updater(apiClient, currentVersion, config.autoUpdate, config.updateCheckInterval);
        const hasUpdate = await updater.checkForUpdates();
        if (!hasUpdate) {
            console.log('Обновления не найдены или не могут быть применены');
            process.exit(0);
        }
    }
    catch (error) {
        console.error('Ошибка при проверке обновлений:', error);
        process.exit(1);
    }
}
// Запуск проверки обновлений
checkForUpdates().catch(console.error);
