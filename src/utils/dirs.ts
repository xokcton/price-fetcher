import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export function ensureLogsDirectory(): void {
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    logger.info(`Created logs directory at ${logsDir}`);
  }
}
