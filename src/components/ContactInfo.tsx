'use client'

import { useSiteConfig } from '@/contexts/SiteConfigContext'

export function ContactInfo() {
  const siteConfig = useSiteConfig()

  if (!siteConfig) return null

  return (
    <div className="contact-info">
      <h2>{siteConfig.company?.legalName}</h2>
      <p>{siteConfig.contact?.address}</p>
      <p>Email: {siteConfig.contact?.email}</p>
      <p>Phone: {siteConfig.contact?.phone}</p>
      <p>Hours: {siteConfig.contact?.workingHours}</p>
      {siteConfig.contact?.googleMapsUrl && (
        <a 
          href={siteConfig.contact.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Google Maps
        </a>
      )}
    </div>
  )
}