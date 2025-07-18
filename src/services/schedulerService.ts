import cron from 'node-cron';
import { logger } from '../utils/logger';
import { fetchAllPrices } from './exchangeService';

export function startScheduler(): void {
  // Schedule price fetching every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await fetchAllPrices();
  });

  // Initial fetch when scheduler starts
  fetchAllPrices().then(() => {
    logger.info('Initial price fetch completed');
  });
}
