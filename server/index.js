const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    }).on('error', reject);
  });
}

app.get('/', (req, res) => res.json({ status: 'ok', app: 'PortfolioTrack API' }));
app.get('/health', (req, res) => res.json({ status: 'healthy', uptime: process.uptime() }));

// Stock / ETF price
app.get('/api/price/:symbol', async (req, res) => {
  try {
    const sym = req.params.symbol.toUpperCase();
    const data = await httpsGet(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`);
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return res.status(404).json({ error: 'Not found' });
    const prev = meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice;
    res.json({ symbol: sym, price: meta.regularMarketPrice, change: meta.regularMarketPrice - prev, changePercent: ((meta.regularMarketPrice - prev) / prev) * 100, name: meta.shortName });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Crypto price
const CRYPTO_IDS = { BTC:'bitcoin',ETH:'ethereum',SOL:'solana',ADA:'cardano',DOGE:'dogecoin',XRP:'ripple',BNB:'binancecoin',AVAX:'avalanche-2',MATIC:'matic-network',LTC:'litecoin',DOT:'polkadot',LINK:'chainlink' };
app.get('/api/crypto/:symbol', async (req, res) => {
  try {
    const sym = req.params.symbol.toUpperCase();
    const id = CRYPTO_IDS[sym];
    if (!id) return res.status(404).json({ error: 'Unknown crypto symbol' });
    const data = await httpsGet(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`);
    if (!data?.[id]) return res.status(404).json({ error: 'Not found' });
    res.json({ symbol: sym, price: data[id].usd, change: (data[id].usd * data[id].usd_24h_change) / 100, changePercent: data[id].usd_24h_change });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Symbol search
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    const data = await httpsGet(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`);
    res.json((data?.quotes || []).map(r => ({ symbol: r.symbol, name: r.shortname || r.longname || r.symbol, type: r.quoteType })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`PortfolioTrack API running on port ${PORT}`));
