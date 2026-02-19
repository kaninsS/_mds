import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export const projectConfig = {
  databaseUrl: process.env.DATABASE_URL,
  http: {
    storeCors: process.env.STORE_CORS!,
    adminCors: process.env.ADMIN_CORS!,
    authCors: process.env.AUTH_CORS!,
    jwtSecret: process.env.JWT_SECRET || "supersecret",
    cookieSecret: process.env.COOKIE_SECRET || "supersecret",
  }
}

module.exports = defineConfig({
  projectConfig,
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: (process.env.BACKEND_URL || "http://localhost:9000") + "/static",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        scopes: {
          vendor: {
            valid_providers: ["emailpass"],
          },
        },
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
        ],
      },
    },
    {
      resolve: "./src/modules/marketplace",
    },
    {
      resolve: "./src/modules/product-request",
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/console-notification",
            id: "console-notification",
            options: {
              channels: ["email-console"],
            },
          },
          {
            resolve: "./src/modules/resend-notification",
            id: "resend-notification",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY,
              from_email: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            },
          },
        ],
      },
    },
  ]
})
