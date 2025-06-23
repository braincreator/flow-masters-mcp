import { MigrateUpArgs, MigrateDownArgs } from 'payload/database'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    // Fetch all pages
    const pages = await payload.find({
      collection: 'pages',
      depth: 0, // Only fetch top-level data
    });

    if (pages?.docs?.length) {
      for (const page of pages.docs) {
        if (page.layout && Array.isArray(page.layout)) {
          let updated = false;
          const updatedLayout = page.layout.map(block => {
            const anyBlock: any = block;
            if (typeof anyBlock === 'object' && anyBlock !== null && 'blockType' in anyBlock && anyBlock.blockType === 'testimonialBlock') {
              updated = true;
              return {
                ...anyBlock,
                blockType: 'testimonial',
              };
            }
            return block;
          });

          if (updated) {
            // Update the page with the modified layout
            await payload.update({
              collection: 'pages',
              id: page.id,
              data: {
                layout: updatedLayout,
              },
            });
            logDebug(`Updated page: ${page.title}`);
          }
        }
      }
    }

    logDebug('Testimonial block type migration completed.');
  } catch (error) {
    logError('Error during testimonial block type migration:', error);
    throw error;
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  try {
    // Fetch all pages
    const pages = await payload.find({
      collection: 'pages',
      depth: 0,
    });

    if (pages?.docs?.length) {
      for (const page of pages.docs) {
        if (page.layout && Array.isArray(page.layout)) {
          let updated = false;
          const updatedLayout = page.layout.map(block => {
            const anyBlock: any = block;
            if (typeof anyBlock === 'object' && anyBlock !== null && 'blockType' in anyBlock && anyBlock.blockType === 'testimonial') {
              updated = true;
              return {
                ...anyBlock,
                blockType: 'testimonialBlock',
              };
            }
            return block;
          });

          if (updated) {
            await payload.update({
              collection: 'pages',
              id: page.id,
              data: {
                layout: updatedLayout,
              },
            });
            logDebug(`Reverted page: ${page.title}`);
          }
        }
      }
    }

    logDebug('Testimonial block type reversion completed.');
  } catch (error) {
    logError('Error during testimonial block type reversion:', error);
    throw error;
  }
}
