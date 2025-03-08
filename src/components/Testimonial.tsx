'use client'

export function Testimonial() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">What Our Clients Say</h2>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-lg">
              &ldquo;Flow Masters has transformed our business operations. Their solutions are
              innovative and efficient.&rdquo;
            </div>
            <div className="font-semibold">John Doe</div>
            <div className="text-gray-600">CEO, Tech Corp</div>
          </div>
        </div>
      </div>
    </section>
  )
}
