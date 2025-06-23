import { MigrateUpArgs, MigrateDownArgs } from 'payload/database'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
type OldLinkType = {
  link?: {
    type?: 'reference' | 'custom' | null;
    newTab?: boolean | null;
    reference?: {
      relationTo: 'pages' | 'posts';
      value: string | { slug: string };
    } | null;
    url?: string | null;
    label: string;
    appearance?: 'default' | 'outline' | null;
  };
  id?: string | null;
}

const convertOldLinkToNewAction = (link: OldLinkType) => {
  if (!link?.link) return null;
  
  return {
    actionType: 'link' as const,
    label: link.link.label,
    type: link.link.type || 'custom',
    reference: link.link.reference,
    url: link.link.url,
    appearance: link.link.appearance || 'default',
    newTab: link.link.newTab || false,
    icon: 'none' as const,
  };
};

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    // Get all collections that might have actions
    const collections = ['pages', 'posts'];

    for (const collectionSlug of collections) {
      const result = await payload.find({
        collection: collectionSlug,
        depth: 10,
      });

      logDebug(`Processing ${collectionSlug}...`);

      const docs = result?.docs || [];

      for (const doc of docs) {
        let updated = false;
        let updatedLayout;

        if (doc?.layout && Array.isArray(doc.layout)) {
          updatedLayout = doc.layout.map((block: any) => {
            // Handle CTA blocks
            if (block?.blockType === 'cta') {
              if (block?.links?.length) {
                updated = true;
                return {
                  ...block,
                  actions: block.links
                    .map((link: OldLinkType) => convertOldLinkToNewAction(link))
                    .filter(Boolean),
                };
              }
            }

            // Handle Content blocks
            if (block?.blockType === 'content' && block?.columns) {
              const updatedColumns = block.columns.map((column: any) => {
                if (column?.links?.length) {
                  updated = true;
                  return {
                    ...column,
                    actions: column.links
                      .map((link: OldLinkType) => convertOldLinkToNewAction(link))
                      .filter(Boolean),
                    enableActions: true,
                  };
                }
                return column;
              });

              return {
                ...block,
                columns: updatedColumns,
              };
            }

            return block;
          });

          if (updated && doc.id) {
            await payload.update({
              collection: collectionSlug,
              id: doc.id,
              data: {
                layout: updatedLayout,
              },
              depth: 0,
            });
            logDebug(`Updated ${collectionSlug} document: ${doc.id}`);
          }
        }
      }
    }

    logDebug('Action migration completed successfully');
  } catch (error) {
    logError('Error migrating actions:', error);
    throw error;
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  logDebug('No down migration implemented');
}
