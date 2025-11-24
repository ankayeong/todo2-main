안녕 애들아 깃허브 퍼가서 테스트 돌릴 때

프로젝트 최상단에 .env.local파일 추가해서 

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cXVpZXQtaGVybWl0LTY2LmNsZXJrLmFjY291bnRzLmRldiQ

CLERK_SECRET_KEY=sk_test_zpKjhtGa9a7knZXFUODZdmtSgULpGqfYms3J5rz0sl

MONGO_URI=mongodb+srv://kayoung2389_db_user:6c6N_2pF_XyFgMm@cluster0.wppbtic.mongodb.net/?appName=Cluster0
추가하삼(데이터 제대로 테스트하려면 몽고DB 계정 너껄로 해야댐)

NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/main
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/main

복붙하거라

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
