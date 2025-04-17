declare module 'deepseek' {
  class DeepSeek {
    constructor(apiKey: string)
    chat: {
      completions: {
        create(options: {
          model: string
          messages: Array<{role: string, content: string}>
          temperature?: number
          max_tokens?: number
          response_format?: {type: string}
        }): Promise<{
          choices: Array<{
            message: {
              content: string
            }
          }>
        }>
      }
    }
  }
  export = DeepSeek
}