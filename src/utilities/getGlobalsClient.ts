// Client-side version of the getGlobals utility
// This doesn't use next/cache which is server-only

export async function fetchGlobal(slug: string, depth = 1, locale: string = 'en') {
  try {
    const res = await fetch(`/api/globals/${slug}?depth=${depth}&locale=${locale}`)
    if (!res.ok) {
      throw new Error(`Failed to fetch global: ${slug}`)
    }
    const data = await res.json()
    return data
  } catch (error) {
    console.error(`Error fetching global ${slug}:`, error)
    return null
  }
}
