import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schema } from './src/sanity/schema'
import { dataset, projectId } from './src/sanity/env'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title: 'Breathe Write Studio',
  schema,
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: '2024-03-01' }),
  ],
})
