import ccxt, { Exchange, Ticker } from 'ccxt';
import { exchangeConfigs } from '../config/exchanges';
import { CoinPrice, ExchangeConfig } from '../interfaces';
import { logger } from '../utils/logger';

class ExchangeFactory {
  private exchanges: Map<string, Exchange> = new Map();

  constructor(configs: ExchangeConfig[]) {
    configs.forEach((config: ExchangeConfig) => {
      try {
        if (!ccxt.exchanges.includes(config.id)) {
          logger.error(`Invalid exchange ID: ${config.id}`);
          return;
        }
        // Type assertion to tell TypeScript that ccxt[config.id] is a valid Exchange constructor
        const ExchangeConstructor = (ccxt as any)[config.id] as new (config: any) => Exchange;
        const exchange = new ExchangeConstructor({
          apiKey: config.apiKey,
          secret: config.secret,
          enableRateLimit: true,
        });
        this.exchanges.set(config.name, exchange);
      } catch (error) {
        logger.error(`Failed to initialize ${config.name}:`, error);
      }
    });
  }

  getExchange(name: string): Exchange | undefined {
    return this.exchanges.get(name);
  }

  getAllExchanges(): Map<string, Exchange> {
    return this.exchanges;
  }
}

const exchangeFactory = new ExchangeFactory(exchangeConfigs);
let coinPrices: CoinPrice[] = [];

async function fetchPricesFromExchange(
  exchange: Exchange,
  exchangeName: string,
): Promise<CoinPrice[]> {
  try {
    await exchange.loadMarkets();
    const tickers = await exchange.fetchTickers();
    return Object.entries(tickers).map(([symbol, ticker]: [string, Ticker]) => ({
      symbol,
      price: ticker.last?.toString() ?? 'N/A',
      exchange: exchangeName,
      timestamp: new Date(ticker.timestamp ?? Date.now()).toISOString(),
    }));
  } catch (error) {
    logger.error(`Error fetching prices from ${exchangeName}:`, error);
    return [];
  }
}

export async function getPrices(): Promise<CoinPrice[]> {
  return coinPrices;
}

export async function fetchAllPrices(): Promise<CoinPrice[]> {
  const allPrices: CoinPrice[] = [];
  for (const [name, exchange] of exchangeFactory.getAllExchanges()) {
    const prices = await fetchPricesFromExchange(exchange, name);
    allPrices.push(...prices);
  }
  coinPrices = allPrices;
  logger.info(`Prices updated from all exchanges`);
  return coinPrices;
}
