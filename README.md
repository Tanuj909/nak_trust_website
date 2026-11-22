# NAK Trust ORG — Frontend Phase 0

React + Vite + JavaScript starter. Backend is intentionally not connected.

## Requirements
- Node.js 20.19+ or 22.12+
- npm

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Phase 0 included
- Vite + React JavaScript setup (no TypeScript)
- React Router route foundation
- Hindi default / English language switch foundation
- Responsive government-inspired independent trust design system
- Shared header, navigation, footer and page shell
- Centralized site, route and navigation configuration
- Static service/data architecture placeholders
- SEO baseline in `index.html`

## Important
All content/data in this phase is illustrative. No backend, authentication, payment processing,
Aadhaar collection, or real member records are implemented.


## Node.js compatibility

- Primary development version: Node.js 26.3.0 (see `.nvmrc`).
- Compatibility target: Node.js 22.12.0 or newer within the 22.x line.
- `package.json` declares both supported Node.js version ranges.

Use `node -v` to verify the active runtime, then run `npm install` and `npm run dev`.

Note: Windows Application Control can independently block native dependency files such as Rollup's `.node` binary. Changing Node.js versions does not override that Windows security policy; if the block persists, the policy needs to be reviewed by the device administrator.
