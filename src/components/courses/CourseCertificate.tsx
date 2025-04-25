'use client'

import React, { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Download, Share2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface CourseCertificateProps {
  course: any
  completionDate: string
  certificateId?: string
}

export function CourseCertificate({
  course,
  completionDate,
  certificateId,
}: CourseCertificateProps) {
  const { user } = useAuth()
  const certificateRef = useRef<HTMLDivElement>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      })

      const imgWidth = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`${course.title.replace(/\s+/g, '_')}_Certificate.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user?.name}'s Certificate of Completion`,
        text: `I've completed the "${course.title}" course!`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `I've completed the "${course.title}" course! #learning #education`,
      )}&url=${encodeURIComponent(window.location.href)}`
      window.open(shareUrl, '_blank')
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Certificate of Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6 flex flex-col items-center">
          <div
            ref={certificateRef}
            className="w-full max-w-3xl bg-white border-8 border-double border-gray-200 p-8 text-center"
          >
            <div className="flex justify-center mb-6">
              <Award className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-3xl font-serif mb-2">Certificate of Completion</h1>
            <p className="text-lg text-gray-600 mb-8">This certifies that</p>
            <h2 className="text-2xl font-bold font-serif mb-8">{user?.name || 'Student Name'}</h2>
            <p className="text-lg text-gray-600 mb-2">has successfully completed the course</p>
            <h3 className="text-xl font-bold mb-8">"{course.title}"</h3>
            <p className="text-lg text-gray-600 mb-8">
              on {formatDate(completionDate || new Date().toISOString())}
            </p>
            <div className="flex justify-between items-end mt-12">
              <div className="text-left">
                {certificateId && (
                  <p className="text-sm text-gray-500">Certificate ID: {certificateId}</p>
                )}
              </div>
              <div className="text-right">
                <div className="border-t border-gray-400 pt-2 w-48">
                  <p className="font-serif">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button onClick={downloadAsPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
            <Button
              variant="outline"
              onClick={shareCertificate}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
