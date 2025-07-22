import { ComputeNetProfit, PriceMap } from '../interfaces';
import { computeNetProfit } from '../utils/difference';
import { coinPrices } from './exchangeService';

export async function getPriceDifferences(
  sortBy: string = 'netProfit',
  sortOrder: string = 'desc',
  page: number = 1,
  perPage: number = 15,
  search: string = '',
): Promise<ComputeNetProfit> {
  if (!coinPrices.length) return { differences: [], total: 0 };

  // Group prices by normalized symbol
  const priceMap: PriceMap = {};

  for (const price of coinPrices) {
    if (price.price === 'N/A') continue;
    if (!priceMap[price.symbol]) {
      priceMap[price.symbol] = [];
    }
    priceMap[price.symbol].push(price);
  }

  return computeNetProfit(priceMap, sortBy, sortOrder, page, perPage, search);
}
