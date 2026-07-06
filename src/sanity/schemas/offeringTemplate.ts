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
      name: 'content',
      title: 'Detailed Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
})
