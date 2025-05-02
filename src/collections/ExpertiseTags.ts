import type { CollectionConfig } from 'payload';

// Define access control helper
// Ensure this aligns with your actual access control setup
const isAdmin = ({ req: { user } }: { req: { user: any } }) => user?.roles?.includes('admin');

const ExpertiseTags: CollectionConfig = {
  slug: 'expertise-tags',
  admin: {
    useAsTitle: 'name',
    description: 'Tags to categorize instructor areas of expertise.',
    hidden: false, // Ensure it's visible in admin UI
    defaultColumns: ['name', 'updatedAt'],
    listSearchableFields: ['name'],
  },
  access: {
    // Admins can do anything
    read: () => true, // Allow anyone to read tags (adjust if needed)
    create: isAdmin, // Only Admins can create
    update: isAdmin, // Only Admins can update
    delete: isAdmin, // Only Admins can delete
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true, // Ensure tag names are unique
      index: true, // Add index for faster lookups
    },
    // Optional: Add a description field if needed
    // {
    //   name: 'description',
    //   type: 'textarea',
    // }
  ],
};

export default ExpertiseTags;