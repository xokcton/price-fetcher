import { Router } from 'express';
import { priceController } from '../controllers/priceController';

export const priceRouter = Router();

priceRouter.get('/prices', priceController);
