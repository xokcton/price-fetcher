import { PriceDifference, PriceMap } from '../interfaces';
import { computeNetProfit } from '../utils/difference';
import { getPrices } from './exchangeService';

export async function getPriceDifferences(): Promise<PriceDifference[]> {
  const coinPrices = await getPrices();
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

  return computeNetProfit(priceMap);
}
