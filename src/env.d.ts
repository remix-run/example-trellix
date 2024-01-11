/// <reference types="astro/client" />
interface ImportMetaEnv {
    readonly DATABASE_URL: string
    readonly JWT_SECRET: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare namespace App {
    interface Locals {
        userId?: string
    }
}
