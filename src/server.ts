import app from './app';
import { ensureLogsDirectory } from './utils/dirs';
import { logger } from './utils/logger';

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(PORT, () => {
  ensureLogsDirectory();
  logger.info(`Server running on port ${PORT}`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
