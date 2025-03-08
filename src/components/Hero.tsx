'use client'

import RichText from '@/components/RichText/index'

export function Hero({ title, content }: { title: string; content: any }) {
  return (
    <section className="relative py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">{title}</h1>
          <div className="prose prose-lg mx-auto">
            <RichText data={content} />
          </div>
        </div>
      </div>
    </section>
  )
}
