'use client'

import { Banner } from '@payloadcms/ui/elements/Banner'
import React, { useEffect, useState } from 'react'
import { SeedButton } from '../SeedButton'
import { SiteConfigButton } from '../SiteConfigButton'
import styles from '../styles.module.css'

interface ClientContentProps {
  initialNeedsSiteConfig: boolean
}

export const ClientContent: React.FC<ClientContentProps> = ({ 
  initialNeedsSiteConfig 
}) => {
  const [needsSiteConfig, setNeedsSiteConfig] = useState(initialNeedsSiteConfig)

  useEffect(() => {
    // Only check again if initial state indicates we need config
    // This helps avoid unnecessary checks if config already exists
    if (initialNeedsSiteConfig) {
      const checkSiteConfig = async () => {
        try {
          const response = await fetch('/api/check-site-config')
          const { exists } = await response.json()
          setNeedsSiteConfig(!exists)
        } catch (error) {
          console.error('Failed to check site config:', error)
          setNeedsSiteConfig(initialNeedsSiteConfig)
        }
      }

      checkSiteConfig()
    }
  }, [initialNeedsSiteConfig])

  return (
    <div className={styles.container}>
      <Banner className={styles.banner} type="success">
        <h4>Welcome to your dashboard!</h4>
      </Banner>
      Here&apos;s what to do next:
      <ul className={styles.instructions}>
        {needsSiteConfig === true && (
          <li>
            <SiteConfigButton />
            {' to set up your initial site configuration.'}
          </li>
        )}
        <li>
          <SeedButton />
          {' with a few pages, posts, and projects to jump-start your new site, then '}
          <a href="/" target="_blank">
            visit your website
          </a>
          {' to see the results.'}
        </li>
        <li>
          If you created this repo using Payload Cloud, head over to GitHub and clone it to your
          local machine. It will be under the <i>GitHub Scope</i> that you selected when creating
          this project.
        </li>
        <li>
          {'Modify your '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            collections
          </a>
          {' and add more '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            fields
          </a>
          {' as needed. If you are new to Payload, we also recommend you check out the '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            Getting Started
          </a>
          {' docs.'}
        </li>
      </ul>
    </div>
  )
}
