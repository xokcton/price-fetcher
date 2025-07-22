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
  options?: { [key: string]: any };
  passphrase?: string;
}

export interface PriceDifference {
  symbol: string;
  exchangePair: string; // e.g., "Binance vs Bybit"
  absoluteDifference: number; // |price1 - price2|
  percentageDifference: number; // |(price1 - price2) / price2 * 100|
  price1: string;
  price2: string;
  buyCommissionFirstExchange: number | null; // Taker fee for buying on first exchange (e.g., 0.001 for 0.1%)
  sellCommissionSecondExchange: number | null; // Taker fee for selling on second exchange (e.g., 0.001 for 0.1%)
  withdrawCommissionFirstExchange: number | null; // Withdrawal fee for the coin from first exchange (e.g., 0.0005 BTC for BTC)
  netProfit: number | null; // Net profit after fees (in USDT)
}

export interface PriceMap {
  [symbol: string]: CoinPrice[];
}

export interface FeeStructure {
  tradingFees: { [symbol: string]: { taker: number } }; // e.g., { 'BTC/USDT': { taker: 0.001 } }
  withdrawalFees: { [currency: string]: number }; // e.g., { 'BTC': 0.0005 }
}

export interface DefaultWithdrawalFee {
  [exchange: string]: { [currency: string]: number };
}

export interface DefaultTakerFee {
  [exchange: string]: number;
}

export interface ComputeNetProfit {
  differences: PriceDifference[];
  total: number;
}
