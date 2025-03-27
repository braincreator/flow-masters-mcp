/**
 * Defines the sharing options available for products
 */
export type SharingPlatform =
  | 'facebook'
  | 'twitter'
  | 'pinterest'
  | 'email'
  | 'whatsapp'
  | 'telegram'
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
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
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
