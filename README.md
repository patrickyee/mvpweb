# MVP Web

Vue.js SPA for training and testing Jacks-or-Better video poker strategy.

Start here:

- `AGENTS.md` for contributor and coding-agent ground rules.
- `DESIGN.md` for product, game, UX, and visual design.
- `PLAN.md` for implementation phases and current hand-off status.

Local commands:

```bash
npm install
npm run dev
npm run type-check
npm run test
npm run build
```

## Cloudflare Pages Deployment

The repo deploys through GitHub Actions using Cloudflare Pages Direct Upload.

One-time Cloudflare setup:

```bash
npx wrangler login
npx wrangler pages project create mvpweb --production-branch=main
```

GitHub setup:

1. Create a Cloudflare API token with `Account > Cloudflare Pages > Edit`.
2. Add GitHub repository secrets:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
3. Add GitHub repository variable:
   - `CLOUDFLARE_PAGES_PROJECT_NAME=mvpweb`

Deploy:

1. Push to `main`, or run the `Deploy to Cloudflare Pages` workflow manually.
2. The workflow runs type-check, tests, build, then deploys `dist`.

Manual deploy, if needed:

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name=mvpweb --branch=main
```

Custom domain:

1. Go to Cloudflare Dashboard > Workers & Pages.
2. Open the `mvpweb` Pages project.
3. Go to Custom domains.
4. Select Set up a domain.
5. Enter the domain, for example `poker.example.com`.
6. Confirm the domain setup.
7. If the DNS zone is on Cloudflare, Cloudflare creates the DNS record. If DNS is elsewhere, add the CNAME record shown by Cloudflare at that DNS provider.

Cloudflare references:

- Pages Direct Upload CI: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Wrangler Pages commands: https://developers.cloudflare.com/workers/wrangler/commands/pages/

Additional documentation should not be added unless explicitly requested.
