import { type SchemaTypeDefinition } from 'sanity'
import { page } from './schemas/page'
import { offeringTemplate } from './schemas/offeringTemplate'
import { post } from './schemas/post'
import { testimonial } from './schemas/testimonial'
import { faq } from './schemas/faq'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [page, offeringTemplate, post, testimonial, faq],
}
