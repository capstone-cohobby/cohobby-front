This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 로컬 개발 환경 설정

1. 개발 서버 실행:
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

### Vercel 배포 설정

**⚠️ 중요: Mixed Content 문제 해결을 위해 Vercel Proxy를 사용합니다.**

- `vercel.json`에 rewrites 설정이 되어 있습니다
- 프로덕션에서는 자동으로 `/api` 경로를 백엔드로 프록시합니다
- 로컬 개발 환경에서는 `http://localhost:8080`을 직접 사용합니다

**WebSocket 사용 시:**
- WebSocket은 rewrites를 사용할 수 없으므로 환경 변수 `NEXT_PUBLIC_API_URL`에 백엔드 주소를 직접 설정해야 합니다
- Vercel 환경 변수에 `NEXT_PUBLIC_API_URL=http://43.203.228.76:8080` 설정 (WebSocket용)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
