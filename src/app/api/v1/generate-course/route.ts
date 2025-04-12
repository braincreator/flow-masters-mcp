import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { Payload } from 'payload/types'
import configPromise from '@payload-config'
import type { Lesson, Media } from '@/payload-types' // Import generated types
import { z } from 'zod' // Import Zod
import { Buffer } from 'buffer' // Needed for image handling
import path from 'path'
import { v4 as uuidv4 } from 'uuid' // For generating unique filenames
import { ClientSession } from 'mongoose' // Import Mongoose session type

// --- Zod Schema Definition ---

const textBlockSchema = z.object({
  blockType: z.literal('textBlock'),
  content: z.any(), // Lexical content can be complex, use 'any' or a more specific schema if possible
})

const imageBlockSchema = z
  .object({
    blockType: z.literal('imageBlock'),
    imageUrl: z.string().url().optional(), // Expect URL initially
    image: z.string().optional(), // Will hold the Media ID after upload
    caption: z.string().optional(),
  })
  .refine((data) => data.imageUrl || data.image, {
    message: 'Image block must have either imageUrl or image ID',
  })

// Add schema for CodeBlock
const codeBlockSchema = z.object({
  blockType: z.literal('codeBlock'),
  language: z.string().optional().default('none'), // Match field definition
  code: z.string().min(1),
})

// Union of all allowed block types
const contentBlockSchema = z.discriminatedUnion('blockType', [
  textBlockSchema,
  imageBlockSchema,
  codeBlockSchema, // Added CodeBlock schema
  // Add other block schemas here (e.g., codeBlockSchema)
])

const lessonSchema = z
  .object({
    title: z.string().min(1),
    lessonType: z.enum(['standard', 'video', 'quiz']), // Keep enum updated
    order: z.number(),
    contentLayout: z.array(contentBlockSchema).optional(), // Optional for non-standard types
    videoUrl: z.string().url().optional(),
    // quizData: z.any().optional(),
  })
  .refine(
    (data) => {
      if (
        data.lessonType === 'standard' &&
        (!data.contentLayout || data.contentLayout.length === 0)
      )
        return false
      if (data.lessonType === 'video' && !data.videoUrl) return false
      // Add validation for other types like 'quiz'
      return true
    },
    {
      message: 'Mismatch between lessonType and provided content fields (contentLayout/videoUrl)',
    },
  )

const moduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number(),
  lessons: z.array(lessonSchema).min(1), // Require at least one lesson per module
})

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
})

const courseGenerationPayloadSchema = z.object({
  course: courseSchema,
  modules: z.array(moduleSchema).min(1), // Require at least one module
})

// Type inferred from the schema
type CourseGenerationPayload = z.infer<typeof courseGenerationPayloadSchema>
type ImageBlockData = z.infer<typeof imageBlockSchema>

// --- Helper Function for Image Upload ---
// Pass session for transactional media creation
async function uploadImageFromUrl(
  payload: Payload,
  imageUrl: string,
  altText: string = 'Generated image',
  session?: ClientSession, // Added session parameter
): Promise<string | null> {
  try {
    console.log(`Fetching image from URL: ${imageUrl}`)
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const buffer = Buffer.from(await response.arrayBuffer())

    // Generate a unique filename
    const originalFilename = path.basename(new URL(imageUrl).pathname)
    const extension = path.extname(originalFilename) || '.jpg' // Default extension
    const filename = `${uuidv4()}${extension}`

    console.log(
      `Uploading image to Payload Media collection. Filename: ${filename}, Type: ${contentType}`,
    )

    const mediaDoc = await payload.create<Media>({
      collection: 'media',
      data: {
        alt: { en: altText }, // Assuming 'en' default locale for alt text, adjust as needed
      },
      file: {
        data: buffer,
        mimetype: contentType,
        name: filename,
        size: buffer.length,
      },
      overrideAccess: true, // Necessary if running without user context
      req: {
        // Pass session via req context
        transactionID: session ? session.id : undefined,
      } as any, // Cast needed as req type might not directly include transactionID
    })

    console.log(`Image uploaded successfully within transaction. Media ID: ${mediaDoc.id}`)
    return mediaDoc.id
  } catch (error) {
    console.error(`Error uploading image from URL ${imageUrl}:`, error)
    return null // Indicate failure
  }
}

// --- Payload Instance (Keep existing) ---
let payloadInstance: Payload | null = null
const getPayloadInstance = async (): Promise<Payload> => {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config: configPromise })
  }
  return payloadInstance
}

// --- POST Handler ---
export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/v1/generate-course')

  // --- API Key Authentication via Collection ---
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Missing or invalid Authorization header')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const providedKey = authHeader.substring(7) // Extract the key after "Bearer "

  const payload = await getPayloadInstance()

  try {
    console.log(
      `Attempting to authenticate with provided key prefix: ${providedKey.substring(0, 4)}...`,
    )
    const apiKeyQuery = await payload.find({
      collection: 'apiKeys',
      where: {
        key: { equals: providedKey },
        isEnabled: { equals: true },
      },
      limit: 1,
      depth: 0, // No need for relations here
    })

    if (apiKeyQuery.docs.length === 0) {
      console.warn('Provided API Key not found or not enabled in the collection.')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Key is valid and enabled
    const validApiKey = apiKeyQuery.docs[0]
    console.log(`API Key validation successful. Key Name: ${validApiKey.name}`)

    // Optional: Update lastUsed timestamp (consider performance implications)
    // payload.update({ collection: 'apiKeys', id: validApiKey.id, data: { lastUsed: new Date() }, overrideAccess: true });
  } catch (authError) {
    console.error('Error during API key authentication:', authError)
    return NextResponse.json(
      { error: 'Internal Server Error during authentication' },
      { status: 500 },
    )
  }
  // --- End API Key Authentication ---

  const locale = payload.config.localization?.defaultLocale || 'en'

  let session: ClientSession | null = null // Declare session variable

  try {
    const requestData = await request.json()
    console.log('Raw Request Body:', JSON.stringify(requestData, null, 2))

    // Validate input data using Zod
    const validationResult = courseGenerationPayloadSchema.safeParse(requestData)

    if (!validationResult.success) {
      console.error('Input validation failed:', validationResult.error.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const body: CourseGenerationPayload = validationResult.data
    console.log('Validated Request Body:', JSON.stringify(body, null, 2))

    // --- Idempotency Check ---
    const courseTitleToCheck = body.course.title
    console.log(`Checking for existing course with title: ${courseTitleToCheck}`)
    const existingCourses = await payload.find({
      collection: 'courses',
      where: {
        [`title.${locale}`]: { equals: courseTitleToCheck }, // Query by localized title
      },
      limit: 1,
      depth: 0, // No need for related data here
    })

    if (existingCourses.docs.length > 0) {
      const existingCourseId = existingCourses.docs[0].id
      console.log(
        `Course with title '${courseTitleToCheck}' already exists. ID: ${existingCourseId}. Skipping creation.`,
      )
      return NextResponse.json(
        { success: true, courseId: existingCourseId, message: 'Course already exists' },
        { status: 200 },
      ) // Return 200 OK
    }
    console.log(
      `No existing course found with title: ${courseTitleToCheck}. Proceeding with creation.`,
    )

    // --- Transaction Start ---
    session = await payload.db.startTransaction() // Start mongoose transaction
    console.log('Transaction started.')

    // Prepare request context with transaction ID for hooks/operations
    const reqWithTransaction = {
      transactionID: session.id,
    } as any // Cast needed as type might not include transactionID

    // --- Course Generation Logic (within transaction) ---

    // 1. Create the Course
    console.log('Creating course:', body.course.title)
    const newCourse = await payload.create({
      collection: 'courses',
      data: {
        title: { [locale]: body.course.title },
        description: body.course.description ? { [locale]: body.course.description } : undefined,
        status: body.course.status || 'draft',
      },
      overrideAccess: true, // May need override
      req: reqWithTransaction, // Pass session context
    })
    const courseId = newCourse.id
    console.log(`Course created with ID: ${courseId}`)

    const createdModuleIds: string[] = []

    // 2. Create Modules and their Lessons
    for (const moduleData of body.modules) {
      console.log(`Creating module: ${moduleData.title} for course ${courseId}`)

      const processedLessonsData = []
      for (const lessonData of moduleData.lessons) {
        const processedLesson = { ...lessonData } // Clone lesson data

        if (processedLesson.lessonType === 'standard' && processedLesson.contentLayout) {
          // Process blocks for image uploads
          for (let i = 0; i < processedLesson.contentLayout.length; i++) {
            const block = processedLesson.contentLayout[i]
            // Check if it's an image block with a URL
            if (block.blockType === 'imageBlock' && (block as ImageBlockData).imageUrl) {
              const imageUrl = (block as ImageBlockData).imageUrl!
              const altText = (block as ImageBlockData).caption || lessonData.title // Use caption or lesson title as alt
              console.log(`Processing image block with URL: ${imageUrl}`)
              // Pass session to image upload function
              const mediaId = await uploadImageFromUrl(payload, imageUrl, altText, session)

              if (mediaId) {
                // Replace imageUrl with the actual media ID
                ;(processedLesson.contentLayout[i] as ImageBlockData).image = mediaId
                delete (processedLesson.contentLayout[i] as any).imageUrl // Remove the temp URL field
                console.log(`Image block updated with Media ID: ${mediaId}`)
              } else {
                // Handle upload failure: skip block, throw error, etc.
                console.warn(
                  `Failed to upload image for lesson '${lessonData.title}'. Skipping image block.`,
                )
                // Optionally remove the block or handle differently
                processedLesson.contentLayout.splice(i, 1)
                i-- // Adjust index after removal
              }
            }
          }
        }
        processedLessonsData.push(processedLesson)
      }

      // Create the module first (without lessons initially)
      const newModule = await payload.create({
        collection: 'modules',
        data: {
          title: { [locale]: moduleData.title },
          description: moduleData.description ? { [locale]: moduleData.description } : undefined,
          order: moduleData.order,
          course: courseId,
        },
        overrideAccess: true,
        req: reqWithTransaction, // Pass session context
      })
      const moduleId = newModule.id
      console.log(`Module created with ID: ${moduleId}`)
      createdModuleIds.push(moduleId)

      const createdLessonIds: string[] = []

      // 3. Create Lessons for the current Module using processed data
      for (const lessonData of processedLessonsData) {
        console.log(`Creating lesson: ${lessonData.title} for module ${moduleId}`)

        const lessonPayload: Partial<Lesson> = {
          title: { [locale]: lessonData.title },
          module: moduleId,
          order: lessonData.order,
          lessonType: lessonData.lessonType,
        }

        if (lessonData.lessonType === 'standard' && lessonData.contentLayout) {
          lessonPayload.contentLayout = lessonData.contentLayout
        } else if (lessonData.lessonType === 'video' && lessonData.videoUrl) {
          lessonPayload.videoUrl = lessonData.videoUrl
        }

        const newLesson = await payload.create({
          collection: 'lessons',
          data: lessonPayload as Lesson,
          overrideAccess: true,
          req: reqWithTransaction, // Pass session context
        })
        console.log(`Lesson created with ID: ${newLesson.id}`)
        createdLessonIds.push(newLesson.id)
      }

      // 4. Update the created Module with its Lesson IDs
      console.log(`Updating module ${moduleId} with ${createdLessonIds.length} lessons.`)
      await payload.update({
        collection: 'modules',
        id: moduleId,
        data: {
          lessons: createdLessonIds,
        },
        overrideAccess: true,
        req: reqWithTransaction, // Pass session context
      })
    }

    // 5. Update the created Course with its Module IDs
    console.log(`Updating course ${courseId} with ${createdModuleIds.length} modules.`)
    await payload.update({
      collection: 'courses',
      id: courseId,
      data: {
        modules: createdModuleIds,
      },
      overrideAccess: true,
      req: reqWithTransaction, // Pass session context
    })

    // --- Transaction Commit ---
    await session.commitTransaction()
    console.log('Transaction committed successfully.')
    session.endSession()
    session = null // Clear session variable

    console.log(`Successfully generated course ${courseId} and all related content.`)

    return NextResponse.json({ success: true, courseId: courseId }, { status: 201 })
  } catch (error: unknown) {
    // --- Transaction Rollback --- Check if session exists and is active
    if (session && session.inTransaction()) {
      console.error('Error occurred during transaction. Aborting...')
      await session.abortTransaction()
      console.log('Transaction aborted.')
      session.endSession()
      session = null // Clear session variable
    }

    console.error('Error processing course generation request:', error)

    let errorMessage = 'Internal Server Error during course generation'
    let statusCode = 500

    if (error instanceof z.ZodError) {
      // Handle Zod errors specifically
      errorMessage = 'Invalid request data'
      statusCode = 400
      return NextResponse.json(
        { error: errorMessage, details: error.errors },
        { status: statusCode },
      )
    } else if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  } finally {
    // Ensure session is always ended if it exists and wasn't handled by commit/abort
    if (session) {
      session.endSession()
    }
  }
}
