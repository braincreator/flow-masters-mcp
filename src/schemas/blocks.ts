import { z, type ZodDiscriminatedUnionOption } from 'zod';

export const textBlockSchema = z.object({
  blockType: z.literal('textBlock'),
  content: z.any(),
});

export const imageBlockSchema = z.object({
  blockType: z.literal('imageBlock'),
  imageUrl: z.string().url().optional(),
  image: z.string().optional(),
  caption: z.string().optional(),
});

export const codeBlockSchema = z.object({
  blockType: z.literal('codeBlock'),
  language: z.string().optional().default('none'),
  code: z.string().min(1),
});

export const contentBlockSchema = z.discriminatedUnion('blockType', [
  textBlockSchema,
  imageBlockSchema,
  codeBlockSchema,
]).refine((data) => {
  if (data.blockType === 'imageBlock') {
    return data.imageUrl || data.image;
  }
  return true; // No additional validation for other block types
}, {
  message: 'Image block must have either imageUrl or image ID',
});