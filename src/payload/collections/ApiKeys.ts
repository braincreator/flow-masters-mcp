import type { CollectionConfig } from 'payload/types'
import { admins } from '@/access/admins' // Assuming you have access control helpers
import { checkRole } from '@/collections/Users/checkRole'

export const ApiKeys: CollectionConfig = {
  slug: 'apiKeys',
  admin: {
    useAsTitle: 'name',
    description: 'Manage API keys for external services.',
    defaultColumns: ['name', 'isEnabled', 'createdAt'],
    group: 'Admin', // Group under Admin section
  },
  access: {
    // Only admins can manage API keys
    create: admins,
    read: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'name',
      label: 'Key Name',
      type: 'text',
      required: true,
      admin: {
        description: 'A descriptive name for this API key (e.g., "MCP Server Key").',
      },
    },
    {
      name: 'key',
      label: 'API Key',
      type: 'text',
      required: true,
      unique: true, // Ensure keys are unique
      index: true,
      admin: {
        description:
          'The generated API key. Store this securely, it will not be shown again after saving.',
        // Ideally, this should be readOnly after creation and potentially hashed.
        // For now, allowing edit but recommend generating strong keys externally.
        // readOnly: ({ operation }) => operation === 'update', // Example: Make read-only after creation
      },
      // hooks: { // Example for future hashing implementation
      //   beforeChange: [
      //     async ({ value, operation }) => {
      //       if (operation === 'create' && value) {
      //         // Hash the key before saving (e.g., using bcrypt)
      //         // const hashedKey = await hashKey(value);
      //         // return hashedKey;
      //       }
      //       return value; // Return original value on update (or handle differently)
      //     }
      //   ]
      // }
    },
    {
      name: 'isEnabled',
      label: 'Enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Disable this key to revoke its access immediately.',
        position: 'sidebar',
      },
    },
    // Optional: Add tracking fields
    // {
    //   name: 'lastUsed',
    //   label: 'Last Used',
    //   type: 'date',
    //   admin: {
    //     readOnly: true,
    //   }
    // },
  ],
}
