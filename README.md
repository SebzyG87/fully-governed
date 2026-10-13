# Fully Governed Studios

Fully Governed Studios is a Vite, React, TypeScript, shadcn/ui, and Tailwind CSS application for the studio booking, creator, podcast, music, and content operations platform.

## Code and files

- GitHub: https://github.com/SebzyG87/fully-governed
- Drive checkout: `E:\Sebs fullg folder\FULLY_GOVERNED_PROJECT\Website`
- `src/`: React pages, components, hooks, and shared application logic.
- `public/`: static website assets, including the four room panoramas.
- `api/`: Vercel server handlers.
- `supabase/migrations/` and `supabase/functions/`: database changes and backend functions.
- `docs/archive/`: original handover notes, preserved for reference. They describe an earlier version and are not a current feature checklist.

Original photography and recovered WhatsApp images are stored outside this checkout on the drive. GitHub contains the images used by the website, not the entire drive's photo collection.

## Development

Use the current Node.js LTS release and npm. Copy `.env.example` to `.env.local` and supply the frontend configuration before connecting to Supabase. Keep backend secrets in the service's environment settings.

```sh
npm ci
npm run dev
```

## Verification

```sh
npm run check
```

This runs ESLint with no warnings allowed, TypeScript checks for the app and build configuration, automated tests, and a production build. Each check can also be run separately with `npm run lint`, `npm run typecheck`, `npm run test`, or `npm run build`.

## Website images

Studio managers and admins can use `/admin/media` to upload or replace the homepage photo, room covers, and registered room panoramas. Uploads accept JPEG, PNG, WebP, or AVIF up to 30 MB. Panoramas must be approximately 2:1 equirectangular images.

The four-room tour uses the same managed image for each room's interactive panorama and flat photo. The podcast image is included in the upload controls; its title and description remain defined in `src/pages/Tour360.tsx`. The original three room gallery names and descriptions can be edited in the dashboard.

Image management requires the website-media database/storage migration. The gallery text controls also require the room-gallery-content migration. These files are in `supabase/migrations/`.

Generated files (`node_modules`, `dist`, coverage, Vercel state, and Supabase CLI temporary state) and local environment files are excluded from Git. The npm lockfile is the documented installation path; the historical Bun lockfiles remain to avoid changing deployment package-manager detection during a cleanup.

## Production

Production runs on Vercel at:

https://www.fullygoverned.co.uk

The GitHub `main` branch deploys to production. Push review or cleanup work to a separate branch until it is ready to publish.
