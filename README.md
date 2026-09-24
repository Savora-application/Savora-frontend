# Savora Frontend

Savora's React web app provides a simple way to compare Canadian credit cards without connecting to a bank account or credit-card account.

## V1 customer flow

1. Create an account.
2. Answer a short self-reported questionnaire.
3. Add the credit-card products you already use by card name.
4. Get three personalized card recommendations.
5. Check which card in your wallet is best for a purchase.
6. Ask Savora to explain recommendation results when AI is enabled.

Savora does **not** ask for bank usernames, passwords, account numbers, credit-card numbers, security codes, or live access to bank/credit-card websites.

## Tech stack

- React
- TypeScript
- Vite

## Local setup

```bash
npm install
copy .env.example .env
npm run dev
```

Default local frontend:

```
http://localhost:5173
```

Set `VITE_API_URL` to the backend API base URL.

Example:

```
VITE_API_URL=http://localhost:3000/api/v1
```

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Production deployment

The frontend is a normal static Vite build.

1. Set `VITE_API_URL` to the deployed backend `/api/v1` URL.
2. Run `npm ci`.
3. Run `npm run build`.
4. Serve the generated `dist/` directory with any static hosting provider.
5. Add the deployed frontend origin to the backend `CORS_ORIGIN` allowlist.

## Main screens

- Overview
- Wallet
- Purchase analyzer
- Discover cards / Top 3 recommendations
- Ask Savora
- Simple profile questionnaire

## Customer data collected in V1

Only self-reported values needed for recommendation logic, such as:

- income estimates
- spending estimates
- approximate savings
- bank names
- travel/foreign spending estimate
- annual-fee preference
- simple eligibility answers such as Costco membership

No banking connection is required.

## CI

Frontend CI runs:

- dependency install
- TypeScript/Vite production build
- ESLint
