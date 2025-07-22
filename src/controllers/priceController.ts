import { Request, Response } from 'express';
import { getPrices } from '../services/exchangeService';
import { getPriceDifferences } from '../services/priceService';
import { logger } from '../utils/logger';

export async function priceController(req: Request, res: Response) {
  try {
    const {
      sortBy = 'symbol',
      sortOrder = 'asc',
      page = '1',
      perPage = '15',
      search = '',
    } = req.query;
    const { prices, total } = await getPrices(
      sortBy as string,
      sortOrder as string,
      parseInt(page as string),
      parseInt(perPage as string),
      search as string,
    );
    res.render('prices', {
      prices,
      timestamp: new Date().toISOString(),
      sortBy,
      sortOrder,
      page: parseInt(page as string),
      perPage: parseInt(perPage as string),
      total,
      search,
    });
  } catch (error) {
    logger.error(`Error rendering /api/prices: ${error}`);
    res.status(500).send('Failed to render prices page');
  }
}

export async function priceDifferences(req: Request, res: Response) {
  try {
    const {
      sortBy = 'netProfit',
      sortOrder = 'desc',
      page = '1',
      perPage = '15',
      search = '',
    } = req.query;
    const { differences, total } = await getPriceDifferences(
      sortBy as string,
      sortOrder as string,
      parseInt(page as string),
      parseInt(perPage as string),
      search as string,
    );
    res.render('price-differences', {
      differences,
      timestamp: new Date().toISOString(),
      sortBy,
      sortOrder,
      page: parseInt(page as string),
      perPage: parseInt(perPage as string),
      total,
      search,
    });
  } catch (error) {
    logger.error(`Error rendering /api/price-differences: ${error}`);
    res.status(500).send('Failed to render price differences page');
  }
}
