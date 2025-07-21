# Crypto Price Fetcher

A Node.js application built with TypeScript and Express to fetch cryptocurrency prices for USDT pairs from multiple exchanges and compute price differences between them using the CCXT library.

## Project Structure

- `src/config/`: Exchange configurations
- `src/controllers/`: API route handlers
- `src/routes/`: API routes
- `src/interfaces/`: TypeScript interfaces
- `src/services/`: Business logic for exchange operations and scheduling
- `src/utils/`: Utility functions (e.g., logging)
- `src/app.ts`: Express app setup
- `src/server.ts`: Server entry point

## Setup

1. **Initialize the project**:

   ```bash
   npm install
   ```

2. **Run the application**:
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
  { id: 'binance', name: 'Binance' },
  { id: 'bybit', name: 'Bybit' },
  { id: 'mexc', name: 'MEXC' },
  { id: 'gate', name: 'Gate.io' },
  { id: 'bitget', name: 'Bitget' },
  { id: 'okx', name: 'OKX' },
  { id: 'bingx', name: 'BingX' },
  { id: 'kraken', name: 'Kraken', apiKey: 'YOUR_API_KEY', secret: 'YOUR_SECRET' },
];
```

For exchanges requiring specific settings (e.g., Bybit spot market), add options:

```typescript
{ id: 'bybit', name: 'Bybit', options: { defaultType: 'spot' } }
```

## API Endpoints

- `GET /api/prices`: Returns the latest USDT pair prices from all configured exchanges.
  ```json
  {
    "timestamp": "2025-07-18T16:04:45.123Z",
    "prices": [
      { "symbol": "BTC/USDT", "price": "65000.123", "exchange": "Binance", "timestamp": "2025-07-18T16:04:45.123Z" },
      { "symbol": "BTC/USDT", "price": "64980.789", "exchange": "Bybit", "timestamp": "2025-07-18T16:04:45.123Z" },
      ...
    ]
  }
  ```
- `GET /api/price-differences`: Returns the top 100 price differences (sorted by percentage difference in descending order) for USDT pairs across all exchange pairs, including the individual prices from each exchange. Uses a min-heap for efficient selection.
  ```json
  {
    "timestamp": "2025-07-18T16:04:45.123Z",
    "differences": [
      {
        "symbol": "ETH/USDT",
        "exchangePair": "MEXC vs OKX",
        "absoluteDifference": 5.123,
        "percentageDifference": 0.146,
        "price1": "3500.456",
        "price2": "3495.333"
      },
      {
        "symbol": "BTC/USDT",
        "exchangePair": "Binance vs Bybit",
        "absoluteDifference": 19.334,
        "percentageDifference": 0.0297,
        "price1": "65000.123",
        "price2": "64980.789"
      },
      ...
    ]
  }
  ```

## Notes

- Prices are fetched every 5 minutes and stored in memory.
- Logs are written to `logs/app.log` and the console. The `logs` directory is automatically created on startup.
- The `ccxt` library handles rate limiting automatically. Monitor `logs/app.log` for rate limit or API errors.
- For production, consider adding a database (e.g., MongoDB) for price persistence and a caching layer (e.g., Redis) to reduce API calls.
- To fetch Bybit spot market pairs instead of futures, add `options: { defaultType: 'spot' }` to Bybit’s config in `src/config/exchanges.ts`.
