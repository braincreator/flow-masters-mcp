import type { GlobalAfterChangeHook } from 'payload'

export const revalidateHeader: GlobalAfterChangeHook = async ({ doc, req: { payload } }) => {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const revalidateUrl = `${serverUrl.replace(/\/$/, '')}/api/revalidate`
    
    payload.logger.info('Revalidating header with doc:', JSON.stringify(doc, null, 2))

    const response = await fetch(revalidateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection: 'globals',
        slug: 'header',
        data: doc,
        path: '/',
        tag: 'global_header'
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Revalidation failed with status ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    payload.logger.info('Revalidation successful:', result)

    // Force clear the cache
    try {
      await fetch(`${serverUrl}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
    } catch (e) {
      payload.logger.warn('Error clearing cache:', e)
    }

  } catch (error) {
    payload.logger.error('Revalidation error:', error)
    throw error
  }

  return doc
}
