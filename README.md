# Trading Tools — Next.js + Vercel

Next.js App Router project for VN stock analysis, Forex/XAUUSD, foreign-flow status, and fund NAV lookup.

## Fund NAV feature

- Search by manually entered fund code; autocomplete includes common open-ended funds and Vietnamese ETFs.
- API route: `GET /api/funds/[symbol]`.
- Primary source: Fmarket product search. The API accepts only an exact fund-code match and never substitutes the first search result.
- Fallback: CafeF only when a NAV and percentage pair can be conservatively identified.
- The UI shows NAV, change (when available), NAV date (only when the source supplies it), source attribution, and history/performance only if the response actually contains usable fields.
- Source API is not officially documented. Fmarket/CafeF pages or schemas may change; verify the reported NAV and date against the fund manager's official disclosure. No fabricated NAV dates or history are generated.
- For listed ETFs, exchange-traded price can differ from NAV per unit.

## Run locally

Node.js 20.9 or newer:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To verify production build:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Upload the full project directory to the connected GitHub repository (or create a new repository).
2. In Vercel, import that repository.
3. Framework preset: Next.js. Build command: `npm run build`.
4. Deploy, then test `/api/funds/VESAF`, `/api/funds/E1VFVN30`, and the fund tab in the UI.

## Other data limitations

- Yahoo Finance prices can be delayed, missing, or unavailable for some Vietnam tickers.
- XAUUSD is represented by `GC=F` futures, not broker spot prices.
- The foreign-flow endpoint may return an unavailable-data message instead of inventing values.
- DCA levels are technical reference calculations, not investment advice.
