import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getPayloadClient } from '@/utilities/payload'
import { slugify } from '@/utilities/strings'
import { parseHTML } from '@/utilities/parseHTML'

// Интерфейс для параметров запроса
interface GenerateLandingParams {
  focus: string
  utp: string
  title?: string
  slug?: string
  llmProvider: string
  llmModel: string
  apiKey?: string
}

// Функция для генерации системного промпта
function generateSystemPrompt(params: GenerateLandingParams): string {
  return `
You are a landing page expert. I need you to create a landing page structure for a CMS using blocks.

Focus: ${params.focus}
Unique Selling Proposition: ${params.utp}

Create a landing page with the following blocks:
1. Hero block with a compelling headline and subheading
2. Features block highlighting 3-5 key benefits
3. Content block with persuasive copy about the offering
4. Call to Action block to convert visitors
5. Optional: Testimonials or social proof if relevant

For each block, provide the necessary fields in a structured JSON format. Do not include HTML, only the structured data for the CMS.

IMPORTANT: Follow these specific requirements for each block type:

1. For "hero" blocks:
   - Use blockType: "hero"
   - Include type: "highImpact" or "mediumImpact" or "lowImpact"
   - Include richText with proper structure

2. For "content" blocks:
   - Use blockType: "content"
   - Include columns array with at least one item
   - Each column must have size ("full", "half", "oneThird", or "twoThirds")
   - Each column must have richText with proper structure

3. For "mediaBlock" blocks:
   - Use blockType: "mediaBlock"
   - Do NOT include a media field as it requires an upload ID that will be added later

4. For "callToAction" blocks:
   - Use blockType: "callToAction"
   - Include richText with proper structure
   - Include actions array with at least one item
   - Each action must have label, type, url, and appearance

The response should be a valid JSON object with the following structure:
{
  "title": "Landing page title",
  "slug": "landing-page-slug",
  "layout": [
    {
      "blockType": "hero",
      "blockName": "Hero Section",
      "type": "highImpact",
      "richText": {
        "root": {
          "children": [
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Main headline",
                  "type": "text",
                  "version": 1
                }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "heading",
              "version": 1,
              "tag": "h1"
            },
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Supporting subheading",
                  "type": "text",
                  "version": 1
                }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "paragraph",
              "version": 1
            }
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1
        }
      }
    },
    {
      "blockType": "content",
      "blockName": "Content Section",
      "heading": "About Our Offering",
      "columns": [
        {
          "size": "full",
          "richText": {
            "root": {
              "children": [
                {
                  "children": [
                    {
                      "detail": 0,
                      "format": 0,
                      "mode": "normal",
                      "style": "",
                      "text": "Detailed description of the offering",
                      "type": "text",
                      "version": 1
                    }
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "type": "paragraph",
                  "version": 1
                }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "root",
              "version": 1
            }
          }
        }
      ]
    },
    {
      "blockType": "callToAction",
      "blockName": "Call to Action",
      "richText": {
        "root": {
          "children": [
            {
              "children": [
                {
                  "detail": 0,
                  "format": 0,
                  "mode": "normal",
                  "style": "",
                  "text": "Ready to get started?",
                  "type": "text",
                  "version": 1
                }
              ],
              "direction": "ltr",
              "format": "",
              "indent": 0,
              "type": "heading",
              "version": 1,
              "tag": "h2"
            }
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1
        }
      },
      "actions": [
        {
          "label": "Contact Us",
          "type": "custom",
          "url": "#",
          "appearance": "primary"
        }
      ]
    }
  ]
}
`
}

export async function POST(req: NextRequest) {
  try {
    const params = (await req.json()) as GenerateLandingParams
    const { focus, utp, title, slug, llmProvider, llmModel, apiKey: userApiKey } = params

    console.log('Received data:', {
      focus,
      utp,
      title,
      slug,
      llmProvider,
      llmModel,
      hasApiKey: !!userApiKey,
    })

    // Используем API ключ, который пользователь ввел или сохранил, или из переменных окружения
    let apiKey = userApiKey || process.env.OPENAI_API_KEY

    // Если пользователь выбрал DeepSeek или Google, но не предоставил API ключ, пробуем использовать ключ из переменных окружения
    if (llmProvider === 'deepseek' && !userApiKey) {
      apiKey = process.env.DEEPSEEK_API_KEY || apiKey
    } else if (llmProvider === 'google' && !userApiKey) {
      apiKey = process.env.GOOGLE_API_KEY || apiKey
    }

    if (!apiKey) {
      throw new Error(
        'API key is required. Please provide an API key or set it in the environment variables.',
      )
    }

    const temperature = 0.7
    const systemPrompt = generateSystemPrompt(params)

    let response
    let client

    if (llmProvider === 'google') {
      try {
        // Для Google используем Google Generative AI SDK
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: llmModel })

        // Создаем запрос к Google API
        const prompt = `${systemPrompt}\n\nGenerate the landing page structure in JSON format.`
        const result = await model.generateContent(prompt)
        const text = result.response.text()

        // Формируем ответ в формате, совместимом с OpenAI
        response = {
          choices: [
            {
              message: {
                content: text,
              },
            },
          ],
        }
      } catch (googleError) {
        console.error('Google API error:', googleError)
        throw new Error(
          `Google API error: ${googleError instanceof Error ? googleError.message : String(googleError)}`,
        )
      }
    } else if (llmProvider === 'deepseek') {
      // Use OpenAI client for DeepSeek with base URL for DeepSeek API
      client = new OpenAI({
        apiKey,
        baseURL: 'https://api.deepseek.com/v1', // DeepSeek API endpoint
      })
    } else {
      // Default to OpenAI
      client = new OpenAI({ apiKey })
    }

    // Если response еще не определен (не Google), используем OpenAI API
    if (!response) {
      try {
        const openai = client as OpenAI
        response = await openai.chat.completions.create({
          model: llmModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Generate the landing page structure in JSON format.' },
          ],
          temperature,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        })
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        throw new Error(
          `OpenAI API error: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`,
        )
      }
    }

    const landingPageContent = response.choices[0]?.message?.content
    if (!landingPageContent) {
      throw new Error(`Не удалось получить ответ от ${llmProvider}`)
    }

    // Парсим JSON ответ
    console.log('Raw response content:', landingPageContent.substring(0, 200) + '...')

    // Проверяем, не является ли ответ HTML документом
    if (
      landingPageContent.trim().startsWith('<!DOCTYPE') ||
      landingPageContent.trim().startsWith('<html')
    ) {
      console.error('Received HTML instead of JSON')
      throw new Error(
        'Получен HTML вместо JSON. Пожалуйста, попробуйте еще раз или выберите другую модель.',
      )
    }

    // Ищем JSON в ответе, если он может быть обернут в другой текст
    let jsonContent = landingPageContent
    const jsonMatch = landingPageContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonContent = jsonMatch[0]
      console.log('Extracted JSON content:', jsonContent.substring(0, 200) + '...')
    }

    let landingData
    try {
      landingData = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError)
      // Пытаемся исправить JSON и распарсить снова
      try {
        // Удаляем комментарии и исправляем распространенные ошибки в JSON
        const fixedJson = jsonContent
          .replace(/\/\/.*$/gm, '') // Удаляем однострочные комментарии
          .replace(/\/\*[\s\S]*?\*\//g, '') // Удаляем многострочные комментарии
          .replace(/,\s*}/g, '}') // Удаляем запятые перед закрывающими скобками
          .replace(/,\s*]/g, ']') // Удаляем запятые перед закрывающими квадратными скобками
          .replace(/(['"](\w+)['"]\s*:\s*['"]([^'"]*))(?=[,}])/g, '$1"') // Добавляем закрывающие кавычки, если они отсутствуют
          .replace(/\\/g, '\\\\') // Экранируем обратные слеши
          .replace(/\n/g, '\\n') // Экранируем переносы строк

        console.log('Fixed JSON:', fixedJson.substring(0, 200) + '...')
        landingData = JSON.parse(fixedJson)
      } catch (fixError) {
        console.error('Error parsing fixed JSON:', fixError)

        // Если не удалось парсить JSON, создаем базовую структуру
        landingData = {
          title: title || `${focus} Landing Page`,
          layout: [
            {
              blockType: 'hero',
              blockName: 'Hero Section',
              heading: `${focus} Landing Page`,
              subheading: utp || 'Learn more about our offering',
              ctaText: 'Get Started',
            },
            {
              blockType: 'content',
              blockName: 'Content Section',
              heading: 'About Us',
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
                              text: 'We could not generate custom content. This is a default landing page.',
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
            },
            {
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
                          text: 'Ready to get started?',
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
                  label: 'Contact Us',
                  type: 'custom',
                  url: '#',
                  appearance: 'primary',
                },
              ],
            },
          ],
        }

        console.log('Using default landing structure')
      }
    }

    // Получаем клиент Payload CMS
    const payload = await getPayloadClient()

    // Формируем slug, если он не указан
    const pageSlug = slug || landingData.slug || slugify(landingData.title || `${focus}-landing`)

    // Проверяем, существует ли страница с таким slug
    const existingPages = await payload.find({
      collection: 'pages',
      where: {
        slug: {
          equals: pageSlug,
        },
      },
    })

    if (existingPages.docs.length > 0) {
      throw new Error(`Страница с slug "${pageSlug}" уже существует`)
    }

    // Создаем страницу в CMS
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: landingData.title || title || `${focus} Landing Page`,
        slug: pageSlug,
        layout: landingData.layout || [],
        meta: {
          title: landingData.title || title || `${focus} Landing Page`,
          description: utp,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        page,
        landingData,
      },
    })
  } catch (error) {
    console.error('Error generating landing page:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
