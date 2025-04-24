'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Loader2, CheckCircle, Award, ArrowRight } from 'lucide-react'
import { CourseCertificate } from './CourseCertificate'
import confetti from 'canvas-confetti'

// Function to generate certificate
const generateCertificate = async (userId: string, courseId: string) => {
  try {
    const response = await fetch('/api/v1/courses/certificates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        courseId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate certificate')
    }

    const data = await response.json()
    return data.certificate
  } catch (error) {
    console.error('Error generating certificate:', error)
    throw error
  }
}

interface CourseCompletePageProps {
  course: any
  locale: string
}

export function CourseCompletePage({ course, locale }: CourseCompletePageProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [accessLoading, setAccessLoading] = useState(true)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [certificate, setCertificate] = useState<any>(null)
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false)
  const [relatedCourses, setRelatedCourses] = useState<any[]>([])
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)

  // Function to handle certificate generation
  const handleGenerateCertificate = async () => {
    if (!user) return

    try {
      setIsGeneratingCertificate(true)
      
      const newCertificate = await generateCertificate(user.id, course.id)
      setCertificate(newCertificate)
      
      // Trigger confetti when certificate is generated
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      setTimeout(() => clearInterval(interval), duration)
    } catch (error) {
      console.error('Error generating certificate:', error)
    } finally {
      setIsGeneratingCertificate(false)
    }
  }

  // Trigger confetti on component mount if certificate exists
  useEffect(() => {
    if (certificate) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [certificate])

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) return

      try {
        setAccessLoading(true)
        
        // Check if user has access to this course
        const response = await fetch('/api/v1/courses/access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            courseId: course.id,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to check course access')
        }

        const data = await response.json()
        setHasAccess(data.hasAccess)

        // If user has access, get their enrollment
        if (data.hasAccess) {
          const enrollmentResponse = await fetch(`/api/v1/courses/enrollment?userId=${user.id}&courseId=${course.id}`)
          
          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json()
            if (enrollmentData.enrollment) {
              setEnrollment(enrollmentData.enrollment)
              
              // If progress is not 100%, update it to 100%
              if (enrollmentData.enrollment.progress < 100) {
                await fetch('/api/v1/courses/enrollment', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: user.id,
                    courseId: course.id,
                    progress: 100,
                  }),
                })
              }
              
              // Check if user already has a certificate
              const certificatesResponse = await fetch(`/api/v1/courses/certificates?userId=${user.id}`)
              
              if (certificatesResponse.ok) {
                const certificatesData = await certificatesResponse.json()
                const courseCertificate = certificatesData.certificates.find(
                  (cert: any) => cert.course === course.id
                )
                
                if (courseCertificate) {
                  setCertificate(courseCertificate)
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking course access:', error)
        setHasAccess(false)
      } finally {
        setAccessLoading(false)
      }
    }

    if (user && course) {
      checkAccess()
    }
  }, [user, course])

  // Load related courses
  useEffect(() => {
    const loadRelatedCourses = async () => {
      try {
        setIsLoadingRelated(true)
        
        // In a real app, this would be an API call to get related courses
        // For now, we'll just simulate it with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for related courses
        setRelatedCourses([
          {
            id: 'course1',
            title: 'Advanced ' + course.title,
            slug: 'advanced-' + course.slug,
            featuredImage: course.featuredImage,
            excerpt: 'Take your skills to the next level with our advanced course.',
          },
          {
            id: 'course2',
            title: 'Related Skills Masterclass',
            slug: 'related-skills-masterclass',
            excerpt: 'Expand your knowledge with complementary skills.',
          },
        ])
      } catch (error) {
        console.error('Error loading related courses:', error)
      } finally {
        setIsLoadingRelated(false)
      }
    }
    
    loadRelatedCourses()
  }, [course])

  if (isLoading || accessLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="mb-6">Please log in to access your certificate.</p>
          <Button onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)}>
            Log In
          </Button>
        </div>
      </div>
    )
  }

  if (hasAccess === false) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="mb-6">
            You need to complete the course to access this page.
          </p>
          <Button onClick={() => router.push(`/courses/${course.slug}/learn`)}>
            Go to Course
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Congratulations, {user.name}!</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          You've successfully completed the <strong>{course.title}</strong> course.
          {certificate ? " Here's your certificate of completion." : ""}
        </p>
      </div>

      <div className="mb-16">
        {isGeneratingCertificate ? (
          <Card className="p-12 text-center">
            <CardContent className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg">Generating your certificate...</p>
            </CardContent>
          </Card>
        ) : certificate ? (
          <CourseCertificate 
            course={course} 
            completionDate={certificate.completionDate} 
            certificateId={certificate.certificateId}
          />
        ) : (
          <Card className="p-12 text-center">
            <CardContent className="flex flex-col items-center justify-center">
              <Award className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-4">Your Certificate is Ready!</h2>
              <p className="text-gray-600 mb-6">
                Click the button below to generate your certificate of completion.
              </p>
              <Button onClick={() => handleGenerateCertificate()} size="lg">
                Generate Certificate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">What's Next?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Share Your Achievement
            </h3>
            <p className="text-gray-600 mb-4">
              Let your network know about your new skills! Share your certificate on social media.
            </p>
            <Button variant="outline" className="w-full">
              Share on LinkedIn
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Continue Learning
            </h3>
            <p className="text-gray-600 mb-4">
              Ready to take your skills to the next level? Explore our related courses.
            </p>
            <Button className="w-full" onClick={() => router.push('/courses')}>
              Browse More Courses
            </Button>
          </div>
        </div>
      </div>

      {relatedCourses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">Recommended Courses</h2>
          
          {isLoadingRelated ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((relatedCourse) => (
                <div key={relatedCourse.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                  {relatedCourse.featuredImage && (
                    <div className="h-40 bg-gray-200 relative">
                      <img
                        src={relatedCourse.featuredImage.url}
                        alt={relatedCourse.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{relatedCourse.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{relatedCourse.excerpt}</p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/courses/${relatedCourse.slug}`)}
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
