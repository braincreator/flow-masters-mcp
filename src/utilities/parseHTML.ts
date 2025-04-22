/**
 * Утилита для парсинга HTML и извлечения структурированных данных
 */

import { JSDOM } from 'jsdom'

/**
 * Парсит HTML и извлекает структурированные данные для создания блоков в CMS
 */
export function parseHTML(html: string): any {
  try {
    const dom = new JSDOM(html)
    const document = dom.window.document

    // Извлекаем заголовок страницы
    const title = document.querySelector('title')?.textContent || document.querySelector('h1')?.textContent || ''

    // Создаем массив для блоков
    const layout = []

    // Извлекаем Hero секцию
    const heroSection = document.querySelector('header, .hero, section:first-of-type')
    if (heroSection) {
      const heroHeading = heroSection.querySelector('h1, h2')?.textContent || title
      const heroSubheading = heroSection.querySelector('p, h3')?.textContent || ''
      const ctaButton = heroSection.querySelector('a.button, a.btn, button')
      const ctaText = ctaButton?.textContent || 'Learn More'

      layout.push({
        blockType: 'hero',
        blockName: 'Hero Section',
        heading: heroHeading,
        subheading: heroSubheading,
        ctaText: ctaText,
      })
    }

    // Извлекаем секции с фичами
    const featuresSection = document.querySelector('.features, section:nth-of-type(2)')
    if (featuresSection) {
      const featuresHeading = featuresSection.querySelector('h2, h3')?.textContent || 'Features'
      const featureElements = featuresSection.querySelectorAll('.feature, li, .card')
      
      const features = []
      featureElements.forEach((featureElement) => {
        const featureTitle = featureElement.querySelector('h3, h4, strong')?.textContent || ''
        const featureDescription = featureElement.querySelector('p')?.textContent || ''
        
        if (featureTitle || featureDescription) {
          features.push({
            title: featureTitle,
            description: featureDescription,
          })
        }
      })

      if (features.length > 0) {
        layout.push({
          blockType: 'features',
          blockName: 'Features Section',
          heading: featuresHeading,
          features: features,
        })
      }
    }

    // Извлекаем основной контент
    const contentSections = document.querySelectorAll('section:not(:first-of-type):not(:last-of-type)')
    contentSections.forEach((section, index) => {
      if (!section.classList.contains('features') && section !== featuresSection) {
        const contentHeading = section.querySelector('h2, h3')?.textContent || ''
        const contentParagraphs = section.querySelectorAll('p')
        let contentText = ''
        
        contentParagraphs.forEach((p) => {
          contentText += p.textContent + '\n\n'
        })

        if (contentText) {
          layout.push({
            blockType: 'content',
            blockName: `Content Section ${index + 1}`,
            heading: contentHeading,
            columns: [
              {
                size: 'full',
                richText: {
                  root: {
                    children: [
                      {
                        children: [
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: contentText.trim(),
                            type: 'text',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1,
                  },
                },
              },
            ],
          })
        }
      }
    })

    // Извлекаем Call to Action
    const ctaSection = document.querySelector('section:last-of-type, .cta')
    if (ctaSection) {
      const ctaHeading = ctaSection.querySelector('h2, h3')?.textContent || 'Get Started Now'
      const ctaText = ctaSection.querySelector('p')?.textContent || ''
      const ctaButtonText = ctaSection.querySelector('a.button, a.btn, button')?.textContent || 'Sign Up'

      layout.push({
        blockType: 'callToAction',
        blockName: 'Call to Action',
        richText: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: ctaHeading,
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'heading',
                version: 1,
                tag: 'h2',
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: ctaText,
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        actions: [
          {
            label: ctaButtonText,
            type: 'custom',
            url: '#',
            appearance: 'primary',
          },
        ],
      })
    }

    return {
      title,
      layout,
    }
  } catch (error) {
    console.error('Error parsing HTML:', error)
    return {
      title: 'Generated Landing Page',
      layout: [],
    }
  }
}
