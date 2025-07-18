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
}
