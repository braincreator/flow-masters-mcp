import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { ModalLeadForm } from '../home/components/ModalLeadForm'
import { ContactForm } from '@/components/contact/ContactForm'
import { Newsletter } from '@/blocks/Newsletter/Component'
import { Button } from '@/components/ui/button'

interface TestFormsPageProps {
  params: {
    lang: string
  }
}

export default function TestFormsPage({ params: { lang } }: TestFormsPageProps) {
  setRequestLocale(lang)

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Forms Internationalization Test</h1>
        <p className="text-muted-foreground">
          Testing all forms with next-intl translations (Language: {lang})
        </p>
      </div>

      {/* Modal Lead Form Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Modal Lead Form</h2>
        <div className="p-6 border rounded-lg">
          <TestModalForm />
        </div>
      </section>

      {/* Contact Form Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Contact Form</h2>
        <div className="p-6 border rounded-lg max-w-2xl">
          <ContactForm />
        </div>
      </section>

      {/* Newsletter Form Test */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Newsletter Form</h2>
        <div className="p-6 border rounded-lg">
          <Newsletter
            heading="Test Newsletter"
            description={[
              {
                children: [
                  {
                    text: 'This is a test newsletter component with internationalization.',
                  },
                ],
              },
            ]}
            forceShow={true}
          />
        </div>
      </section>
    </div>
  )
}

function TestModalForm() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal Lead Form</Button>
      <ModalLeadForm
        open={isOpen}
        onClose={() => setIsOpen(false)}
        actionType="default"
      />
    </>
  )
}
