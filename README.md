# Perfect Springs

Responsive redesign of the original static website, preserving all six public page URLs and the original logo and product packaging. Requires Node.js 22+.

## Development

```sh
npm ci
npm run build
npm start
```

Open http://localhost:4173. Templates are in `src/site.mjs`, product facts in `src/products.mjs`, and evergreen journal content in `src/articles.mjs`. Run the build after template changes; do not hand-edit generated HTML. CSS and browser JavaScript are served directly. `SITE_URL` controls canonical, Open Graph and sitemap URLs at build time; it defaults to the original public domain.

## Enquiries

Copy `.env.example` to `.env` and configure `RESEND_API_KEY`, `ENQUIRY_FROM` (a sender on a verified domain), `ENQUIRY_TO` (a business-approved inbox), and a random `FORM_SECRET`. Configure the same secrets in Sites runtime environment variables for the private preview. Never commit secrets.

`GET /api/enquiry-token` issues a signed, expiring form token. Both forms use `POST /api/enquiries`. The handler validates origin and input, limits body size, checks a honeypot and minimum form age, applies rate limits, coalesces duplicate requests and passes idempotency keys to Resend. Personal information is never logged or emitted in analytics. Success means provider acceptance, not confirmed inbox placement.

Until all four settings exist, the API returns 503 and the interface shows direct phone/email alternatives. It never reports false success. No live email was sent during tests. Configure a verified sender, confirm inbox ownership and test actual receipt before public launch.

Limits and successful-response caches are per Node instance or Worker isolate. Add an edge rate limit for public multi-instance traffic. Confirm retention and business-approved copy before launch.

## Collection section

The homepage adapts the supplied screen recording with collection pills, horizontal scroll snap, neighbouring-card previews, previous/next controls and an upward campaign-image wipe on hover or keyboard focus. Mobile supports swiping and persistent exploration links. Each card opens the matching product/flavour. There are no fabricated ratings, discounts or sales claims.

## Sites

`.openai/hosting.json` identifies a separate private preview. `npm run build` produces the Worker at `dist/server/index.js` with embedded static assets and the shared enquiry handler. Deploy the exact build through Sites. Publishing the preview does not change `perfectspringsllc.com`.

Original studio packshots and logo artwork are retained. Generated supporting campaign imagery is illustrative, not evidence of customers, premises or ingredients. No milestones, certifications, nutrition facts, testimonials or environmental results have been invented. See `assets/ASSETS.md` for provenance and prompts.

## Verification

```sh
npm run build
npm test
npx playwright install chromium
node tests/browser-check.mjs
```

The browser check expects a local server at port 4173. It checks ten pages at five viewport sizes, navigation, flavour selection, carousel controls, enquiry context and form UI states. Success UI uses a mocked API; delivery tests use a stub provider. Reports/screenshots go to ignored `qa/`.

Core Web Vitals are targets, not measured production claims. Field INP and real email receipt need verification after deployment and configuration.

Analytics is opt-in: listen for `perfectsprings:analytics` CustomEvents, which contain predefined product/category IDs and form kind only. Connect an approved analytics provider after confirming consent requirements.
