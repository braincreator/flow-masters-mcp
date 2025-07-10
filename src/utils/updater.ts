import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import * as semver from 'semver'
import { execSync } from 'child_process'
import { ApiClient } from '../api/client'

/**
 * Класс для управления обновлениями MCP сервера
 */
export class Updater {
  private apiClient: ApiClient
  private currentVersion: string
  private packageJsonPath: string
  private updateCheckIntervalMs: number
  private autoUpdate: boolean
  private updateCheckInterval: NodeJS.Timeout | null = null

  constructor(
    apiClient: ApiClient,
    currentVersion: string,
    autoUpdate: boolean,
    intervalMinutes: number = 60,
  ) {
    this.apiClient = apiClient
    this.currentVersion = currentVersion
    this.autoUpdate = autoUpdate
    this.updateCheckIntervalMs = intervalMinutes * 60 * 1000
    this.packageJsonPath = path.resolve(process.cwd(), 'package.json')
  }

  /**
   * Запустить проверку обновлений по таймеру
   */
  startUpdateChecker(): void {
    // Сначала остановим существующий интервал, если он есть
    this.stopUpdateChecker()

    if (this.autoUpdate) {
      console.log(
        `Автоматические обновления активированы. Проверка каждые ${this.updateCheckIntervalMs / 60000} минут`,
      )
      this.checkForUpdates().catch((err) => console.error('Ошибка при проверке обновлений:', err))

      this.updateCheckInterval = setInterval(() => {
        try {
          this.checkForUpdates().catch((err) =>
            console.error('Ошибка при периодической проверке обновлений:', err),
          )
        } catch (error) {
          console.error('Критическая ошибка в интервале проверки обновлений:', error)
        }
      }, this.updateCheckIntervalMs)
    } else {
      console.log('Автоматические обновления отключены')
    }
  }

  /**
   * Остановить проверку обновлений
   */
  stopUpdateChecker(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval)
      this.updateCheckInterval = null
      console.log('Проверка обновлений остановлена')
    }
  }

  /**
   * Освобождение ресурсов при завершении работы
   */
  cleanup(): void {
    this.stopUpdateChecker()
  }

  /**
   * Проверить наличие обновлений
   */
  async checkForUpdates(): Promise<boolean> {
    try {
      console.log(`Проверка обновлений. Текущая версия: ${this.currentVersion}`)

      const result = await this.apiClient.checkForUpdates(this.currentVersion)

      if (!result.success || !result.data) {
        console.log('Не удалось получить информацию об обновлениях')
        return false
      }

      const { hasUpdate, latestVersion, downloadUrl, releaseNotes } = result.data

      if (!hasUpdate || !latestVersion) {
        console.log('Обновления не найдены')
        return false
      }

      console.log(`Доступно обновление: ${latestVersion} (текущая: ${this.currentVersion})`)

      if (releaseNotes) {
        console.log('Что нового:')
        console.log(releaseNotes)
      }

      if (this.autoUpdate && downloadUrl) {
        return await this.applyUpdate(downloadUrl, latestVersion)
      } else if (downloadUrl) {
        console.log(`Для обновления выполните: npm install -g ${downloadUrl}`)
      }

      return true
    } catch (error) {
      console.error('Ошибка при проверке обновлений:', error)
      return false
    }
  }

  /**
   * Применить обновление
   */
  private async applyUpdate(packageUrl: string, newVersion: string): Promise<boolean> {
    try {
      console.log(`Применение обновления до версии ${newVersion}...`)

      // Устанавливаем обновление через npm
      execSync(`npm install -g ${packageUrl}`, { stdio: 'inherit' })

      console.log(`Обновление до версии ${newVersion} успешно установлено`)
      console.log('Перезапуск сервера...')

      // Перезапуск процесса (в реальном приложении нужно реализовать более плавное обновление)
      process.exit(0)

      return true
    } catch (error) {
      console.error('Ошибка при обновлении:', error)
      return false
    }
  }
}
