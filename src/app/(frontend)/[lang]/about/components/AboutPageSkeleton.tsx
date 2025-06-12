import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function AboutPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[80vh] flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-6 w-2/3 mx-auto mb-8" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </section>

      {/* Mission Section Skeleton */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
            <Skeleton className="h-12 w-1/2 mx-auto mb-6" />
            <div className="bg-card/50 rounded-3xl p-8 md:p-12">
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-6 w-5/6 mb-4" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section Skeleton */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-1/3 mx-auto mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
                <Skeleton className="h-12 w-20 mx-auto mb-4" />
                <Skeleton className="h-6 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section Skeleton */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-1/3 mx-auto mb-16" />
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="flex justify-center lg:justify-start">
                <Skeleton className="w-48 h-48 rounded-full" />
              </div>
              <div className="lg:col-span-2 text-center lg:text-left">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-6 w-32 mb-8" />
                <div className="space-y-4 mb-8">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-9 w-24" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section Skeleton */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-1/3 mx-auto mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
                <Skeleton className="h-6 w-32 mx-auto mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mx-auto" />
                  <Skeleton className="h-4 w-4/5 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach Section Skeleton */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-1/3 mx-auto mb-16" />
          <div className="max-w-4xl mx-auto space-y-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`flex items-center gap-8 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}>
                <div className="flex-1">
                  <div className="bg-card/50 rounded-2xl p-8">
                    <Skeleton className="h-8 w-48 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                </div>
                <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-card/50 rounded-3xl p-8 md:p-12">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
              <Skeleton className="h-12 w-2/3 mx-auto mb-6" />
              <Skeleton className="h-6 w-1/2 mx-auto mb-10" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-6 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
