'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Share2, Award, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { AppError, ErrorSeverity } from '@/utilities/errorHandling'
import { ru, enUS } from 'date-fns/locale'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface Certificate {
  id: string
  title: string
  courseId: string
  courseName: string
  issueDate: string
  expiryDate?: string
  credentialId: string
  imageUrl: string
  status: 'active' | 'expired' | 'revoked'
  skills: string[]
}

interface UserCertificatesProps {
  locale: string
}

export function UserCertificates({ locale }: UserCertificatesProps) {
  const t = useTranslations('Certificates')
  const { user, isAuthenticated, isLoading } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  // Fetch user's certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!isAuthenticated || !user) return

      try {
        setLoading(true)
        // In a real app, you would fetch certificates from an API
        const response = await fetch(`/api/user/${user.id}/certificates`)

        if (response.ok) {
          const data = await response.json()
          setCertificates(data.certificates || [])
        } else {
          // For demo purposes, use mock data
          setTimeout(() => {
            setCertificates([
              {
                id: '1',
                title: 'Automation Fundamentals',
                courseId: 'course-1',
                courseName: 'Introduction to Automation',
                issueDate: '2023-06-15T00:00:00Z',
                credentialId: 'CERT-AF-123456',
                imageUrl: '/images/certificates/automation-fundamentals.jpg',
                status: 'active',
                skills: ['Automation', 'Workflow Design', 'n8n'],
              },
              {
                id: '2',
                title: 'Advanced Workflow Design',
                courseId: 'course-2',
                courseName: 'Advanced Automation Techniques',
                issueDate: '2023-08-22T00:00:00Z',
                credentialId: 'CERT-AWD-789012',
                imageUrl: '/images/certificates/advanced-workflow.jpg',
                status: 'active',
                skills: ['Advanced Automation', 'Complex Workflows', 'API Integration'],
              },
              {
                id: '3',
                title: 'Data Integration Specialist',
                courseId: 'course-3',
                courseName: 'Data Integration with n8n',
                issueDate: '2022-11-10T00:00:00Z',
                expiryDate: '2023-11-10T00:00:00Z',
                credentialId: 'CERT-DIS-345678',
                imageUrl: '/images/certificates/data-integration.jpg',
                status: 'expired',
                skills: ['Data Integration', 'API', 'Database', 'ETL'],
              },
            ])
          }, 500)
        }
      } catch (error) {
        logError('Error fetching certificates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [isAuthenticated, user])

  // Format date based on locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'PPP', { locale: locale === 'ru' ? ru : enUS })
  }

  // Filter certificates based on search query and active tab
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === 'all') return matchesSearch
    return matchesSearch && cert.status === activeTab
  })

  // Handle certificate download
  const handleDownload = (certificateId: string) => {
    // In a real app, this would trigger a download of the certificate
    logDebug(`Downloading certificate ${certificateId}`)
    new AppError({ message: t('downloadStarted'), severity: ErrorSeverity.INFO }).notify()
  }

  // Handle certificate sharing
  const handleShare = (certificateId: string) => {
    // In a real app, this would open a sharing dialog
    logDebug(`Sharing certificate ${certificateId}`)

    if (navigator.share) {
      navigator.share({
        title: t('shareCertificate'),
        text: t('checkOutMyCertificate'),
        url: `https://flowmasters.com/verify/${certificateId}`,
      })
    } else {
      new AppError({ message: t('copyLinkToClipboard'), severity: ErrorSeverity.INFO }).notify()
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('notAuthenticated')}</CardTitle>
          <CardDescription>{t('notAuthenticatedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() =>
              (window.location.href = `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/certificates`)}`)
            }
          >
            {t('loginButton')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10 w-full md:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
            <TabsTrigger value="active">{t('tabs.active')}</TabsTrigger>
            <TabsTrigger value="expired">{t('tabs.expired')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCertificates.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('noCertificates')}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery ? t('noMatchingCertificates') : t('noCertificatesDescription')}
            </p>
            {searchQuery && (
              <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
                {t('clearSearch')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <div className="relative h-48 w-full bg-gray-100">
                {certificate.imageUrl ? (
                  <Image
                    src={certificate.imageUrl}
                    alt={certificate.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Award className="h-16 w-16 text-muted-foreground opacity-30" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge
                    className={
                      certificate.status === 'active'
                        ? 'bg-green-500'
                        : certificate.status === 'expired'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }
                  >
                    {certificate.status === 'active'
                      ? t('status.active')
                      : certificate.status === 'expired'
                        ? t('status.expired')
                        : t('status.revoked')}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{certificate.title}</CardTitle>
                <CardDescription>{certificate.courseName}</CardDescription>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('issueDate')}:</span>
                    <span>{formatDate(certificate.issueDate)}</span>
                  </div>

                  {certificate.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('expiryDate')}:</span>
                      <span>{formatDate(certificate.expiryDate)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('credentialId')}:</span>
                    <span className="font-mono text-xs">{certificate.credentialId}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {certificate.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(certificate.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('download')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleShare(certificate.id)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t('share')}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
