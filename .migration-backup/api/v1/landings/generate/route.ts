import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import JSON5 from 'json5'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function POST(req: NextRequest) {
  try {
    const { focus, utp, llmProvider, llmModel, apiKey: userApiKey } = await req.json()

    logDebug('Received data:', { focus, utp, llmProvider, llmModel, hasApiKey: !!userApiKey })

    // Используем API ключ, который пользователь ввел или сохранил, или из переменных окружения
    let apiKey = userApiKey || process.env.OPENAI_API_KEY

    // Если пользователь выбрал DeepSeek, но не предоставил API ключ, пробуем использовать ключ из переменных окружения
    if (llmProvider === 'deepseek' && !userApiKey) {
      apiKey = process.env.DEEPSEEK_API_KEY || apiKey
    } else if (llmProvider === 'google' && !userApiKey) {
      // Если пользователь выбрал Google, но не предоставил API ключ, пробуем использовать ключ из переменных окружения
      apiKey = process.env.GOOGLE_API_KEY || apiKey
    }

    if (!apiKey) {
      throw new Error(
        'API key is required. Please provide an API key or set it in the environment variables.',
      )
    }

    const temperature = 0.7

    const systemPrompt = `You are a landing page expert. Generate a landing page with a clear call to action, compelling headline, and persuasive copy. Focus on ${focus} and incorporate the following unique selling proposition: ${utp}. The response should be in HTML format.`
    
    let response;
    let client;
    
    if (llmProvider === 'google') {
      try {
        // Для Google используем Google Generative AI SDK
        const { GoogleGenerativeAI } = await import('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: llmModel })
        
        // Создаем запрос к Google API
        const prompt = `${systemPrompt}\n\nGenerate the landing page HTML.`
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        
        // Формируем ответ в формате, совместимом с OpenAI
        response = {
          choices: [
            {
              message: {
                content: text
              }
            }
          ]
        }
        
        // Возвращаемся из функции, чтобы не выполнять код ниже
        const landingPageContent = text
        if (!landingPageContent) {
          throw new Error(`Не удалось получить ответ от ${llmProvider}`)
        }
        
        const landingPageData = {
          title: 'Generated Landing Page',
          focus,
          utp,
          content: landingPageContent,
        }
        
        return NextResponse.json({ success: true, data: landingPageData })
      } catch (googleError) {
        logError('Google API error:', googleError)
        throw new Error(`Google API error: ${googleError instanceof Error ? googleError.message : String(googleError)}`)
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

    try {
      const openai = client as OpenAI
      response = await openai.chat.completions.create({
        model: llmModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the landing page HTML.' },
        ],
        temperature,
        max_tokens: 4000,
        // response_format: { type: 'json_object' }, // Removed JSON format
      })
    } catch (openaiError) {
      logError('OpenAI API error:', openaiError)
      throw new Error(
        `OpenAI API error: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`,
      )
    }

    const landingPageContent = response.choices[0]?.message?.content
    if (!landingPageContent) {
      throw new Error(`Не удалось получить ответ от ${llmProvider}`)
    }

    const landingPageData = {
      title: 'Generated Landing Page',
      focus,
      utp,
      content: landingPageContent,
    }

    return NextResponse.json({ success: true, data: landingPageData })
  } catch (error) {
    logError('Error generating landing page:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
