import cors from 'cors';
import express, { Express } from 'express';
import { priceRouter } from './routers/priceRouter';
// import { startScheduler } from './services/schedulerService';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', priceRouter);

// Start scheduler for price fetching
// startScheduler();

export default app;
