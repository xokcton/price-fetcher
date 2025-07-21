import MinHeap from 'heap-js';
import { PriceDifference, PriceMap } from '../interfaces';
import { exchangeFactory } from '../services/exchangeService';
import { logger } from './logger';

export function computeNetProfit(priceMap: PriceMap): PriceDifference[] {
  // Min-heap to maintain top 100 differences by netProfit
  const heap = new MinHeap<PriceDifference>((diff) => diff.netProfit ?? -Infinity);
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

        // Fetch fees for the exchanges
        const firstExchange = prices[i].exchange;
        const secondExchange = prices[j].exchange;
        const feeStructure1 = exchangeFactory.getFeeStructure(firstExchange);
        const feeStructure2 = exchangeFactory.getFeeStructure(secondExchange);

        const normalizedSymbol = symbol; // Already normalized to BTC/USDT
        const currency = symbol.split('/')[0]; // e.g., BTC from BTC/USDT

        const buyCommissionFirstExchange =
          feeStructure1?.tradingFees[normalizedSymbol]?.taker ?? null;
        const sellCommissionSecondExchange =
          feeStructure2?.tradingFees[normalizedSymbol]?.taker ?? null;
        const withdrawCommissionFirstExchange = feeStructure1?.withdrawalFees[currency] ?? null;

        // Calculate net profit
        let netProfit: number | null = null;
        if (
          buyCommissionFirstExchange !== null &&
          sellCommissionSecondExchange !== null &&
          withdrawCommissionFirstExchange !== null
        ) {
          const buyFee = price1 * buyCommissionFirstExchange;
          const sellFee = price2 * sellCommissionSecondExchange;
          const withdrawFee = withdrawCommissionFirstExchange * price1; // Convert to USDT
          netProfit = absoluteDifference - (buyFee + sellFee + withdrawFee);
          netProfit = parseFloat(netProfit.toFixed(4)); // Round to 4 decimals
        }

        const difference: PriceDifference = {
          symbol,
          exchangePair: `${firstExchange} vs ${secondExchange}`,
          absoluteDifference: parseFloat(absoluteDifference.toFixed(4)),
          percentageDifference: parseFloat(percentageDifference.toFixed(4)),
          price1: prices[i].price,
          price2: prices[j].price,
          buyCommissionFirstExchange,
          sellCommissionSecondExchange,
          withdrawCommissionFirstExchange,
          netProfit,
        };

        if (netProfit !== null && netProfit > 0) {
          if (heap.size() < maxHeapSize) {
            heap.push(difference);
          } else if (netProfit > (heap.peek()!.netProfit ?? -Infinity)) {
            heap.pop();
            heap.push(difference);
          }
        }
      }
    }
  }

  // Extract top differences, filter positive netProfit, and sort by netProfit descending
  const topDifferences = heap
    .toArray()
    .filter((diff) => diff.netProfit !== null && diff.netProfit > 0)
    .sort((a, b) => (b.netProfit ?? -Infinity) - (a.netProfit ?? -Infinity));

  logger.info(
    `Returning ${topDifferences.length} price differences with positive net profit, sorted by net profit descending`,
  );
  return topDifferences;
}
