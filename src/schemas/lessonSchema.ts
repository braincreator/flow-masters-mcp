import { z } from 'zod'
import { contentBlockSchema } from './blocks'

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