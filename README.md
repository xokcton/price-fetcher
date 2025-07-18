# Crypto Price Fetcher

A Node.js application built with TypeScript and Express to fetch cryptocurrency prices from multiple exchanges (e.g., Binance, Bybit) using the CCXT library.

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

2. **Create the logs directory**:

   ```bash
   mkdir logs
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
  { id: 'binance', name: 'Binance' },
  { id: 'bybit', name: 'Bybit' },
  { id: 'kraken', name: 'Kraken', apiKey: 'YOUR_API_KEY', secret: 'YOUR_SECRET' },
];
```

## API Endpoints

- `GET /api/prices`: Returns the latest prices from all configured exchanges.

## Notes

- Prices are fetched every 5 minutes and stored in memory.
- Logs are written to `logs/app.log` and the console.
- The `ccxt` library handles rate limiting automatically.
- For production, consider adding a database and caching layer.
