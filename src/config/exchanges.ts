import { ExchangeConfig } from '../interfaces';

export const exchangeConfigs: ExchangeConfig[] = [
  {
    id: 'binance',
    name: 'Binance',
    apiKey: process.env.BINANCE_API_KEY || '',
    secret: process.env.BINANCE_SECRET || '',
  },
  {
    id: 'bybit',
    name: 'Bybit',
    apiKey: process.env.BYBIT_API_KEY || '',
    secret: process.env.BYBIT_SECRET || '',
    options: { defaultType: 'spot' }, // Use spot market for Bybit
  },
  {
    id: 'mexc',
    name: 'MEXC',
    apiKey: process.env.MEXC_API_KEY || '',
    secret: process.env.MEXC_SECRET || '',
  },
  {
    id: 'gate',
    name: 'Gate.io',
    apiKey: process.env.GATE_API_KEY || '',
    secret: process.env.GATE_SECRET || '',
  },
  {
    id: 'bitget',
    name: 'Bitget',
    apiKey: process.env.BITGET_API_KEY || '',
    secret: process.env.BITGET_SECRET || '',
  },
  {
    id: 'okx',
    name: 'OKX',
    apiKey: process.env.OKX_API_KEY || '',
    secret: process.env.OKX_SECRET || '',
    passphrase: process.env.OKX_PASSPHRASE || '',
  },
  {
    id: 'bingx',
    name: 'BingX',
    apiKey: process.env.BINGX_API_KEY || '',
    secret: process.env.BINGX_SECRET || '',
  },
  // Add more exchanges here, e.g., { id: 'kraken', name: 'Kraken', apiKey: 'YOUR_API_KEY', secret: 'YOUR_SECRET' }
];
