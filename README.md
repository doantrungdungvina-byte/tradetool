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
- XAUUSD uses Twelve Data `XAU/USD`; quotes can differ from individual broker spot prices.
- The foreign-flow endpoint may return an unavailable-data message instead of inventing values.
- DCA levels are technical reference calculations, not investment advice.

## XAU/USD price feed (Twelve Data)

- XAUUSD now uses the Twelve Data `XAU/USD` time-series endpoint, not Yahoo's `GC=F` gold futures and not TradingView.
- Supported intervals: M5 (`5min`), M15 (`15min`), M30 (`30min`), H1 (`1h`), H4 (`4h`), D1 (`1day`).
- Server route: `GET /api/xauusd?interval=5min`.
- Set `TWELVE_DATA_API_KEY` in Vercel → Project → Settings → Environment Variables for Production/Preview as needed, then redeploy. Never use a `NEXT_PUBLIC_` prefix for this key.
- Other Forex/crypto symbols, Vietnamese stock analysis, foreign-flow tab, fund NAV lookup and DCA illustration remain on their existing code paths.
- The application only fetches market data and calculates indicators; it does not place trades.
- Twelve Data access, quota, and data delay depend on the user's plan. XAU/USD provider prices may differ from an individual broker's quote.


## Foreign-flow endpoint

- Route: `GET /api/foreign?symbol=FPT`.
- The route requests only one latest row using `limit=1`, validates that buy/sell volumes are present, and never fabricates numbers.
- Configure `FOREIGN_FLOW_API_URL` in Vercel to a real JSON provider endpoint that supports `symbol` and `limit` query parameters. If the provider needs bearer authentication, set `FOREIGN_FLOW_API_TOKEN`.
- **Important:** this project does not include a verified free foreign-flow provider. Without an upstream endpoint, the route returns a clear `503` rather than fake values. Provider response fields may need mapping in `app/api/foreign/route.js`.
