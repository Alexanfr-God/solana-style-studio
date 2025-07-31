
export const COINMARKETCAP_ICONS: Record<string, string> = {
  BTC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1.png',
  ETH: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
  SOL: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
  USDC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
  USDT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
  BNB: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png',
  ADA: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png',
  DOT: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png',
  MATIC: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
  AVAX: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  BASE: 'https://s2.coinmarketcap.com/static/img/coins/64x64/9195.png',
  SUI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png',
};

// Fallback function to get icon URL with placeholder
export const getCoinIcon = (symbol: string): string => {
  return COINMARKETCAP_ICONS[symbol.toUpperCase()] || '/placeholder.svg';
};
