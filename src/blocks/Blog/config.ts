import { Block } from 'payload/types'

export type BlogBlockType = {
  blockType: 'blog'
  blockName?: string
  layout?: 'grid' | 'list'
  postsPerPage?: number
  showFeaturedPost?: boolean
  showSearch?: boolean
  showCategories?: boolean
  showTags?: boolean
  showPagination?: boolean
  categoryID?: string
  tagID?: string
  authorID?: string
  searchQuery?: string
}

export const BlogBlock: Block = {
  slug: 'blog',
  labels: {
    singular: 'Blog Posts Block',
    plural: 'Blog Posts Blocks',
  },
  fields: [
    {
      name: 'layout',
      label: 'Layout',
      type: 'select',
      defaultValue: 'grid',
      options: [
        {
          label: 'Grid',
          value: 'grid',
        },
        {
          label: 'List',
          value: 'list',
        },
      ],
    },
    {
      name: 'postsPerPage',
      label: 'Posts Per Page',
      type: 'number',
      defaultValue: 9,
      min: 1,
      max: 24,
    },
    {
      name: 'showFeaturedPost',
      label: 'Show Featured Post',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showSearch',
      label: 'Show Search',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showCategories',
      label: 'Show Categories',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showTags',
      label: 'Show Tags',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'showPagination',
      label: 'Show Pagination',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'categoryID',
      label: 'Filter by Category',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: {
        condition: (data) => data.showCategories === true,
      },
    },
    {
      name: 'tagID',
      label: 'Filter by Tag',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: false,
      admin: {
        condition: (data) => data.showTags === true,
      },
    },
    {
      name: 'authorID',
      label: 'Filter by Author',
      type: 'relationship',
      relationTo: 'users',
      hasMany: false,
    },
  ],
}

export default BlogBlock
