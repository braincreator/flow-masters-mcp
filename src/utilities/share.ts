/**
 * Defines the sharing options available for products
 */
export type SharingPlatform =
  | 'facebook'
  | 'x'
  | 'linkedin'
  | 'pinterest'
  | 'email'
  | 'whatsapp'
  | 'telegram'
  | 'vk'
  | 'instagram'
  | 'threads'
  | 'tenchat'
  | 'copy'

interface ShareOptions {
  url: string
  title?: string
  description?: string
  image?: string
}

/**
 * Shares content to different platforms
 */
export const shareContent = async (
  platform: SharingPlatform,
  options: ShareOptions,
): Promise<boolean> => {
  const { url, title = '', description = '', image = '' } = options

  try {
    switch (platform) {
      case 'facebook':
        // Facebook использует Open Graph метатеги на странице, а не параметры URL
        // Добавляем хеш фрагмент с заголовком для отладки
        console.log('Sharing to Facebook:', { url, title, description })

        // Создаем безопасный хэштег для Facebook из названия продукта (если есть)
        let hashtag = ''
        if (title) {
          // Берем первое слово из названия и удаляем все кроме букв и цифр
          const safeWord = title.split(' ')[0].replace(/[^\w\dа-яА-Я]/g, '')
          if (safeWord) {
            hashtag = `&hashtag=${encodeURIComponent('#' + safeWord)}`
          }
        }

        // Используем параметр quote для предварительного заполнения текста поста
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(description || title)}${hashtag}`,
        )
        break
      case 'x':
        window.open(
          `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        )
        break
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        )
        break
      case 'pinterest':
        window.open(
          `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`,
        )
        break
      case 'email':
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`,
        )
        break
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${url}`)}`)
        break
      case 'telegram':
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        )
        break
      case 'vk':
        window.open(
          `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&image=${encodeURIComponent(image)}`,
        )
        break
      case 'instagram':
        window.open(`https://www.instagram.com/`)
        console.warn(
          'Direct sharing to Instagram is limited. User needs to manually create a post.',
        )
        break
      case 'threads':
        window.open(`https://threads.net/intent/post?text=${encodeURIComponent(`${title} ${url}`)}`)
        break
      case 'tenchat':
        window.open(`https://tenchat.ru/`)
        console.warn(
          'Direct sharing to TenChat via URL is not supported. User needs to manually share.',
        )
        break
      case 'copy':
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(url)
          return true
        } else {
          const textarea = document.createElement('textarea')
          textarea.value = url
          textarea.style.position = 'fixed'
          document.body.appendChild(textarea)
          textarea.focus()
          textarea.select()
          const successful = document.execCommand('copy')
          document.body.removeChild(textarea)
          return successful
        }
      default:
        return false
    }
    return true
  } catch (error) {
    console.error('Error sharing content:', error)
    return false
  }
}
