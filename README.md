This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Railway

This project is ready to deploy on Railway with PostgreSQL provided as a separate Railway service.

Required environment variables:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (optional)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` (optional)
- `UPLOAD_STORAGE_DIR` (optional, recommended on Railway)

Suggested Railway commands:

- Build: `npm run build`
- Start: `npm run start`

The start command runs `prisma db push` first so the deployed PostgreSQL schema stays in sync with `prisma/schema.prisma`.

For file uploads on Railway, set `UPLOAD_STORAGE_DIR` to a mounted volume path such as `/app/data/uploads`. The app will still serve files from the same `/uploads/...` URLs.

One-time database seeding, if needed for a fresh database:

- `npm run db:seed`

The admin account is created by the seed script with:

- Email: `admin@spacein.in`
- Password: `Admin@123`
