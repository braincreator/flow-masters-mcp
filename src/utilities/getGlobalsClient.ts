// Client-side version of the getGlobals utility
// This doesn't use next/cache which is server-only

export async function fetchGlobal(slug: string, depth = 1, locale: string = 'en') {
  try {
    const res = await fetch(`/api/globals/${slug}?depth=${depth}&locale=${locale}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || `Failed to fetch global: ${slug}`)
    }
    
    const data = await res.json()
    return data?.doc || data // Handle both Payload's format and our custom format
  } catch (error) {
    console.error(`Error fetching global ${slug}:`, error)
    return null
  }
}
