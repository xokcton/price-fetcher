declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    PRICE_FETCHING_SCHEDULE?: string;
    BINANCE_API_KEY?: string;
    BINANCE_SECRET?: string;
    BYBIT_API_KEY?: string;
    BYBIT_SECRET?: string;
    MEXC_API_KEY?: string;
    MEXC_SECRET?: string;
    GATE_API_KEY?: string;
    GATE_SECRET?: string;
    BITGET_API_KEY?: string;
    BITGET_SECRET?: string;
    OKX_API_KEY?: string;
    OKX_SECRET?: string;
    OKX_PASSPHRASE?: string;
    BINGX_API_KEY?: string;
    BINGX_SECRET?: string;
    // and so on
  }
}
