# Production Checklist

## Environment

- Set `DATABASE_URL` (Neon Postgres, `sslmode=require`)
- Set `UPSTASH_REDIS_REST_URL`
- Set `UPSTASH_REDIS_REST_TOKEN`
- Set `REDIS_URL` (`rediss://default:<password>@<host>:6380`)
- Set Firebase Admin env vars (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- Set Supabase Storage env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`) — required for encrypted media (image/video/audio/document) uploads to work; also set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_STORAGE_BUCKET` client-side
- Confirm the CSP `connect-src` header in `vercel.json` includes `https://*.supabase.co`, or media downloads will be blocked by the browser
- Set `HEALTHCHECK_TOKEN` for protected infra health endpoint
- Set `PUBLIC_APP_URL` to your final production domain
- (Optional but recommended) set `PUBLIC_GOOGLE_SITE_VERIFICATION` and `PUBLIC_BING_SITE_VERIFICATION`
- (Optional) set `PUBLIC_CONTENT_PATHS` for extra public SEO pages (comma-separated)

## Database

- Run `db/schema.sql` in Neon SQL Editor
- Verify tables: `messages`, `analytics_daily`, `ai_insights`, `job_audit`

## Deploy

- Deploy API app (Vercel)
- Deploy worker separately (`npm run worker`) on Railway/Render/VM
- Ensure worker runtime has `DATABASE_URL`, `REDIS_URL`, and AI provider keys (if AI jobs are used)
- Ensure `npm run build` executes in CI/CD (includes automatic `seo:generate` prebuild step)

## Verification

- Run one-command local verification: `npm run verify:prod`
- Check infra health endpoint:
  - `GET /api/health/infra?token=<HEALTHCHECK_TOKEN>`
- Confirm job flow:
  - enqueue via `/api/jobs/enqueue`
  - verify worker logs completed jobs
- Confirm SEO artifacts after deploy:
  - `GET /robots.txt`
  - `GET /sitemap.xml`
  - homepage source includes `google-site-verification` / `msvalidate.01` when tokens are set

## Ongoing Ops

- Monitor queue depth and failed jobs
- Rotate Redis and DB credentials periodically
- Keep `firestore.next.rules` (the deployed ruleset per `firebase.json`) and `firestore.indexes.json` in deploy pipeline
