import { z } from 'zod'

const textBlockSchema = z.object({
  blockType: z.literal('textBlock'),
  content: z.any(),
})

const imageBlockSchema = z.object({
  blockType: z.literal('imageBlock'),
  imageUrl: z.string().url().optional(),
  image: z.string().optional(),
  caption: z.string().optional(),
})
  .refine((data) => data.imageUrl || data.image, {
    message: 'Image block must have either imageUrl or image ID',
  })

const codeBlockSchema = z.object({
  blockType: z.literal('codeBlock'),
  language: z.string().optional().default('none'),
  code: z.string().min(1),
})

const contentBlockSchema = z.discriminatedUnion('blockType', [
  textBlockSchema,
  imageBlockSchema,
  codeBlockSchema,
])

export const lessonSchema = z.object({
  title: z.string().min(1),
  lessonType: z.enum(['standard', 'video', 'quiz']),
  order: z.number(),
  contentLayout: z.array(contentBlockSchema).optional(),
  videoUrl: z.string().url().optional(),
})
  .refine(
    (data) => {
      if (
        data.lessonType === 'standard' &&
        (!data.contentLayout || data.contentLayout.length === 0)
      )
        return false
      if (data.lessonType === 'video' && !data.videoUrl) return false
      return true
    },
    {
      message: 'Mismatch between lessonType and provided content fields (contentLayout/videoUrl)',
    },
  )

export type Lesson = z.infer<typeof lessonSchema>