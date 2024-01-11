import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

import vercel from '@astrojs/vercel/serverless'

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind()],
    devToolbar: {
        enabled: false,
    },
    output: 'server',
    adapter: vercel(),
})
