import ccxt, { Exchange, Ticker } from 'ccxt';
import { exchangeConfigs } from '../config/exchanges';
import { CoinPrice, ExchangeConfig, PriceDifference, PriceMap } from '../interfaces';
import { logger } from '../utils/logger';
import { computePairwiseDifference } from '../utils/pairwiseDifference';

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
          ...config.options, // Add custom options
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
    logger.info(`Loading markets for ${exchangeName}`);
    await exchange.loadMarkets();
    logger.info(`Fetching tickers for ${exchangeName}`);
    const tickers = await exchange.fetchTickers();
    logger.info(`Retrieved ${Object.keys(tickers).length} tickers from ${exchangeName}`);

    if (Object.keys(tickers).length === 0) {
      logger.warn(`No tickers retrieved from ${exchangeName}`);
      return [];
    }

    const usdtPairs = Object.entries(tickers)
      .filter(
        ([symbol]) =>
          symbol.endsWith('/USDT') ||
          symbol.endsWith('-USDT') ||
          symbol.endsWith('USDT') ||
          symbol.endsWith('/USDT:USDT'), // for Bybit
      ) // Filter for USDT pairs only
      .map(([symbol, ticker]: [string, Ticker]) => ({
        symbol: symbol.replace(/(\/USDT|-USDT|USDT|\/USDT:USDT)$/, '/USDT'), // Normalize symbol format
        price: ticker.last?.toString() ?? 'N/A',
        exchange: exchangeName,
        timestamp: new Date(ticker.timestamp ?? Date.now()).toISOString(),
      }));

    logger.info(`Filtered ${usdtPairs.length} USDT pairs from ${exchangeName}`);
    return usdtPairs;
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

export async function getPriceDifferences(): Promise<PriceDifference[]> {
  if (!coinPrices.length) return [];

  // Group prices by normalized symbol
  const priceMap: PriceMap = {};

  for (const price of coinPrices) {
    if (price.price === 'N/A') continue; // Skip invalid prices
    if (!priceMap[price.symbol]) {
      priceMap[price.symbol] = [];
    }
    priceMap[price.symbol].push(price);
  }

  return computePairwiseDifference(priceMap);
}
