'use client'

import React, { Fragment, useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'
import styles from './styles.module.css'

const SuccessMessage: React.FC = () => (
  <div>
    Site configuration initialized! You can now customize it in the Settings section.
  </div>
)

export const SiteConfigButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (loading) {
        toast.info('Initialization in progress.')
        return
      }
      if (error) {
        toast.error(`An error occurred, please refresh and try again.`)
        return
      }

      setLoading(true)

      try {
        toast.promise(
          new Promise((resolve, reject) => {
            fetch('/api/init-site-config', {
              method: 'POST',
              credentials: 'include'
            })
              .then((res) => {
                if (res.ok) {
                  resolve(true)
                  setInitialized(true)
                } else {
                  reject('Failed to initialize site configuration.')
                }
              })
              .catch((error) => {
                reject(error)
              })
          }),
          {
            loading: 'Initializing site configuration...',
            success: <SuccessMessage />,
            error: 'Failed to initialize site configuration.',
          },
        )
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        setError(error)
      }
    },
    [loading, error],
  )

  let message = ''
  if (loading) message = ' (initializing...)'
  if (initialized) message = ' (done!)'
  if (error) message = ` (error: ${error})`

  return (
    <Fragment>
      <button 
        className={styles.button}
        onClick={handleClick}
      >
        Initialize Site Configuration
      </button>
      {message && <span className={styles.message}>{message}</span>}
    </Fragment>
  )
}
