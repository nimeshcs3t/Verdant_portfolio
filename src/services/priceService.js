const API = process.env.EXPO_PUBLIC_API_URL || '';

const CRYPTO_IDS = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', ADA: 'cardano',
  DOGE: 'dogecoin', AVAX: 'avalanche-2', XRP: 'ripple', LTC: 'litecoin',
  BNB: 'binancecoin', MATIC: 'matic-network', DOT: 'polkadot', LINK: 'chainlink',
};

async function get(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export async function fetchPrice(symbol, assetType) {
  // Try Railway backend first (avoids CORS)
  if (API) {
    const path = assetType === 'CRYPTO' ? `/api/crypto/${symbol}` : `/api/price/${symbol}`;
    const d = await get(API + path);
    if (d?.price) return d;
  }
  // CoinGecko direct for crypto
  if (assetType === 'CRYPTO') {
    const id = CRYPTO_IDS[symbol.toUpperCase()];
    if (id) {
      const d = await get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`);
      if (d?.[id]) return { symbol, price: d[id].usd, change: (d[id].usd * d[id].usd_24h_change) / 100, changePercent: d[id].usd_24h_change };
    }
  }
  // Yahoo Finance direct for stocks/ETF
  const d = await get(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`);
  const meta = d?.chart?.result?.[0]?.meta;
  if (meta) {
    const prev = meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice;
    return { symbol, price: meta.regularMarketPrice, change: meta.regularMarketPrice - prev, changePercent: ((meta.regularMarketPrice - prev) / prev) * 100, name: meta.shortName };
  }
  return null;
}

export async function fetchAllPrices(holdings) {
  const results = await Promise.all(holdings.map(h => fetchPrice(h.symbol, h.type).then(d => [h.symbol, d])));
  const map = {};
  results.forEach(([sym, d]) => { if (d) map[sym] = d; });
  return map;
}

export async function searchSymbols(q) {
  if (API) {
    const d = await get(`${API}/api/search?q=${encodeURIComponent(q)}`);
    if (d) return d;
  }
  const d = await get(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`);
  return (d?.quotes || []).map(r => ({ symbol: r.symbol, name: r.shortname || r.longname || r.symbol, type: r.quoteType }));
}
