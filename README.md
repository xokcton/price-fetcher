# Crypto Price Fetcher

A Node.js application built with TypeScript and Express to fetch cryptocurrency prices for USDT pairs from multiple exchanges and compute price differences between them using the CCXT library.

## Project Structure

- `src/config/`: Exchange configurations (`exchanges.ts`) and fallback withdrawal fees (`fallbackFees.ts`)
- `src/controllers/`: API route handlers
- `src/routes/`: API routes
- `src/interfaces/`: TypeScript interfaces
- `src/services/`: Business logic for exchange operations and scheduling
- `src/utils/`: Utility functions (e.g., logging)
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
   - API keys are recommended for `fetchTradingFees()` for Binance, Bybit, Gate.io, OKX, and optionally Bitget and BingX. OKX requires a passphrase for authentication. Withdrawal fees use public `fetchCurrencies()`, so keys are optional for those.

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

- `GET /api/prices`: Returns the latest USDT pair prices from all configured exchanges.
  ```json
  {
    "timestamp": "2025-07-21T22:14:45.123Z",
    "prices": [
      { "symbol": "BTC/USDT", "price": "65000.123", "exchange": "Binance", "timestamp": "2025-07-21T22:14:45.123Z" },
      { "symbol": "BTC/USDT", "price": "64980.789", "exchange": "Bybit", "timestamp": "2025-07-21T22:14:45.123Z" },
      ...
    ]
  }
  ```
- `GET /api/price-differences`: Returns up to 100 price differences (by net profit) for USDT pairs across all exchange pairs, including only positive net profit opportunities, sorted by net profit descending. Includes individual prices, buying commission on the first exchange, selling commission on the second exchange, withdrawal fee from the first exchange, and net profit for arbitrage. Uses a min-heap for efficient selection.
  ```json
  {
    "timestamp": "2025-07-21T22:14:45.123Z",
    "differences": [
      {
        "symbol": "ETH/USDT",
        "exchangePair": "MEXC vs OKX",
        "absoluteDifference": 50.123,
        "percentageDifference": 1.433,
        "price1": "3550.456",
        "price2": "3500.333",
        "buyCommissionFirstExchange": 0.0,
        "sellCommissionSecondExchange": 0.001,
        "withdrawCommissionFirstExchange": 0.002,
        "netProfit": 39.3702
      },
      {
        "symbol": "BTC/USDT",
        "exchangePair": "Binance vs Bybit",
        "absoluteDifference": 200.334,
        "percentageDifference": 0.308,
        "price1": "65200.123",
        "price2": "64999.789",
        "buyCommissionFirstExchange": 0.001,
        "sellCommissionSecondExchange": 0.001,
        "withdrawCommissionFirstExchange": 0.0005,
        "netProfit": 37.5340
      },
      {
        "symbol": "ADA/USDT",
        "exchangePair": "MEXC vs Bitget",
        "absoluteDifference": 0.015,
        "percentageDifference": 2.5,
        "price1": "0.615",
        "price2": "0.600",
        "buyCommissionFirstExchange": 0.0,
        "sellCommissionSecondExchange": 0.001,
        "withdrawCommissionFirstExchange": 0.5,
        "netProfit": 14.2640
      },
      ...
    ]
  }
  ```

## Notes

- Prices are fetched every N (e.g. 5) minutes and stored in memory.
- Logs are written to `logs/app.log` and the console. The `logs` directory is automatically created on startup.
- The `ccxt` library handles rate limiting automatically. Monitor `logs/app.log` for rate limit or API errors.
- **Fee Handling**:
  - **Trading Fees**: Fetched via CCXT’s `fetchTradingFees()`. If unavailable (e.g., due to `NotSupported` for BingX, OKX, MEXC, or `AuthenticationError` for Binance, Bybit, Gate.io, OKX), hardcoded fallback taker fees are used:
    - BingX: 0.1%
    - OKX: 0.1%
    - MEXC: 0%
    - Binance: 0.1%
    - Bybit: 0.1%
    - Gate.io: 0.2%
    - Bitget: 0.1%
    - Others: 0.1%
  - **Withdrawal Fees**: Fetched via CCXT’s `fetchCurrencies()`. If unavailable, fallback fees from `src/config/fallbackFees.ts` are used for 100 coins, including BTC, ETH, USDT, XRP, ADA, SOL, BNB, DOT, DOGE, LINK, MATIC, LTC, BCH, XLM, TRX, SHIB, AVAX, UNI, ATOM, ALGO, VET, XMR, EOS, and others. Exchange-specific fees are:
    - Binance: e.g., BTC (0.0005), ETH (0.005), USDT (2.5)
    - Bybit: e.g., BTC (0.0005), ETH (0.005), USDT (3.0)
    - MEXC: e.g., BTC (0.0003), ETH (0.002), USDT (1.0)
    - Gate.io: e.g., BTC (0.0004), ETH (0.004), USDT (2.0)
    - Bitget: e.g., BTC (0.0005), ETH (0.005), USDT (2.5)
    - OKX: e.g., BTC (0.0004), ETH (0.003), USDT (1.5)
    - BingX: e.g., BTC (0.0005), ETH (0.005), USDT (2.5)
    - Others: e.g., BTC (0.0005), ETH (0.005), USDT (2.5)
  - API keys are recommended for `fetchTradingFees()` for Binance, Bybit, Gate.io, OKX, and optionally Bitget and BingX. OKX requires a passphrase for authentication. Set keys and passphrase in `src/config/exchanges.ts` or a `.env` file. `fetchCurrencies()` is public and does not require keys.
  - If fees are unavailable for a currency (e.g., not in `fetchCurrencies()` or `fallbackFees.ts`), `netProfit` may be `null`, and such differences are excluded from the output.
- Net profit is calculated as `absoluteDifference - (price1 * buyCommissionFirstExchange + price2 * sellCommissionSecondExchange + withdrawCommissionFirstExchange * price1)`, representing the profit in USDT after fees for buying on the first exchange, selling on the second, and withdrawing the coin. Only differences with positive net profit are included, sorted by net profit descending.
- For production, consider adding a database (e.g., MongoDB) for price persistence and a caching layer (e.g., Redis) to reduce API calls.
- To fetch Bybit spot market pairs instead of futures, add `options: { defaultType: 'spot' }` to Bybit’s config in `src/config/exchanges.ts`.
