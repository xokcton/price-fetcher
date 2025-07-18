import { Router } from 'express';
import { priceController, priceDifferences } from '../controllers/priceController';

export const priceRouter = Router();

priceRouter.get('/prices', priceController);
priceRouter.get('/price-differences', priceDifferences);
