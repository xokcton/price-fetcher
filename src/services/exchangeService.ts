import ccxt, { Exchange, Ticker } from 'ccxt';
import { exchangeConfigs } from '../config/exchanges';
import { defaultTakerFee, defaultWithdrawalFees } from '../config/fallbackFees';
import { CoinPrice, ExchangeConfig, FeeStructure } from '../interfaces';
import { logger } from '../utils/logger';

class ExchangeFactory {
  private exchanges: Map<string, Exchange> = new Map();
  private feeStructures: Map<string, FeeStructure> = new Map();

  constructor(configs: ExchangeConfig[]) {
    configs.forEach((config: ExchangeConfig) => {
      try {
        if (!ccxt.exchanges.includes(config.id)) {
          logger.error(
            `Invalid exchange ID: ${config.id}. Supported exchanges: ${ccxt.exchanges.join(', ')}`,
          );
          return;
        }
        // Type assertion to tell TypeScript that ccxt[config.id] is a valid Exchange constructor
        const ExchangeConstructor = (ccxt as any)[config.id] as new (config: any) => Exchange;
        const exchange = new ExchangeConstructor({
          apiKey: config.apiKey,
          secret: config.secret,
          passphrase: config.passphrase,
          enableRateLimit: true,
          ...(config.options || {}), // Add custom options
        });
        this.exchanges.set(config.name, exchange);
        this.loadFees(exchange, config.name);
      } catch (error) {
        logger.error(`Failed to initialize ${config.name}:`, error);
      }
    });
  }

  private async loadFees(exchange: Exchange, name: string): Promise<void> {
    try {
      await exchange.loadMarkets();
      let tradingFees: { [symbol: string]: { taker: number } } = {};
      let withdrawalFees: { [currency: string]: number } = {};

      // Fetch trading fees via fetchTradingFees
      try {
        const fees = await exchange.fetchTradingFees();
        tradingFees = Object.keys(fees).reduce((acc, symbol) => {
          acc[symbol] = { taker: fees[symbol].taker || 0.001 }; // Default to 0.1% if unavailable
          return acc;
        }, {} as { [symbol: string]: { taker: number } });
        logger.info(`Loaded trading fees for ${name} via fetchTradingFees`);
      } catch (error) {
        logger.warn(`Failed to fetch trading fees for ${name}: ${error}`);
        // Fallback to hardcoded taker fees
        const defaultTF = defaultTakerFee[name] || 0.001;
        tradingFees = Object.keys(exchange.markets).reduce((acc, symbol) => {
          acc[symbol] = { taker: defaultTF };
          return acc;
        }, {} as { [symbol: string]: { taker: number } });
        logger.info(`Using fallback trading fee (${defaultTF * 100}%) for ${name}`);
      }

      // Fetch withdrawal fees via fetchCurrencies
      try {
        const currencies = await exchange.fetchCurrencies();
        if (currencies) {
          withdrawalFees = Object.keys(currencies).reduce((acc, currency) => {
            const fee = currencies[currency]?.fee;
            if (typeof fee === 'number' && !isNaN(fee)) {
              acc[currency] = fee;
            }
            return acc;
          }, {} as { [currency: string]: number });
          logger.info(`Loaded withdrawal fees for ${name} via fetchCurrencies`);
        } else {
          throw new Error('No currencies data returned');
        }
      } catch (error) {
        logger.warn(`Failed to fetch currencies for ${name}: ${error}`);
        // Use fallback withdrawal fees from fallbackFees.ts
        withdrawalFees = defaultWithdrawalFees[name] || defaultWithdrawalFees.default;
        logger.info(`Using fallback withdrawal fees for ${name}`);
      }

      this.feeStructures.set(name, { tradingFees, withdrawalFees });
    } catch (error) {
      logger.error(`Failed to load fees for ${name}: ${error}`);
    }
  }

  getExchange(name: string): Exchange | undefined {
    return this.exchanges.get(name);
  }

  getAllExchanges(): Map<string, Exchange> {
    return this.exchanges;
  }

  getFeeStructure(name: string): FeeStructure | undefined {
    return this.feeStructures.get(name);
  }
}

export const exchangeFactory = new ExchangeFactory(exchangeConfigs);
export let coinPrices: CoinPrice[] = [];

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

export async function getPrices(
  sortBy: string = 'symbol',
  sortOrder: string = 'asc',
  page: number = 1,
  perPage: number = 15,
  search: string = '',
): Promise<{ prices: CoinPrice[]; total: number }> {
  let prices = [...coinPrices];

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    prices = prices.filter(
      (price) =>
        price.symbol.toLowerCase().includes(searchLower) ||
        price.exchange.toLowerCase().includes(searchLower),
    );
  }

  const total = prices.length;

  // Sort prices
  prices.sort((a, b) => {
    let aValue: string | number = a[sortBy as keyof CoinPrice] || '';
    let bValue: string | number = b[sortBy as keyof CoinPrice] || '';
    if (sortBy === 'price') {
      aValue = parseFloat(aValue as string) || 0;
      bValue = parseFloat(bValue as string) || 0;
    } else {
      aValue = (aValue as string).toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate
  const start = (page - 1) * perPage;
  const end = perPage === -1 ? prices.length : start + perPage;
  prices = prices.slice(start, end);

  logger.info(`Returning ${prices.length} prices after filtering '${search}'`);
  return { prices, total };
}

export async function fetchAllPrices(): Promise<void> {
  const allPrices: CoinPrice[] = [];
  for (const [name, exchange] of exchangeFactory.getAllExchanges()) {
    const prices = await fetchPricesFromExchange(exchange, name);
    allPrices.push(...prices);
  }
  coinPrices = allPrices;
  logger.info(`Prices updated from all exchanges`);
}
