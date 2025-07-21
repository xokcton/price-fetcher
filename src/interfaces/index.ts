export interface CoinPrice {
  symbol: string;
  price: string;
  exchange: string;
  timestamp: string;
}

export interface ExchangeConfig {
  id: string;
  name: string;
  apiKey?: string;
  secret?: string;
  options?: {
    defaultType: string;
  };
  // password?: string; // e.g., OKX passphrase
}

export interface PriceDifference {
  symbol: string;
  exchangePair: string; // e.g., "Binance vs Bybit"
  absoluteDifference: number; // |price1 - price2|
  percentageDifference: number; // |(price1 - price2) / price2 * 100|
  price1: string;
  price2: string;
}

export interface PriceMap {
  [symbol: string]: CoinPrice[];
}
