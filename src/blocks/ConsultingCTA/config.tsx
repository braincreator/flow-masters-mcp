import { Block } from 'payload';

export const ConsultingCTA: Block = {
  slug: 'consultingCTA',
  labels: {
    singular: 'Consulting CTA',
    plural: 'Consulting CTAs',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'buttonLabel',
      type: 'text',
      defaultValue: 'Request Consultation',
    },
    {
      name: 'buttonLink',
      type: 'text',
    },
  ],
};