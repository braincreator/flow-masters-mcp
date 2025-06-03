#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// URLs для скачивания иконок
const iconUrls = {
  'gemini.svg': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg',
  'claude.svg': 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/claude-ai-icon.svg',
  'deepseek.svg': 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/deepseek-logo-icon.svg',
  'mcp.png': 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/mcp.png',
  'pydanticai.svg': 'https://ai.pydantic.dev/img/logo-white.svg',
  'a2a-light.svg': 'https://raw.githubusercontent.com/google-a2a/A2A/main/docs/assets/a2a-logo-black.svg',
  'a2a-dark.svg': 'https://raw.githubusercontent.com/google-a2a/A2A/main/docs/assets/a2a-logo-white.svg',
  'n8n.png': 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/n8n-color.png',
  'langchain.png': 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/langchain-color.png',
  'postgresql.svg': 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg',
  'firebase.svg': 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-firebase-icon.svg'
}

// Специальный случай для Flowise - очень длинный URL
const flowiseUrl = 'https://docs.flowiseai.com/~gitbook/image?url=https%3A%2F%2F2285675912-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FGbkT2LO0nYo1GpaPli6H%252Fsites%252Fsite_xr8IJ%252Ficon%252FK0o2MMI8aGsaEmorO1kF%252FFlowise%2520Logo%2520Dark%2520High%2520Res.png%3Falt%3Dmedia%26token%3D1b448d7c-22a1-43c9-b274-d427b8f9588d&width=32&dpr=4&quality=100&sign=278568ee&sv=2'

iconUrls['flowise.png'] = flowiseUrl

const publicDir = path.resolve(__dirname, '../public/icons/tech')

// Создаем директорию если не существует
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

async function downloadFile(url, filename) {
  try {
    console.log(`Downloading ${filename}...`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const buffer = await response.arrayBuffer()
    const filePath = path.join(publicDir, filename)
    
    fs.writeFileSync(filePath, Buffer.from(buffer))
    console.log(`✅ Downloaded ${filename}`)
    
    return true
  } catch (error) {
    console.error(`❌ Failed to download ${filename}:`, error.message)
    return false
  }
}

async function optimizeSvg(filePath) {
  try {
    if (!filePath.endsWith('.svg')) return
    
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Базовая оптимизация SVG
    content = content
      // Удаляем комментарии
      .replace(/<!--[\s\S]*?-->/g, '')
      // Удаляем лишние пробелы
      .replace(/\s+/g, ' ')
      // Удаляем пустые атрибуты
      .replace(/\s*=\s*""\s*/g, '')
      // Минимизируем
      .trim()
    
    fs.writeFileSync(filePath, content)
    console.log(`🔧 Optimized ${path.basename(filePath)}`)
  } catch (error) {
    console.error(`❌ Failed to optimize ${path.basename(filePath)}:`, error.message)
  }
}

async function main() {
  console.log('🚀 Starting tech icons download...')
  console.log(`📁 Target directory: ${publicDir}`)
  
  const results = []
  
  for (const [filename, url] of Object.entries(iconUrls)) {
    const success = await downloadFile(url, filename)
    results.push({ filename, success })
    
    if (success) {
      const filePath = path.join(publicDir, filename)
      await optimizeSvg(filePath)
    }
    
    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('\n📊 Download Summary:')
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\n❌ Failed downloads:')
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.filename}`)
    })
  }
  
  console.log('\n🎉 Tech icons download completed!')
}

main().catch(console.error)
