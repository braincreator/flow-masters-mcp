import { Block } from 'payload';

const Testimonial: Block = {
  name: 'testimonial',
  fields: [
    {
      name: 'testimonials',
      type: 'array',
      fields: [
        {
          name: 'author',
          type: 'text',
          required: true,
        },
        {
          name: 'authorTitle',
          type: 'text',
        },
        {
          name: 'quote',
          type: 'textarea',
          required: true,
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
};

export default Testimonial;