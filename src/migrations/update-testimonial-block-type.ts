import { Payload } from 'payload';

export const updateTestimonialBlockType = async (payload: Payload): Promise<void> => {
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
            console.log(`Updated page: ${page.title}`);
          }
        }
      }
    }

    console.log('Testimonial block type migration completed.');
  } catch (error) {
    console.error('Error during testimonial block type migration:', error);
  }
};