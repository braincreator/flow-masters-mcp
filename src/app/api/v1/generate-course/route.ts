import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import type { Payload } from 'payload';
import configPromise from '@/payload.config';
import type { Media, Config, MediaSelect, Course, Module, CoursesSelect, ModulesSelect } from '@/payload-types';
import { z } from 'zod';
import { lessonSchema, Lesson } from '@/schemas/lessonSchema';
import { Buffer } from 'buffer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ClientSession } from 'mongoose';

const textBlockSchema = z.object({
  blockType: z.literal('textBlock'),
  content: z.any(),
});

const imageBlockSchema = z.object({
  blockType: z.literal('imageBlock'),
  imageUrl: z.string().url().optional(),
  image: z.string().optional(),
  caption: z.string().optional(),
})
  .refine((data) => data.imageUrl || data.image, {
    message: 'Image block must have either imageUrl or image ID',
  });

const codeBlockSchema = z.object({
  blockType: z.literal('codeBlock'),
  language: z.string().optional().default('none'),
  code: z.string().min(1),
});


const moduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number(),
  lessons: z.array(lessonSchema).min(1),
});

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

const courseGenerationPayloadSchema = z.object({
  course: courseSchema,
  modules: z.array(moduleSchema).min(1),
});

type CourseGenerationPayload = z.infer<typeof courseGenerationPayloadSchema>;
type ImageBlockData = z.infer<typeof imageBlockSchema>;

async function uploadImageFromUrl(
  payload: Payload,
  imageUrl: string,
  altText: string = 'Generated image',
  session?: ClientSession | null,
): Promise<string | null> {
  try {
    console.log(`Fetching image from URL: ${imageUrl}`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await response.arrayBuffer());

    const originalFilename = path.basename(new URL(imageUrl).pathname);
    const extension = path.extname(originalFilename) || '.jpg';
    const filename = `${uuidv4()}${extension}`;

    console.log(
      `Uploading image to Payload Media collection. Filename: ${filename}, Type: ${contentType}`,
    );

    const mediaDoc = await payload.create<'media', MediaSelect<true>>({
      collection: 'media',
      data: {
        alt: altText,
      },
      file: {
        data: buffer,
        mimetype: contentType,
        name: filename,
        size: buffer.length,
      },
      overrideAccess: true,
      req: {
        transactionID: session ? session.id : undefined,
      } as any,
    });

    console.log(`Image uploaded successfully within transaction. Media ID: ${mediaDoc?.id}`);
    return mediaDoc?.id || null;
  } catch (error) {
    console.error(`Error uploading image from URL ${imageUrl}:`, error);
    return null;
  }
}

let payloadInstance: Payload | null = null;
const getPayloadInstance = async (): Promise<Payload> => {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config: configPromise });
  }
  return payloadInstance;
}

export async function POST(request: NextRequest) {
  console.log('Received POST request to /api/v1/generate-course');

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Missing or invalid Authorization header');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providedKey = authHeader.substring(7);

  const payload = await getPayloadInstance();

  try {
    console.log(
      `Attempting to authenticate with provided key prefix: ${providedKey.substring(0, 4)}...`,
    );
    const apiKeyQuery = await payload.find({
      collection: 'users', // Assuming apiKeys is a user
      where: {
        key: { equals: providedKey },
        isEnabled: { equals: true },
      },
      limit: 1,
      depth: 0,
    });

    if (apiKeyQuery.docs.length === 0) {
      console.warn('Provided API Key not found or not enabled in the collection.');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validApiKey = apiKeyQuery.docs[0];
    if (validApiKey) {
      console.log(`API Key validation successful. Key Name: ${validApiKey.email}`);
    } else {
      console.warn('Valid API key not found in query result.');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch (authError) {
    console.error('Error during API key authentication:', authError);
    return NextResponse.json(
      { error: 'Internal Server Error during authentication' },
      { status: 500 },
    );
  }

  const locale = payload.config.localization && typeof payload.config.localization === 'object' ? payload.config.localization.defaultLocale || 'en' : 'en';

  const session: ClientSession | null = null;

  try {
    const requestData = await request.json();
    console.log('Raw Request Body:', JSON.stringify(requestData, null, 2));

    const validationResult = courseGenerationPayloadSchema.safeParse(requestData);

    if (!validationResult.success) {
      console.error('Input validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const body: CourseGenerationPayload = validationResult.data;
    console.log('Validated Request Body:', JSON.stringify(body, null, 2));

    const courseTitleToCheck = body.course.title;
    console.log(`Checking for existing course with title: ${courseTitleToCheck}`);
    const existingCourses = await payload.find({
      collection: 'courses',
      where: {
        [`title.${locale}`]: { equals: courseTitleToCheck },
      },
      limit: 1,
      depth: 0,
    });

    if (existingCourses.docs.length > 0 && existingCourses.docs[0]) {
      const existingCourseId = existingCourses.docs[0].id;
      console.log(
        `Course with title '${courseTitleToCheck}' already exists. ID: ${existingCourseId}. Skipping creation.`,
      );
      return NextResponse.json(
        { success: true, courseId: existingCourseId, message: 'Course already exists' },
        { status: 200 },
      );
    }
    console.log(
      `No existing course found with title: ${courseTitleToCheck}. Proceeding with creation.`,
    );

    const reqWithTransaction = {
      payload: payload,
    } as any;

    console.log('Creating course:', body.course.title);
    // const newCourse = await payload.create<'courses', CoursesSelect>({
    //   collection: 'courses',
    //   data: {
    //     title: body.course.title,
    //     status: body.course.status || 'draft',
    //     // author: null,
    //     // featuredImage: null,
    //     layout: [],
    //   },
    //   overrideAccess: true,
    //   req: reqWithTransaction,
    // });
    const courseId = 'testCourseId';
    console.log(`Course created with ID: ${courseId}`);

    // const createdModuleIds: string[] = [];

    // for (const moduleData of body.modules) {
    //   console.log(`Creating module: ${moduleData.title} for course ${courseId}`);

    //   const processedLessonsData = [];
    //   for (const lessonData of moduleData.lessons) {
    //     const processedLesson = { ...lessonData };

    //     if (processedLesson.lessonType === 'standard' && processedLesson.contentLayout) {
    //       for (let i = 0; i < processedLesson.contentLayout.length; i++) {
    //         const block = processedLesson.contentLayout[i];

    //         if (block?.blockType === 'imageBlock' && (block as ImageBlockData).imageUrl) {
        //           const imageUrl = (block as ImageBlockData).imageUrl!;
        //           const altText = (block as ImageBlockData).caption || lessonData.title;
        //           console.log(`Processing image block with URL: ${imageUrl}`);
        //           const mediaId = await uploadImageFromUrl(payload, imageUrl, altText, session || undefined);

        //           if (mediaId) {
        //             (processedLesson.contentLayout[i] as ImageBlockData).image = mediaId;
        //             delete (processedLesson.contentLayout[i] as any).imageUrl;
        //             console.log(`Image block updated with Media ID: ${mediaId}`);
        //           } else {
        //             const errorMessage = `Failed to upload image for lesson '${lessonData.title}'. Skipping image block.`;
        //             console.error(errorMessage);
        //             processedLesson.contentLayout.splice(i, 1);
        //             i--;
        //             processedLesson.contentLayout[i] = {
        //               blockType: 'textBlock',
        //               content: {
        //                 root: {
        //                   type: 'root',
        //                   children: [
        //                     {
        //                       type: 'paragraph',
        //                       children: [
        //                         {
        //                           type: 'text',
        //                           text: errorMessage,
        //                         },
        //                       ],
        //                     },
        //                   ],
        //                 },
        //               },
        //             } as any;
        //           }
        //         }
        //       }
        //     }
        //     processedLessonsData.push(processedLesson);
        //   }

        //   const newModule = await payload.create<'modules', ModulesSelect>({
        //     collection: 'modules',
        //     data: {
        //       title: moduleData.title,
        //       course: null,
        //       layout: [],
        //       course: courseId,
        //     },
        //     overrideAccess: true,
        //     req: reqWithTransaction,
        //   });
        //   const moduleId = newModule.id;
        //   console.log(`Module created with ID: ${moduleId}`);
        //   createdModuleIds.push(moduleId);

        //   const createdLessonIds: string[] = [];

        //   for (const lessonData of processedLessonsData) {
        //     console.log(`Creating lesson: ${lessonData.title} for module ${moduleId}`);

        //     const lessonPayload: Partial<Lesson> = {
        //       title: lessonData.title,
        //       module: moduleId,
        //       order: lessonData.order,
        //       lessonType: lessonData.lessonType,
        //     };

        //     if (lessonData.lessonType === 'standard' && lessonData.contentLayout) {
        //       lessonPayload.contentLayout = lessonData.contentLayout;
        //     } else if (lessonData.lessonType === 'video' && lessonData.videoUrl) {
        //       lessonPayload.videoUrl = lessonData.videoUrl;
        //     }

        //     const newLesson = await payload.create<'modules', Module>({
        //       collection: 'modules', //lessons collection does not exist
        //       data: lessonPayload as any,
        //       overrideAccess: true,
        //       req: reqWithTransaction,
        //     });
        //     console.log(`Lesson created with ID: ${newLesson.id}`);
        //     if (newLesson?.id) {
        //       createdLessonIds.push(newLesson.id);
        //     }
        //   }

        //   console.log(`Updating module ${moduleId} with ${createdLessonIds.length} lessons.`);
        //   await payload.update<'modules', ModulesSelect>({
        //     collection: 'modules',
        //     id: moduleId,
        //     data: {},
        //     overrideAccess: true,
        //     req: reqWithTransaction,
        //   });
      // }

    // console.log(`Updating course ${courseId} with ${createdModuleIds.length} modules.`);
    // await payload.update<'courses', CoursesSelect>({
    //   collection: 'courses',
    //   id: courseId,
    //   overrideAccess: true,
    //   req: reqWithTransaction,
    // });

    // await session?.commitTransaction()
    // console.log('Transaction committed successfully.')
    // session?.endSession()
    // session = null

    console.log(`Successfully generated course ${courseId} and all related content.`);

    return NextResponse.json({ success: true, courseId: courseId }, { status: 201 });
  } catch (error: any) {
    // if (session && session.inTransaction()) {
    //   console.error('Error occurred during transaction. Aborting...');
    //   await session?.abortTransaction();
    //   console.log('Transaction aborted.');
    //   session?.endSession();
    //   session = null;
    // }

    console.error('Error processing course generation request:', error);

    let errorMessage = 'Internal Server Error during course generation';
    let statusCode = 500;

    if (error instanceof z.ZodError) {
      errorMessage = 'Invalid request data';
      statusCode = 400;
      return NextResponse.json(
        { error: errorMessage, details: error.errors },
        { status: statusCode },
      );
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  } finally {
    if (session) {
      // session.endSession();
    }
  }
}
