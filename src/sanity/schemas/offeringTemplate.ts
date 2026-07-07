import { defineField, defineType } from 'sanity'

export const offeringTemplate = defineType({
  name: 'offeringTemplate',
  title: 'Offering Template',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
    }),
    defineField({
      name: 'benefits',
      title: 'Health Benefits',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'duration',
      title: 'Default Duration (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'price',
      title: 'Default Price ($)',
      type: 'number',
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'modality',
      title: 'Modality',
      type: 'string',
      options: {
        list: [
          { title: 'Online', value: 'online' },
          { title: 'In Person', value: 'in_person' },
          { title: 'Online / In Person', value: 'hybrid' }
        ],
        layout: 'radio'
      }
    }),
    defineField({
      name: 'idealFor',
      title: 'Ideal For',
      type: 'string',
      description: 'e.g. "Gentle Recharge", "Short Reset", "Creative Flow"'
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active (Bookable)', value: 'active' },
          { title: 'Coming Soon', value: 'coming_soon' },
          { title: 'Enquiry Only', value: 'enquiry' }
        ],
        layout: 'dropdown'
      },
      initialValue: 'active'
    }),
    defineField({
      name: 'content',
      title: 'Detailed Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
})
