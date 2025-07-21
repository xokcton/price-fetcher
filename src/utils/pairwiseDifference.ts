import MinHeap from 'heap-js';
import { PriceDifference, PriceMap } from '../interfaces';
import { logger } from './logger';

export function computePairwiseDifference(priceMap: PriceMap): PriceDifference[] {
  // Min-heap to maintain top 100 differences by percentageDifference
  const heap = new MinHeap<PriceDifference>((diff: PriceDifference) => diff.percentageDifference);
  const maxHeapSize = 100;

  for (const symbol in priceMap) {
    const prices = priceMap[symbol];
    for (let i = 0; i < prices.length; i++) {
      for (let j = i + 1; j < prices.length; j++) {
        const price1 = parseFloat(prices[i].price);
        const price2 = parseFloat(prices[j].price);
        if (isNaN(price1) || isNaN(price2)) continue;

        const absoluteDifference = Math.abs(price1 - price2);
        const percentageDifference = Math.abs(((price1 - price2) / price2) * 100);

        const difference: PriceDifference = {
          symbol,
          exchangePair: `${prices[i].exchange} vs ${prices[j].exchange}`,
          absoluteDifference: parseFloat(absoluteDifference.toFixed(4)),
          percentageDifference: parseFloat(percentageDifference.toFixed(4)),
          price1: prices[i].price,
          price2: prices[j].price,
        };

        if (heap.size() < maxHeapSize) {
          heap.push(difference);
        } else if (difference.percentageDifference > heap.peek()!.percentageDifference) {
          heap.pop();
          heap.push(difference);
        }
      }
    }
  }

  // Convert heap to sorted array (descending order)
  const topDifferences = heap
    .toArray()
    .sort((a, b) => b.percentageDifference - a.percentageDifference);

  logger.info(`Returning top ${topDifferences.length} price differences`);
  return topDifferences;
}
