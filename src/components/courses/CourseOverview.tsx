'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, BookOpen, Award, User } from 'lucide-react'

interface CourseOverviewProps {
  course: any
}

export function CourseOverview({ course }: CourseOverviewProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 hover:bg-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    advanced: 'bg-red-100 text-red-800 hover:bg-red-200',
  }

  const difficultyLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Overview of the course details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>Duration: {course.estimatedDuration || 'Self-paced'}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <span>
                Difficulty:{' '}
                {course.difficulty ? (
                  <Badge
                    className={
                      difficultyColors[course.difficulty as keyof typeof difficultyColors] ||
                      'bg-gray-100'
                    }
                  >
                    {difficultyLabels[course.difficulty as keyof typeof difficultyLabels] ||
                      course.difficulty}
                  </Badge>
                ) : (
                  'Not specified'
                )}
              </span>
            </div>
            {course.author && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <span>Instructor: {course.author.name || 'Unknown'}</span>
              </div>
            )}
            {course.tags && course.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-500">Tags:</span>
                {course.tags.map((tag: any) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.title}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {course.description && (
        <Card>
          <CardHeader>
            <CardTitle>About This Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </CardContent>
        </Card>
      )}

      {course.learningOutcomes && course.learningOutcomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.learningOutcomes.map((outcome: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <span>{outcome.outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {course.requirements && course.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.requirements.map((requirement: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span>• {requirement.requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
