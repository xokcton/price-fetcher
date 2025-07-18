import { PriceDifference, PriceMap } from '../interfaces';

export function computePairwiseDifference(priceMap: PriceMap): PriceDifference[] {
  const differences: PriceDifference[] = [];

  // Compute pairwise differences for each symbol
  for (const symbol in priceMap) {
    const prices = priceMap[symbol];
    for (let i = 0; i < prices.length; i++) {
      for (let j = i + 1; j < prices.length; j++) {
        const price1 = parseFloat(prices[i].price);
        const price2 = parseFloat(prices[j].price);
        if (isNaN(price1) || isNaN(price2)) continue; // Skip invalid prices

        const absoluteDifference = Math.abs(price1 - price2);
        const percentageDifference = Math.abs(((price1 - price2) / price2) * 100);

        differences.push({
          symbol,
          exchangePair: `${prices[i].exchange} vs ${prices[j].exchange}`,
          absoluteDifference: parseFloat(absoluteDifference.toFixed(4)),
          percentageDifference: parseFloat(percentageDifference.toFixed(4)),
        });
      }
    }
  }

  return differences;
}
