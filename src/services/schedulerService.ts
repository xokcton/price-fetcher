import cron from 'node-cron';
import { logger } from '../utils/logger';
import { fetchAllPrices } from './exchangeService';

const schedule = process.env.PRICE_FETCHING_SCHEDULE || '*/5 * * * *';

export function startScheduler(): void {
  cron.schedule(schedule, async () => {
    await fetchAllPrices();
  });

  // Initial fetch when scheduler starts
  fetchAllPrices().then(() => {
    logger.info('Initial price fetch completed');
  });
}
