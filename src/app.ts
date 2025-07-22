import cors from 'cors';
import express, { Express } from 'express';
import path from 'path';
import { priceRouter } from './routers/priceRouter';
import { startScheduler } from './services/schedulerService';

const app: Express = express();

// Set up Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (JS, CSS)
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', priceRouter);

// Start scheduler for price fetching
startScheduler();

export default app;
