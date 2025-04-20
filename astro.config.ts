import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
// @ts-check
import { defineConfig } from 'astro/config'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

import compress from 'astro-compress'

import compressor from 'astro-compressor'

// https://astro.build/config
export default defineConfig({
  site: 'https://quick-web-template.netlify.app',
  prefetch: true,

  devToolbar: {
    enabled: false,
  },

  vite: {
    plugins: [
      tailwindcss(),
      iconsSpritesheet({
        withTypes: true,
        typesOutputFile: 'src/components/ui/icons/icon-name.d.ts',
        inputDir: 'resources/icons',
        outputDir: 'public/assets/icons',
        fileName: 'sprite.svg',
        formatter: 'prettier',
        iconNameTransformer: name => name.toLowerCase(),
      }),
    ],
    build: {
      cssMinify: true,
    },
  },

  server: {
    port: 3000,
  },

  integrations: [sitemap(), compress({ SVG: false }), compressor()],
})
