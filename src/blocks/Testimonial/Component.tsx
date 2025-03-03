import React from 'react';

import Image from 'next/image';

export type TestimonialBlock = {
  testimonials: {
    author: string;
    authorTitle?: string;
    quote: string;
    avatar?: {
      url: string;
    };
  }[];
};

interface TestimonialProps {
  testimonials: {
    author: string;
    authorTitle?: string;
    quote: string;
    avatar?: {
      url: string;
    };
  }[];
}

export const TestimonialComponent: React.FC<TestimonialProps> = ({ testimonials }) => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials?.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                {testimonial.avatar && typeof testimonial.avatar === 'object' && (
                  <Image
                    src={testimonial.avatar.url}
                    alt={testimonial.author}
                    width={64}
                    height={64}
                    className="rounded-full mr-4"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{testimonial.author}</h3>
                  {testimonial.authorTitle && (
                    <p className="text-sm text-gray-600">{testimonial.authorTitle}</p>
                  )}
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};