# Crypto Price Fetcher

A Node.js application built with TypeScript, Express, and Pug to fetch cryptocurrency prices for USDT pairs from multiple exchanges and compute price differences, using the CCXT library. Displays data in HTML tables with sorting, searching, and pagination capabilities.

## Project Structure

- `src/config/`: Exchange configurations (`exchanges.ts`) and fallback withdrawal fees (`fallbackFees.ts`)
- `src/controllers/`: API route handlers
- `src/routes/`: API routes
- `src/interfaces/`: TypeScript interfaces
- `src/services/`: Business logic for exchange operations and scheduling
- `src/utils/`: Utility functions (e.g., logging)
- `src/views/`: Pug templates for HTML pages (`prices.pug`, `price-differences.pug`)
- `src/views/partials/`: Reusable Pug templates (`head.pug`, `pagination.pug`)
- `public/`: Static files (`js/table.js`, `css/styles.css`)
- `src/app.ts`: Express app setup
- `src/server.ts`: Server entry point

## Setup

1. **Set up environment variables** (recommended for trading fees and OKX):

   - Create a `.env` file in the project root or set environment variables for API keys, secrets, and OKX passphrase:
     ```bash
     BINANCE_API_KEY=your_binance_api_key
     BINANCE_SECRET=your_binance_secret
     BYBIT_API_KEY=your_bybit_api_key
     BYBIT_SECRET=your_bybit_secret
     MEXC_API_KEY=your_mexc_api_key
     MEXC_SECRET=your_mexc_secret
     GATE_API_KEY=your_gate_api_key
     GATE_SECRET=your_gate_secret
     BITGET_API_KEY=your_bitget_api_key
     BITGET_SECRET=your_bitget_secret
     OKX_API_KEY=your_okx_api_key
     OKX_SECRET=your_okx_secret
     OKX_PASSPHRASE=your_okx_passphrase
     BINGX_API_KEY=your_bingx_api_key
     BINGX_SECRET=your_bingx_secret
     ```
   - API keys are recommended for `fetchTradingFees()` for Binance, Bybit, Gate.io, OKX, and optionally Bitget and BingX. OKX requires a passphrase for authentication. Withdrawal fees use public `fetchCurrencies()`.

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm start
   ```
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Adding a New Exchange

Edit `src/config/exchanges.ts` to add a new exchange:

```typescript
export const exchangeConfigs: ExchangeConfig[] = [
  {
    id: 'binance',
    name: 'Binance',
    apiKey: process.env.BINANCE_API_KEY || '',
    secret: process.env.BINANCE_SECRET || '',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    apiKey: process.env.BYBIT_API_KEY || '',
    secret: process.env.BYBIT_SECRET || '',
    options: { defaultType: 'spot' },
  },
  {
    id: 'mexc',
    name: 'MEXC',
    apiKey: process.env.MEXC_API_KEY || '',
    secret: process.env.MEXC_SECRET || '',
  },
  {
    id: 'gate',
    name: 'Gate.io',
    apiKey: process.env.GATE_API_KEY || '',
    secret: process.env.GATE_SECRET || '',
  },
  {
    id: 'bitget',
    name: 'Bitget',
    apiKey: process.env.BITGET_API_KEY || '',
    secret: process.env.BITGET_SECRET || '',
  },
  {
    id: 'okx',
    name: 'OKX',
    apiKey: process.env.OKX_API_KEY || '',
    secret: process.env.OKX_SECRET || '',
    passphrase: process.env.OKX_PASSPHRASE || '',
  },
  {
    id: 'bingx',
    name: 'BingX',
    apiKey: process.env.BINGX_API_KEY || '',
    secret: process.env.BINGX_SECRET || '',
  },
  { id: 'kraken', name: 'Kraken', apiKey: 'YOUR_API_KEY', secret: 'YOUR_SECRET' },
];
```

For exchanges requiring specific settings (e.g., Bybit spot market), add options:

```typescript
{ id: 'bybit', name: 'Bybit', apiKey: process.env.BYBIT_API_KEY || '', secret: process.env.BYBIT_SECRET || '', options: { defaultType: 'spot' } }
```

## API Endpoints

- `GET /api/prices?sortBy=<symbol|exchange|price>&sortOrder=<asc|desc>&page=<number>&perPage=<5|10|15|20|25|-1>&search=<string>`: HTML table of prices, sortable, searchable, paginated.
- `GET /api/price-differences?sortBy=<symbol|exchangePair|netProfit>&sortOrder=<asc|desc>&page=<number>&perPage=<5|10|15|20|25|-1>&search=<string>`: HTML table of price differences, sortable, searchable, paginated.

## Notes

- **HTML Tables**: Use Pug templates (`src/views/`) with reusable partials (`src/views/partials/head.pug`, `src/views/partials/pagination.pug`), Tailwind CSS (CDN), and vanilla JavaScript (`public/js/table.js`). Sorting and searching are server-side; pagination is client-assisted via URL updates.
- **Sorting**: Click column headers to toggle ascending/descending. Query parameters: `sortBy` (symbol, exchange, etc.), `sortOrder` (asc, desc).
- **Searching**: Case-insensitive, partial matches on Symbol or Exchange/Exchange Pair, server-side, debounced (300ms). Query parameter: `search`.
- **Pagination**: Options: 5, 10, 15, 20, 25, All. Default: 15 per page. Use Previous/Next buttons, page number input, or dropdown.
- **Navigation**: Links at the top of each page to switch between Prices and Price Differences, preserving `search` and `perPage` parameters.
- Prices are fetched every 5 minutes (or change in `.env` file) and stored in memory.
- Use `options: { defaultType: 'spot' }` for Bybit’s spot markets.
- Logs are written to `logs/app.log`.
- **Fee Handling**:
  - **Trading Fees**: Fetched via `fetchTradingFees()`. Fallbacks:
    - BingX: 0.1%, OKX: 0.1%, MEXC: 0%, Binance: 0.1%, Bybit: 0.1%, Gate.io: 0.2%, Bitget: 0.1%, Others: 0.1%
  - **Withdrawal Fees**: Fetched via `fetchCurrencies()`. Fallbacks in `fallbackFees.ts` for 100 coins (BTC, ETH, USDT, XRP, ADA, SOL, etc.).
  - API keys recommended for `fetchTradingFees()`. OKX requires a passphrase.
- Net profit: `absoluteDifference - (price1 * buyCommissionFirstExchange + price2 * sellCommissionSecondExchange + withdrawCommissionFirstExchange * price1)`.
- For production, consider MongoDB for persistence and Redis for caching.
