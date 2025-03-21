import type { GlobalAfterChangeHook } from 'payload'

export const revalidateFooter: GlobalAfterChangeHook = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      const revalidateUrl = `${serverUrl.replace(/\/$/, '')}/api/revalidate`
      
      payload.logger.info('Revalidating footer with doc:', JSON.stringify(doc, null, 2))

      const response = await fetch(revalidateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collection: 'globals',
          slug: 'footer',
          data: doc,
          path: '/',
          tag: 'global_footer'
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Revalidation failed with status ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      payload.logger.info('Footer revalidation successful:', result)

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
      payload.logger.error('Footer revalidation error:', error)
      throw error
    }
  }

  return doc
}
