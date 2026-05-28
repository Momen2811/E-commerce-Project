import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas/index.js'

export default defineConfig({
  name: 'b2b',
  title: 'B2B',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'replace-with-your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
})
