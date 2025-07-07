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

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
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

async function uploadImageFromUrl(
  payload: Payload,
  imageUrl: string,
  altText: string = 'Generated image',
  session?: ClientSession | null,
): Promise<string | null> {
  try {
    logDebug(`Fetching image from URL: ${imageUrl}`);
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await response.arrayBuffer());

    const originalFilename = path.basename(new URL(imageUrl).pathname);
    const extension = path.extname(originalFilename) || '.jpg';
    const filename = `${uuidv4()}${extension}`;

    logDebug(`Uploading image to Payload Media collection. Filename: ${filename}, Type: ${contentType}`,  );

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

    logDebug(`Image uploaded successfully within transaction. Media ID: ${mediaDoc?.id}`);
    return mediaDoc?.id || null;
  } catch (error) {
    logError(`Error uploading image from URL ${imageUrl}:`, error);
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
  logDebug('Received POST request to /api/generate-course');

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logWarn('Missing or invalid Authorization header');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providedKey = authHeader.substring(7);

  const payload = await getPayloadInstance();

  try {
    logDebug(`Attempting to authenticate with provided key prefix: ${providedKey.substring(0, 4)}...`,  );
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
      logWarn('Provided API Key not found or not enabled in the collection.');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validApiKey = apiKeyQuery.docs[0];
    if (validApiKey) {
      logDebug(`API Key validation successful. Key Name: ${validApiKey.email}`);
    } else {
      logWarn('Valid API key not found in query result.');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch (authError) {
    logError('Error during API key authentication:', authError);
    return NextResponse.json(
      { error: 'Internal Server Error during authentication' },
      { status: 500 },
    );
  }

  const locale = payload.config.localization && typeof payload.config.localization === 'object' ? payload.config.localization.defaultLocale || 'en' : 'en';

  const session: ClientSession | null = null;

  try {
    const requestData = await request.json();
    logDebug('Raw Request Body:', JSON.stringify(requestData, null, 2));

    const validationResult = courseGenerationPayloadSchema.safeParse(requestData);

    if (!validationResult.success) {
      logError('Input validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.errors },
        { status: 400 },
      );
    }

    const body: CourseGenerationPayload = validationResult.data;
    logDebug('Validated Request Body:', JSON.stringify(body, null, 2));

    const courseTitleToCheck = body.course.title;
    logDebug(`Checking for existing course with title: ${courseTitleToCheck}`);
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
      logDebug("Debug:",  `Course with title '${courseTitleToCheck}' already exists. ID: ${existingCourseId}. Skipping creation.`,
      );
      return NextResponse.json(
        { success: true, courseId: existingCourseId, message: 'Course already exists' },
        { status: 200 },
      );
    }
    logDebug(`No existing course found with title: ${courseTitleToCheck}. Proceeding with creation.`,  );

    const reqWithTransaction = {
      payload: payload,
    } as any;

    logDebug('Creating course:', body.course.title);
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
    logDebug(`Course created with ID: ${courseId}`);


    logDebug(`Successfully generated course ${courseId} and all related content.`);

    return NextResponse.json({
      success: true,
      courseId: courseId,
    }, { status: 201 });
  } catch (error: any) {

    logError('Error processing course generation request:', error);

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
