/**
 * Vercel Serverless Function — GET /api/tickers
 *
 * Returns live Nepal market ticker data:
 *   - Gold (10g, NPR)   — scraped from fenegosida.org
 *   - Silver (10g, NPR) — scraped from fenegosida.org
 *   - USD/NPR           — open.er-api.com
 *   - BTC               — Binance public API
 *   - NEPSE             — static placeholder (WASM-protected site)
 *
 * Deploy: vercel --cwd ticker-api
 */

const https = require('https');

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Fetch URL as text with a hard Promise.race timeout. */
function fetchText(url, timeoutMs = 7000) {
  const request = new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/json,*/*;q=0.9',
      },
    }, (res) => {
      // Follow single-hop redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchText(res.headers.location, timeoutMs));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
  });

  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout: ${url}`)), timeoutMs)
  );

  return Promise.race([request, timer]);
}

async function fetchJSON(url) {
  const text = await fetchText(url);
  return JSON.parse(text);
}

// ─── scrapers ─────────────────────────────────────────────────────────────────

/**
 * Scrape FENEGOSIDA for official Nepal gold & silver prices (per 10g, NPR).
 * The page embeds Google Charts data: ['Day','1 Tola','10 Grm'],['18',296100,253860],...
 * We parse the last (most recent) entry to get today's official per-tola gold price.
 */
async function fetchGoldSilver() {
  try {
    const html = await fetchText('https://www.fenegosida.org/');

    // Parse chart JS data array — multiple charts are on the page:
    //   Gold chart:   ['18', 296100, 253860]  (values > 100,000)
    //   Silver chart: ['17',   4810,   4124]  (values < 10,000)
    const chartMatches = [...html.matchAll(/\['(\d+)',(\d+),(\d+)\]/g)];
    if (chartMatches.length === 0) throw new Error('Chart data not found in page');

    // Pick the most recent entry from each chart by filtering on value range
    const goldEntries   = chartMatches.filter(m => parseInt(m[2]) > 100000);
    const silverEntries = chartMatches.filter(m => parseInt(m[2]) > 1000 && parseInt(m[2]) < 50000);

    const goldPerTola   = goldEntries.length   ? parseFloat(goldEntries[goldEntries.length - 1][2])     : null;
    const silverPerTola = silverEntries.length ? parseFloat(silverEntries[silverEntries.length - 1][2]) : null;

    console.log(`[FENEGOSIDA] Gold/tola: ${goldPerTola}, Silver/tola: ${silverPerTola}`);
    return { goldNPR: goldPerTola, silverNPR: silverPerTola };
  } catch (err) {
    console.error('[FENEGOSIDA] error:', err.message);
    return { goldNPR: null, silverNPR: null };
  }
}

/**
 * Scrape NEPSE closing index from sharesansar.com.
 * The homepage reliably contains a news headline like:
 *   "NEPSE Index Gains/Loses ... to Close at 2,738.72 Points"
 * This gives the previous trading day's official closing value.
 */
async function fetchNEPSE() {
  try {
    const html = await fetchText('https://www.sharesansar.com/');
    const m = html.match(/NEPSE Index[^<"]{0,120}?(\d{1,2},\d{3}\.\d{2})\s*Points/i);
    if (!m) throw new Error('NEPSE pattern not found');
    const value = parseFloat(m[1].replace(/,/g, ''));
    console.log(`[SHARESANSAR] NEPSE: ${value}`);
    return { value };
  } catch (err) {
    console.error('[SHARESANSAR] NEPSE error:', err.message);
    return { value: null };
  }
}

// ─── build tickers ────────────────────────────────────────────────────────────

async function buildTickers() {
  const [goldSilver, nepse, exData, btcData] = await Promise.allSettled([
    fetchGoldSilver(),
    fetchNEPSE(),
    fetchJSON('https://open.er-api.com/v6/latest/USD'),
    // CoinGecko free API — works from all regions including Vercel US
    fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&precision=0'),
  ]);

  // ── USD/NPR ──────────────────────────────────────────────────────────────
  const nprRate = exData.status === 'fulfilled'
    ? (exData.value?.rates?.NPR ?? 133.50)
    : 133.50;

  // ── BTC via CoinGecko ────────────────────────────────────────────────────
  let btcValue = '$—', btcChange = '+0.0%', btcUp = true;
  if (btcData.status === 'fulfilled') {
    const coin = btcData.value?.bitcoin;
    const price = coin?.usd;
    const chg   = coin?.usd_24h_change;
    if (price && !isNaN(price)) {
      btcValue = '$' + Number(price).toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    if (chg != null && !isNaN(chg)) {
      btcChange = (chg >= 0 ? '+' : '') + Number(chg).toFixed(2) + '%';
      btcUp     = chg >= 0;
    }
  }

  // ── Gold & Silver — FENEGOSIDA official rates ─────────────────────────────
  const { goldNPR, silverNPR } = goldSilver.status === 'fulfilled'
    ? goldSilver.value
    : { goldNPR: null, silverNPR: null };

  const fmtNPR = (v) => (v != null && !isNaN(v))
    ? 'रु ' + Math.round(v).toLocaleString('en-IN')
    : 'रु —';

  return [
    {
      label:  'NEPSE',
      value:  nepse.status === 'fulfilled' && nepse.value?.value
                ? nepse.value.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '—',
      change: '+0.0%',
      up:     true,
      note:   nepse.status === 'fulfilled' && nepse.value?.value ? 'sharesansar' : 'unavailable',
    },
    {
      label:  'GOLD/tola',
      value:  fmtNPR(goldNPR),
      change: '+0.0%',   // FENEGOSIDA sets rate once daily — no intraday change
      up:     true,
      note:   goldNPR ? 'fenegosida' : 'unavailable',
    },
    {
      label:  'SILVER/tola',
      value:  fmtNPR(silverNPR),
      change: '+0.0%',
      up:     true,
      note:   silverNPR ? 'fenegosida' : 'unavailable',
    },
    {
      label:  'USD/NPR',
      value:  'रु ' + nprRate.toFixed(2),
      change: '+0.0%',
      up:     true,
    },
    {
      label:  'BTC',
      value:  btcValue,
      change: btcChange,
      up:     btcUp,
    },
  ];
}

// ─── Vercel handler ───────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // Cache 60s on CDN; client always gets max 1-minute-old data
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const tickers = await buildTickers();
    res.status(200).json({
      ok: true,
      tickers,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[tickers] handler error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

