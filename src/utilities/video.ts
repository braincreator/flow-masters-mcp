export const parseVideoUrl = (url: string): { type: string; id: string } | null => {
  try {
    const urlObj = new URL(url)

    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      const id = urlObj.hostname.includes('youtu.be')
        ? urlObj.pathname.slice(1)
        : urlObj.searchParams.get('v')
      return id ? { type: 'youtube', id } : null
    }

    // Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      const id = urlObj.pathname.split('/')[1]
      return id ? { type: 'vimeo', id } : null
    }

    // VK
    if (urlObj.hostname.includes('vk.com')) {
      const matches = url.match(/video(-?\d+_\d+)/)
      return matches ? { type: 'vk', id: matches[1] } : null
    }

    // Rutube
    if (urlObj.hostname.includes('rutube.ru')) {
      const matches = url.match(/video\/([\w-]+)/) || url.match(/embed\/([\w-]+)/)
      return matches ? { type: 'rutube', id: matches[1] } : null
    }

    // TikTok
    if (urlObj.hostname.includes('tiktok.com')) {
      const matches = url.match(/video\/(\d+)/)
      return matches ? { type: 'tiktok', id: matches[1] } : null
    }

    // Instagram
    if (urlObj.hostname.includes('instagram.com')) {
      return { type: 'instagram', id: '', videoUrl: url }
    }

    return null
  } catch {
    return null
  }
}
