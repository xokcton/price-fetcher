import { Request, Response } from 'express';
import { /*getPrices,*/ fetchAllPrices, getPriceDifferences } from '../services/exchangeService';
import { logger } from '../utils/logger';

export async function priceController(req: Request, res: Response) {
  try {
    // const prices = await getPrices();
    const prices = await fetchAllPrices();
    res.json({
      timestamp: new Date().toISOString(),
      prices,
    });
  } catch (error) {
    logger.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}

export async function priceDifferences(req: Request, res: Response) {
  try {
    const differences = await getPriceDifferences();
    res.json({
      timestamp: new Date().toISOString(),
      differences,
    });
  } catch (error) {
    logger.error('Error fetching price differences:', error);
    res.status(500).json({ error: 'Failed to fetch price differences' });
  }
}
