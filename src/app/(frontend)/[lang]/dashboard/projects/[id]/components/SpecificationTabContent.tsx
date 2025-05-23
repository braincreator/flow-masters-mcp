import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Download } from 'lucide-react'

// Copied from page.tsx - consider moving to a shared types file later
interface ProjectDetails {
  id: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    email: string
  }
  sourceOrder: {
    id: string
    orderNumber: string
  }
  serviceDetails: {
    serviceName: string
    serviceType?: string
  }
  specificationText: {
    ru?: string | null
    en?: string | null
    [key: string]: string | null | undefined
  }
  specificationFiles: Array<{
    id: string
    filename: string
    url: string
  }>
  tasks?: any[] // Replace with TaskItem[] if defined elsewhere
  messages?: any[] // Replace with MessageItem[] if defined elsewhere
  projectFiles?: any[] // Replace with ProjectFile[] if defined elsewhere
}

interface SpecificationTabContentProps {
  project: ProjectDetails
  lang: string
  // params: { lang: string }; // params.lang is available via lang prop directly
  t: (key: string, params?: any) => string
}

const SpecificationTabContent: React.FC<SpecificationTabContentProps> = ({ project, lang, t }) => {
  const currentLangSpecText =
    project.specificationText?.[lang] ||
    project.specificationText?.['en'] ||
    project.specificationText?.['ru']

  return (
    <motion.div
      key="specification"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('specificationText')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentLangSpecText ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: currentLangSpecText }}
            />
          ) : (
            <p className="text-muted-foreground">{t('noSpecificationText')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('specificationFiles')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.specificationFiles && project.specificationFiles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя файла</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.specificationFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span className="font-medium truncate">{file.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={file.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          {t('downloadFile')}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">{t('noSpecificationFiles')}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default SpecificationTabContent
