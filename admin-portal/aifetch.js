// ─────────────────────────────────────────────────────────────────
// Lucid Newsroom — AI Fetch Module
// Fetches RSS feeds, clusters by topic, summarizes via Free AI
// ─────────────────────────────────────────────────────────────────

const AI_URL = 'https://text.pollinations.ai/';
const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json';

// ─── SOURCE LIBRARY (mirrors src/data/sources.js) ────────────────
// Keep this in sync with sources.js when adding/removing sources.
const DEFAULT_SOURCES = [
  // ── NEPALI ───────────────────────────────────────────────────
  { id: 'kantipur', name: 'Kantipur', sub: 'National Daily', letter: 'K', logoUrl: 'https://ekantipur.com/assets/images/kantipur-logo.svg', rssUrl: 'https://ekantipur.com/feed', country: 'NP', enabled: true },
  { id: 'onlinekhabar', name: 'Online Khabar', sub: 'Digital First', letter: 'O', logoUrl: 'https://www.onlinekhabar.com/wp-content/themes/onlinekhabar-2021/img/logo-white.svg', rssUrl: 'https://www.onlinekhabar.com/feed', country: 'NP', enabled: true },
  { id: 'ratopati', name: 'Ratopati', sub: 'Breaking News', letter: 'R', logoUrl: 'https://npcdn.ratopati.com/media/setting/ratopati-logo_qQKWIp37FR.png', rssUrl: 'https://ratopati.com/rss', country: 'NP', enabled: true },
  { id: 'setopati', name: 'Setopati', sub: 'Social & Political', letter: 'S', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=setopati.com', rssUrl: 'https://www.setopati.com/feed', country: 'NP', enabled: false },
  { id: 'khabarhub', name: 'Khabarhub', sub: 'Mainstream Bias-free', letter: 'K', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=khabarhub.com', rssUrl: 'https://english.khabarhub.com/feed/', country: 'NP', enabled: false },
  { id: 'nepalnews', name: 'Nepal News', sub: 'Oldest Digital', letter: 'N', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=nepalnews.com', rssUrl: 'https://www.nepalnews.com/rss', country: 'NP', enabled: false },
  { id: 'himalayan', name: 'The Himalayan', sub: 'English Daily', letter: 'H', logoUrl: 'https://thehimalayantimes.com/theme_himalayantimes/images/favicon.png', rssUrl: 'https://thehimalayantimes.com/feed/', country: 'NP', enabled: false },
  { id: 'kathmandupost', name: 'Kathmandu Post', sub: 'Premier English', letter: 'K', logoUrl: 'https://jcss-cdn.kathmandupost.com/assets/images/device-icon/android-icon-192x192.png', rssUrl: 'https://kathmandupost.com/rss', country: 'NP', enabled: false },
  { id: 'myrepublica', name: 'My Republica', sub: 'Investigative', letter: 'M', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=myrepublica.nagariknetwork.com', rssUrl: 'https://myrepublica.nagariknetwork.com/rss/', country: 'NP', enabled: false },
  { id: 'annapurnapost', name: 'Annapurna Post', sub: 'Visual News', letter: 'A', logoUrl: 'https://snowberry.prixacdn.net/media/gallery_folder/anm-fav_qoxqP25etb_w9atwz27jbcg7tngui3nbrxonkizics7ahdk4abp4xmtzjemqdmsswgktnlo.ico', rssUrl: 'https://annapurnapost.com/rss', country: 'NP', enabled: false },
  { id: 'ujyaalo', name: 'Ujyaalo', sub: 'Radio Network', letter: 'U', logoUrl: 'https://unncdn.prixa.net/media/albums/favicon_ek1TeKvY53.jpg', rssUrl: 'https://ujyaalo.com/feed/', country: 'NP', enabled: false },
  { id: 'rssnepal', name: 'RSS Nepal', sub: 'News Agency', letter: 'R', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=rss.com.np', rssUrl: 'https://www.rss.com.np/feed', country: 'NP', enabled: false },
  { id: 'nagarik', name: 'Nagarik News', sub: 'Public Affairs', letter: 'N', logoUrl: 'https://jcss.nagariknewscdn.com/images/favicon.png', rssUrl: 'https://nagariknews.nagariknetwork.com/feed/', country: 'NP', enabled: false },
  { id: 'gorkhapatra', name: 'Gorkhapatra', sub: "Nepal's Oldest Paper", letter: 'G', logoUrl: 'https://gorkhapatraonline.com/landing-assets/img/favicon.png', rssUrl: 'https://gorkhapatraonline.com/rss', country: 'NP', enabled: false },
  { id: 'nepalitimes', name: 'Nepali Times', sub: 'In-depth Weekly', letter: 'N', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=nepalitimes.com', rssUrl: 'https://www.nepalitimes.com/feed/', country: 'NP', enabled: false },
  { id: 'imaginekhabar', name: 'Imagine Khabar', sub: 'Digital Native', letter: 'I', logoUrl: 'https://www.imagekhabar.com/wp-content/uploads/2020/06/cropped-ALPHA-LOGO-2-150x150.png', rssUrl: 'https://imaginekhabar.com/rss', country: 'NP', enabled: false },
  // ── INTERNATIONAL ─────────────────────────────────────────────
  { id: 'bbc', name: 'BBC News', sub: 'British Broadcasting', letter: 'B', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=bbc.com', rssUrl: 'https://feeds.bbci.co.uk/news/rss.xml', country: 'INT', enabled: true },
  { id: 'aljazeera', name: 'Al Jazeera', sub: 'Qatar-based Global', letter: 'A', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=aljazeera.com', rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml', country: 'INT', enabled: true },
  { id: 'guardian', name: 'The Guardian', sub: 'UK Independent', letter: 'G', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=theguardian.com', rssUrl: 'https://www.theguardian.com/world/rss', country: 'INT', enabled: true },
  { id: 'npr', name: 'NPR News', sub: 'US Public Radio', letter: 'N', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=npr.org', rssUrl: 'https://feeds.npr.org/1001/rss.xml', country: 'INT', enabled: true },
  { id: 'cnn', name: 'CNN', sub: 'Cable News Network', letter: 'C', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=cnn.com', rssUrl: 'http://rss.cnn.com/rss/edition.rss', country: 'INT', enabled: false },
  { id: 'thehindu', name: 'The Hindu', sub: 'South Asian Persp.', letter: 'H', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=thehindu.com', rssUrl: 'https://www.thehindu.com/news/international/?service=rss', country: 'INT', enabled: false },
  { id: 'ndtv', name: 'NDTV', sub: 'Indian National', letter: 'N', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=ndtv.com', rssUrl: 'https://feeds.feedburner.com/ndtvnews-top-stories', country: 'INT', enabled: false },
  { id: 'dw', name: 'DW News', sub: 'Deutsche Welle', letter: 'D', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=dw.com', rssUrl: 'https://rss.dw.com/rdf/rss-en-world', country: 'INT', enabled: false },
  { id: 'rfi', name: 'RFI English', sub: "Radio France Int'l", letter: 'R', logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=rfi.fr', rssUrl: 'https://www.rfi.fr/en/rss', country: 'INT', enabled: false },
];

// ─── MODULE STATE ────────────────────────────────────────────────
const AF_VERSION = '9'; // bump when source schema changes
if (localStorage.getItem('af_version') !== AF_VERSION) {
  localStorage.removeItem('af_sources'); // clear stale old format
  localStorage.setItem('af_version', AF_VERSION);
}

const AF = {
  sources: JSON.parse(localStorage.getItem('af_sources') || 'null') || DEFAULT_SOURCES.map(s => ({ ...s })),
  freshness: 24,
  results: [],
  running: false,
  stopRequested: false,
};

function afPersist() {
  localStorage.setItem('af_sources', JSON.stringify(AF.sources));
}

// ─────────────────────────────────────────────────────────────────
// AIFETCH — main controller (global so inline onclick works)
// ─────────────────────────────────────────────────────────────────
const AIFETCH = {

  // Called by auth handler after login
  listen: () => {
    AIFETCH.renderSources();
    AIFETCH.renderResults();
  },

  // ── SOURCE MANAGER ───────────────────────────────────────────
  renderSources: () => {
    const wrap = document.getElementById('af-sources-list');
    if (!wrap) return;

    const nepali = AF.sources.filter(s => s.country === 'NP');
    const intl = AF.sources.filter(s => s.country === 'INT');
    const custom = AF.sources.filter(s => !s.country);

    const renderGroup = (list, label) => {
      if (!list.length) return '';
      const globalIdx = (s) => AF.sources.indexOf(s);
      return `
        <div class="af-source-group-label">${label}</div>
        ${list.map(s => {
        const i = globalIdx(s);
        const logoHtml = s.logoUrl
          ? `<img src="${escapeAttr(s.logoUrl)}" class="af-source-logo" onerror="this.style.display='none'" />`
          : `<span class="af-source-letter">${escapeHtml(s.letter || s.name[0])}</span>`;
        return `
          <div class="af-source-row">
            <label class="af-source-label">
              <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="AIFETCH.toggleSource(${i},this.checked)" />
              <span class="af-logo-wrap">${logoHtml}</span>
              <span class="af-source-name">${escapeHtml(s.name)}</span>
              <span class="af-source-sub">${escapeHtml(s.sub || '')}</span>
            </label>
            <span class="af-source-url" title="${escapeAttr(s.rssUrl || s.url || '')}">${escapeHtml(s.rssUrl || s.url || '')}</span>
            <button class="af-remove-btn" onclick="AIFETCH.removeSource(${i})" title="Remove">&times;</button>
          </div>`;
      }).join('')}
      `;
    };

    wrap.innerHTML =
      renderGroup(nepali, '🇳🇵 Nepal') +
      renderGroup(intl, '🌐 International') +
      renderGroup(custom, '⚙️ Custom');
  },

  toggleSource: (i, on) => { AF.sources[i].enabled = on; afPersist(); },

  removeSource: (i) => {
    if (!confirm(`Remove "${AF.sources[i].name}"?`)) return;
    AF.sources.splice(i, 1);
    afPersist();
    AIFETCH.renderSources();
  },

  addCustom: () => {
    const nameEl = document.getElementById('af-add-name');
    const urlEl = document.getElementById('af-add-url');
    const name = nameEl.value.trim();
    const url = urlEl.value.trim();
    if (!name || !url) { UI.showToast('Enter both source name and RSS URL', 'error'); return; }
    if (!url.startsWith('http')) { UI.showToast('URL must start with http(s)://', 'error'); return; }
    AF.sources.push({ id: `custom_${Date.now()}`, name, rssUrl: url, enabled: true });
    afPersist();
    AIFETCH.renderSources();
    nameEl.value = '';
    urlEl.value = '';
  },

  setFreshness: (hours, btn) => {
    AF.freshness = parseInt(hours);
    document.querySelectorAll('.af-fresh-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  },

  // ── MAIN PIPELINE ────────────────────────────────────────────
  run: async () => {
    if (AF.running) return;
    const active = AF.sources.filter(s => s.enabled);
    if (!active.length) { UI.showToast('Select at least one source', 'error'); return; }

    AF.running = true;
    AF.stopRequested = false;
    AIFETCH._setBusy(true);
    AIFETCH._resetLog();
    AIFETCH._progress(0, 'Starting…');

    try {
      // ── 1. Fetch RSS ────────────────────────────────────────
      const allArticles = [];
      const cutoff = Date.now() - AF.freshness * 3_600_000;

      for (let i = 0; i < active.length; i++) {
        if (AF.stopRequested) break;
        const src = active[i];
        AIFETCH._progress(Math.round(i / active.length * 30), `Fetching ${src.name}…`);
        try {
          const rss = src.rssUrl || src.url;
          const items = await AIFETCH._fetchRSS(rss, cutoff);
          items.forEach(it => allArticles.push({ ...it, sourceName: src.name, sourceUrl: rss, sourceLogo: src.logoUrl || '' }));
          AIFETCH._log(`✓ ${src.name}: ${items.length} articles`);
        } catch (e) {
          AIFETCH._log(`⚠ ${src.name}: ${e.message}`);
        }
        await AIFETCH._sleep(400);
      }

      if (!allArticles.length) {
        AIFETCH._progress(100, 'No articles found in this time window. Try a wider range.');
        AIFETCH._setBusy(false);
        AF.running = false;
        return;
      }

      AIFETCH._log(`─── Total: ${allArticles.length} articles from ${active.length} sources`);
      AIFETCH._progress(35, `Clustering ${allArticles.length} articles by topic…`);

      // ── 2. Cluster by topic ─────────────────────────────────
      const clusters = await AIFETCH._cluster(allArticles);
      AIFETCH._log(`✓ Found ${clusters.length} topic clusters`);
      AIFETCH._progress(60, `Summarizing ${clusters.length} topic groups…`);

      // ── 3. Summarize each cluster ───────────────────────────
      for (let i = 0; i < clusters.length; i++) {
        if (AF.stopRequested) break;
        AIFETCH._progress(
          60 + Math.round(i / clusters.length * 38),
          `Summarizing ${i + 1}/${clusters.length}: "${clusters[i].topic}"…`
        );
        try {
          const result = await AIFETCH._summarize(clusters[i], allArticles);
          AF.results.unshift(result);
          AIFETCH.renderResults();
        } catch (e) {
          AIFETCH._log(`⚠ Summarize failed for "${clusters[i].topic}": ${e.message}`);
        }
        await AIFETCH._sleep(3000); // Increased sleep to avoid 429
      }

      if (AF.stopRequested) {
        AIFETCH._progress(100, 'Pipeline stopped by user.');
        AIFETCH._log('─── Stopped by user.');
      } else {
        AIFETCH._progress(100, `Done! ${AF.results.length} article(s) ready for review.`);
        AIFETCH._log(`─── Complete. ${AF.results.length} article(s) generated.`);
      }

    } catch (e) {
      AIFETCH._progress(100, `Error: ${e.message}`);
      UI.showToast('Pipeline error: ' + e.message, 'error');
    }

    AF.running = false;
    AIFETCH._setBusy(false);
  },

  // ── RSS FETCH via RSS2JSON ───────────────────────────────────
  _fetchRSS: async (rssUrl, cutoff) => {
    const url = `${RSS2JSON_BASE}?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error(json.message || 'Feed error');
    const items = json.items || [];
    const validItems = items.filter(it => {
      let dStr = it.pubDate || '';
      if (dStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        dStr = dStr.replace(' ', 'T') + 'Z';
      }
      const t = new Date(dStr).getTime();
      // If we can't parse the date, we include it by default so we don't silently lose articles
      return isNaN(t) || t >= cutoff;
    });

    return validItems.map(it => {
      let thumbnail = it.enclosure?.link || it.thumbnail || '';
      // If thumbnail is missing or looks like a tiny WP thumbnail, try extracting from description
      if (!thumbnail || thumbnail.includes('-150x150') || thumbnail.includes('-300x300')) {
        const imgMatch = (it.description || '').match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (imgMatch) thumbnail = imgMatch[1];
      }
      return {
        title: (it.title || '').replace(/<[^>]+>/g, '').trim(),
        description: (it.description || '').replace(/<[^>]+>/g, '').slice(0, 600).trim(),
        link: it.link || '',
        pubDate: it.pubDate || '',
        thumbnail: thumbnail,
      };
    });
  },

  // ── TOPIC CLUSTERING ─────────────────────────────────────────
  // Batches articles in groups of 15 (reduced from 25 to avoid 524 timeouts)
  // Always uses local 0-based indices then remaps to global after.
  _cluster: async (articles) => {
    const BATCH = 15; // smaller batch = shorter prompt = faster response, fewer timeouts
    const allClusters = [];
    let offset = 0;

    while (offset < articles.length) {
      if (AF.stopRequested) break;
      const batch = articles.slice(offset, offset + BATCH);
      const list = batch.map((a, i) => `[${i}] ${a.title.slice(0, 80)}`).join('\n');
      const prompt = `Group these ${batch.length} headlines by news event. One cluster = one event. Every index must appear.\nHEADLINES:\n${list}\nJSON only: {"clusters":[{"topic":"label","indices":[0,1]}]}`;

      let clustered = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const raw = await AIFETCH._llm(prompt);
          const json = AIFETCH._json(raw);
          const valid = (json.clusters || [])
            .filter(c => Array.isArray(c.indices) && c.indices.length)
            .map(c => ({
              topic: c.topic,
              indices: c.indices.map(li => offset + li).filter(gi => gi < articles.length),
            }))
            .filter(c => c.indices.length);

          if (valid.length > 0) {
            allClusters.push(...valid);
            clustered = true;
            break;
          }
        } catch (e) {
          AIFETCH._log(`⚠ Cluster attempt ${attempt + 1} failed: ${e.message.slice(0, 80)}`);
          if (attempt === 0) await AIFETCH._sleep(2500);
        }
      }

      if (!clustered) {
        AIFETCH._log(`⚠ Clustering failed for batch at offset ${offset} — using individual clusters`);
        batch.forEach((a, i) => allClusters.push({ topic: a.title.slice(0, 40), indices: [offset + i] }));
      }

      offset += BATCH;
      if (offset < articles.length) await AIFETCH._sleep(800);
    }

    return allClusters;
  },


  // ── SUMMARIZE one cluster (2-step: meta JSON + EN body only) ───
  // Nepali body uses EN body as fallback – saves 1 API call per article (~33% faster)
  _summarize: async (cluster, all) => {
    const arts = cluster.indices.map(i => all[i]).filter(Boolean);
    const names = [...new Set(arts.map(a => a.sourceName))];
    // Trim snippet to 300 chars to keep prompt small & avoid 524 timeouts
    const text = arts.map(a =>
      `SOURCE: ${a.sourceName}\nHEADLINE: ${a.title}\nSNIPPET: ${(a.description || '').slice(0, 300)}`
    ).join('\n\n---\n\n');

    // ── Step 1: metadata + bilingual summaries (one JSON call) ───
    const metaPrompt = `You are a bilingual news editor. Read these ${arts.length} article(s):\n\n${text}\n\nReply ONLY with valid JSON (no markdown, no extra text):\n{"title_en":"headline max 12 words","title_np":"Nepali headline max 12 words","category":"Politics|Technology|Business|Science|Health|Sports|Entertainment|World|Environment|Culture","tags":["t1","t2","t3"],"summary_en":"60-65 word English summary, neutral factual","summary_np":"60-65 word Nepali summary, neutral factual"}`;

    const metaRaw = await AIFETCH._llm(metaPrompt);
    let meta = AIFETCH._json(metaRaw);

    // Retry meta once if summary_en is empty
    if (!meta.summary_en || AIFETCH._wc(meta.summary_en) < 15) {
      AIFETCH._log(`↻ Retrying meta for "${cluster.topic}"...`);
      await AIFETCH._sleep(2000);
      try {
        const meta2 = AIFETCH._json(await AIFETCH._llm(metaPrompt));
        if (AIFETCH._wc(meta2.summary_en || '') > AIFETCH._wc(meta.summary_en || '')) meta = meta2;
      } catch (e) { AIFETCH._log(`⚠ Meta retry failed: ${e.message}`); }
    }

    await AIFETCH._sleep(1200); // short gap before body call

    // ── Step 2: English body only (Nepali body will use EN as fallback) ───
    const bodyPromptEn = `You are a neutral journalist. Based on these sources:\n\n${text}\n\nTask: Write a comprehensive, detailed news article body of AT LEAST 400 words. 
If the source material is short, you MUST expand on it by adding relevant geopolitical context, historical background, explaining the implications, and elaborating on the "why" and "how". Do NOT just repeat the source.
Format: Exactly 4-5 well-developed paragraphs separated by blank lines. No title, no headers, no word counts, no meta. Start directly with the news.`;

    let body_en = '';
    try {
      const bodyRawEn = await AIFETCH._llmText(bodyPromptEn);
      body_en = AIFETCH._extractBody(bodyRawEn) || bodyRawEn.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, '').trim();
    } catch (e) {
      AIFETCH._log(`⚠ English body failed: ${e.message}`);
    }

    // Retry EN body once if too short (< 200 words)
    if (!body_en || AIFETCH._wc(body_en) < 200) {
      AIFETCH._log(`↻ Retrying English body for "${cluster.topic}" (was ${AIFETCH._wc(body_en)} words)...`);
      await AIFETCH._sleep(3000);
      try {
        const retryRaw = await AIFETCH._llmText(bodyPromptEn + "\nCRITICAL: The previous attempt was too short. You MUST generate over 400 words by adding deep context and analysis.");
        const retryBody = AIFETCH._extractBody(retryRaw) || retryRaw.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, '').trim();
        if (AIFETCH._wc(retryBody) > AIFETCH._wc(body_en)) body_en = retryBody;
      } catch (e) { AIFETCH._log(`⚠ English body retry failed: ${e.message}`); }
    }

    // Log warnings
    const wS = AIFETCH._wc(meta.summary_en || '');
    const wB = AIFETCH._wc(body_en);
    if (wS < 55 || wB < 250) {
      AIFETCH._log(`⚠ Word count low for "${cluster.topic}": summary_en=${wS} words, body_en=${wB} words`);
    }

    // ── Step 3: Fetch High-Res Image from Source ────────────
    let highResImage = arts.find(a => a.thumbnail)?.thumbnail || '';
    
    // Attempt to scrape High-Res Image for the main article in the cluster
    if (arts[0]?.link) {
      const tryScrape = async (proxyBase, isJsonProxy) => {
        try {
          const proxyUrl = proxyBase + encodeURIComponent(arts[0].link);
          const imgRes = await fetch(proxyUrl);
          if (!imgRes.ok) return null;
          
          let html = '';
          if (isJsonProxy) {
            const imgJson = await imgRes.json();
            html = imgJson.contents || imgJson.result || ''; // handle different proxy formats
          } else {
            html = await imgRes.text();
          }
          
          // Support multiple meta tags and common class patterns (OnlineKhabar uses post-thumbnail)
          const matches = [
            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i),
            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i),
            html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i),
            // Local site specific: WordPress post-thumbnail (OnlineKhabar)
            html.match(/class=["'][^"']*post-thumbnail[^"']*["'][^>]*>\s*<img[^>]+src=["']([^"']+)["']/i),
            // Featured/Hero patterns
            html.match(/<img[^>]+class=["'][^"']*(?:featured|hero|main-image|cover)[^"']*["'][^>]+src=["']([^"']+)["']/i),
            html.match(/<meta[^>]+name=["']thumbnail["'][^>]+content=["']([^"']+)["']/i),
            html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i)
          ];

          for (const m of matches) {
            if (m && m[1] && !m[1].includes('data:image')) return m[1];
          }

          // Ultimate fallback: find the first <img> that looks substantial (jpg/png/webp)
          const allImgs = html.matchAll(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|avif)[^"']*)["']/gi);
          for (const img of allImgs) {
            const url = img[1];
            if (url && !url.includes('avatar') && !url.includes('logo') && !url.includes('icon')) {
              return url;
            }
          }
          return null;
        } catch (e) { return null; }
      };

      // Try multiple proxies to bypass local blocks
      let scraped = await tryScrape('https://api.codetabs.com/v1/proxy?quest=', false);
      if (!scraped) scraped = await tryScrape('https://api.allorigins.win/get?url=', true);
      if (!scraped) scraped = await tryScrape('https://thingproxy.freeboard.io/fetch/', false);

      if (scraped) {
        highResImage = scraped;
        // Ensure it's an absolute URL
        if (highResImage.startsWith('//')) highResImage = 'https:' + highResImage;
        else if (highResImage.startsWith('/') && !highResImage.startsWith('//')) {
          try {
            const urlObj = new URL(arts[0].link);
            highResImage = urlObj.origin + (highResImage.startsWith('/') ? '' : '/') + highResImage;
          } catch(e) {}
        }
      }
    }

    return {
      title_en: meta.title_en || meta.title || cluster.topic,
      title_np: meta.title_np || cluster.topic,
      category: meta.category || 'World',
      tags: meta.tags || [],
      summary_en: meta.summary_en || meta.summary || '',
      summary_np: meta.summary_np || meta.summary_en || meta.summary || '',
      body_en: body_en,
      body_np: body_en, // NP body = EN body (saves 1 API call per article)
      sources: arts.map(a => ({ name: a.sourceName, url: a.link || a.sourceUrl, logo: a.sourceLogo || '' })),
      imageUrl: highResImage, // Primary high-quality image
      thumbnail: highResImage, // Fallback for components using 'thumbnail'
      _id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
  },

  // ── AI REST CALL (Free Keyless API) ──────────────────────────
  // NOTE: pollinations.ai uses a reasoning LLM (gpt-oss-20b). Without a high
  // max_tokens budget the model exhausts its limit mid-reasoning and returns an
  // empty `content` field. We also request low reasoning effort so it doesn't
  // blow most of the budget on chain-of-thought before producing JSON.
  _llm: async (prompt) => {
    // 1. Try POST first (supports jsonMode and large prompts)
    try {
      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          jsonMode: true,
        }),
      });
      if (res.ok) return await res.text();
    } catch (e) {
      console.warn('POST failed, trying GET fallback...', e);
    }

    // 2. Fallback to GET for simple text extraction (ignores jsonMode)
    const encoded = encodeURIComponent(prompt.slice(0, 2000));
    const res2 = await fetch(`${AI_URL}${encoded}?model=openai&json=true`);
    if (!res2.ok) {
      const err = await res2.text();
      throw new Error(`AI API ${res2.status}: ${err.slice(0, 100)}`);
    }
    return await res2.text();
  },

  // ── AI TEXT CALL (uses mistral to avoid reasoning wrappers) ──
  _llmText: async (prompt) => {
    // 1. Try mistral via openai-compat POST
    try {
      const res = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const t = json?.choices?.[0]?.message?.content || '';
        if (t && t.length > 100) return t;
      }
    } catch (_) {}

    // 2. Try plain text POST
    try {
      const res2 = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        }),
      });
      if (res2.ok) return await res2.text();
    } catch (_) {}

    // 3. Last resort: simple GET (best for CORS)
    const encoded = encodeURIComponent(prompt.slice(0, 2000));
    const res3 = await fetch(`${AI_URL}${encoded}?model=mistral`);
    if (!res3.ok) {
      const err = await res3.text();
      throw new Error(`AI API (text) ${res3.status}: ${err.slice(0, 100)}`);
    }
    return await res3.text();
  },

  // ── REPAIR TRUNCATED JSON ─────────────────────────────────────
  // Attempts to close unclosed strings, arrays, and objects.
  _repairJson: (str) => {
    let repaired = str.trim();
    if (!repaired.startsWith('{')) return repaired;

    // Fix unclosed quotes at the very end
    if (repaired.endsWith('"') && !repaired.endsWith('\\"')) {
      // If it ends in a quote, check if it's the start of a key/value
      // or if it needs to be closed. Usually it's a value being cut off.
      // We'll leave it for now.
    } else {
      // If the last char is not a quote, and we are inside a string, close it.
      const lastQuote = repaired.lastIndexOf('"');
      const lastOpenBrace = repaired.lastIndexOf('{');
      const lastOpenBracket = repaired.lastIndexOf('[');
      
      // Heuristic: if a quote is open but not closed
      let quoteCount = 0;
      for (let i = 0; i < repaired.length; i++) {
        if (repaired[i] === '"' && (i === 0 || repaired[i-1] !== '\\')) quoteCount++;
      }
      if (quoteCount % 2 !== 0) repaired += '"';
    }

    // Close arrays/objects
    let stack = [];
    for (let i = 0; i < repaired.length; i++) {
      const char = repaired[i];
      const prev = i > 0 ? repaired[i-1] : '';
      if (char === '"' && prev !== '\\') {
        let j = i + 1;
        while (j < repaired.length && (repaired[j] !== '"' || repaired[j-1] === '\\')) j++;
        i = j;
      } else if (char === '{') stack.push('}');
      else if (char === '[') stack.push(']');
      else if (char === '}') stack.pop();
      else if (char === ']') stack.pop();
    }

    while (stack.length > 0) {
      repaired += stack.pop();
    }
    
    return repaired;
  },

  // ── EXTRACT CLEAN PROSE FROM RAW AI BODY RESPONSE ────────────
  // Aggressively strips JSON wrappers, reasoning blocks, and conversational fluff.
  _extractBody: (raw) => {
    let text = raw.trim();

    // 1. openai-compat JSON: { choices:[{message:{content}}] }
    try {
      const parsed = JSON.parse(text);
      if (parsed?.choices?.[0]?.message?.content) {
        text = parsed.choices[0].message.content.trim();
      }
    } catch (_) {}

    // 2. Extract from reasoning content if available
    const rcMatch = text.match(/"reasoning_content"\s*:\s*"([\s\S]+?)"\s*,\s*"tool_calls"/);
    if (rcMatch) {
      const thinking = rcMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, ' ');
      text = thinking;
    }

    // 3. Strip <think> / <thinking> blocks
    text = text.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, '').trim();

    // 4. Unwrap markdown fences
    const mdM = text.match(/```(?:[a-z]*)\s*([\s\S]*?)\s*```/);
    if (mdM) text = mdM[1].trim();

    // 5. Split into paragraphs and filter out conversational/meta padding
    const rawParas = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const cleanParas = rawParas.filter(p => {
      const lower = p.toLowerCase();
      // Exclude short meta/padding lines
      if (p.length < 100 && (lower.includes('word') || lower.includes('count') || lower.includes('words:'))) return false;
      if (p.length < 150 && /^(here is|sure|based on|the article|below is|i have written|here are)/.test(lower)) return false;
      if (p.length < 80 && /^(paragraph|note:|disclaimer:|word count)/.test(lower)) return false;
      // Exclude JSON/code artifacts
      if (p.startsWith('{') || p.startsWith('[')) return false;
      return true;
    });

    if (cleanParas.length > 0) {
      return cleanParas.join('\n\n').trim();
    }
    
    // If filtering removed everything, return the stripped text as a fallback
    return text;
  },

  // ── JSON PARSER ──────────────────────────────────────────────
  // Robust parser: tries multiple strategies to extract valid JSON
  // even when it's buried inside reasoning/thinking prose.
  _json: (raw) => {
    // 1. Strip <think>...</think> reasoning blocks
    let clean = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // 2. Unwrap markdown code fences
    const mdMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (mdMatch) clean = mdMatch[1].trim();

    // 3. Try direct parse first (fastest path)
    try { return JSON.parse(clean); } catch { /* fall through */ }

    // 4. Find ALL {...} blocks in the text and try each one
    //    This handles reasoning_content fallback where JSON is embedded
    //    in the middle of thinking prose.
    const objRe = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    const candidates = [];
    let m;
    while ((m = objRe.exec(clean)) !== null) candidates.push(m[0]);
    // Also try the outermost greedy match
    const outer = clean.match(/\{[\s\S]*\}/);
    if (outer) candidates.unshift(outer[0]); // try largest first

    for (const candidate of candidates) {
      try { return JSON.parse(candidate); } catch {
        try { return JSON.parse(AIFETCH._repairJson(candidate)); } catch { /* keep trying */ }
      }
    }

    // 5. Last resort: try the whole raw string + repair
    try { return JSON.parse(raw.trim()); } catch {
      try { return JSON.parse(AIFETCH._repairJson(raw.trim())); } catch { /* fall through */ }
    }

    console.error('Failed to parse JSON from:', raw.slice(0, 250));
    throw new Error(`AI returned invalid JSON: ${raw.slice(0, 60)}...`);
  },

  // ── RESULTS RENDERER ─────────────────────────────────────────
  renderResults: () => {
    const wrap = document.getElementById('af-results');
    if (!wrap) return;

    if (!AF.results.length) {
      wrap.innerHTML = `<div class="af-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
        </svg>
        <p>Run the pipeline above to generate articles.</p>
      </div>`;
      return;
    }

    wrap.innerHTML = AF.results.map((r, i) => {
      const wS = AIFETCH._wc(r.summary || '');
      const wB = AIFETCH._wc(r.body || '');
      const sOk = wS >= 60 && wS <= 69;
      const bOk = wB >= 400 && wB <= 600;
      const srcBadges = (r.sources || []).slice(0, 6).map(s => {
        const logoHtml = s.logo
          ? `<img src="${escapeAttr(s.logo)}" class="af-badge-logo" onerror="this.style.display='none'"/>`
          : '';
        return `<a class="af-src-badge" href="${escapeAttr(s.url)}" target="_blank" rel="noopener">${logoHtml}${escapeHtml(s.name)}</a>`;
      }).join('');

      return `
      <div class="af-card" id="af-card-${i}">
        <div class="af-card-header">
          <div class="af-card-meta">
            <span class="badge badge-cat">${escapeHtml(r.category || 'World')}</span>
            ${srcBadges}
          </div>
          <div class="af-card-btns">
            <button class="af-btn-draft" onclick="AIFETCH.saveDraft(${i})">Save Draft</button>
            <button class="af-btn-pub"   onclick="AIFETCH.publish(${i})">Publish</button>
            <button class="af-btn-disc"  onclick="AIFETCH.discard(${i})">Discard</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="margin-top:16px; flex: 1;">
            <label>Title (English)</label>
            <input type="text" id="af-title-en-${i}" value="${escapeAttr(r.title_en || '')}" />
          </div>
          <div class="form-group" style="margin-top:16px; flex: 1;">
            <label>Title (Nepali)</label>
            <input type="text" id="af-title-np-${i}" value="${escapeAttr(r.title_np || '')}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label>Summary (EN) <small style="color:var(--text-3)">(≤ 69 words)</small></label>
            <textarea id="af-sum-en-${i}" rows="4"
              oninput="AIFETCH._wcUp('af-sum-en-${i}','af-sb-en-${i}','af-sc-en-${i}',60,69)"
            >${escapeHtml(r.summary_en || '')}</textarea>
            <div class="word-count-bar">
              <div class="word-bar-track"><div class="word-bar-fill" id="af-sb-en-${i}"
                style="width:${Math.min((AIFETCH._wc(r.summary_en || '') / 69) * 100, 100)}%;background:${(AIFETCH._wc(r.summary_en || '') >= 60 && AIFETCH._wc(r.summary_en || '') <= 69) ? '#22c55e' : AIFETCH._wc(r.summary_en || '') > 69 ? '#ef4444' : '#f59e0b'}">
              </div></div>
              <span class="word-count ${(AIFETCH._wc(r.summary_en || '') >= 60 && AIFETCH._wc(r.summary_en || '') <= 69) ? 'ok' : AIFETCH._wc(r.summary_en || '') > 69 ? 'over' : 'warn'}" id="af-sc-en-${i}">${AIFETCH._wc(r.summary_en || '')} / 69 words</span>
            </div>
          </div>
          <div class="form-group" style="flex: 1;">
            <label>Summary (NP) <small style="color:var(--text-3)">(≤ 69 words)</small></label>
            <textarea id="af-sum-np-${i}" rows="4"
              oninput="AIFETCH._wcUp('af-sum-np-${i}','af-sb-np-${i}','af-sc-np-${i}',60,69)"
            >${escapeHtml(r.summary_np || '')}</textarea>
            <div class="word-count-bar">
              <div class="word-bar-track"><div class="word-bar-fill" id="af-sb-np-${i}"
                style="width:${Math.min((AIFETCH._wc(r.summary_np || '') / 69) * 100, 100)}%;background:${(AIFETCH._wc(r.summary_np || '') >= 60 && AIFETCH._wc(r.summary_np || '') <= 69) ? '#22c55e' : AIFETCH._wc(r.summary_np || '') > 69 ? '#ef4444' : '#f59e0b'}">
              </div></div>
              <span class="word-count ${(AIFETCH._wc(r.summary_np || '') >= 60 && AIFETCH._wc(r.summary_np || '') <= 69) ? 'ok' : AIFETCH._wc(r.summary_np || '') > 69 ? 'over' : 'warn'}" id="af-sc-np-${i}">${AIFETCH._wc(r.summary_np || '')} / 69 words</span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label>Body (EN) <small style="color:var(--text-3)">(400–600 words)</small></label>
            <textarea id="af-body-en-${i}" rows="14"
              oninput="AIFETCH._wcUp('af-body-en-${i}','af-bb-en-${i}','af-bc-en-${i}',400,600)"
            >${escapeHtml(r.body_en || '')}</textarea>
            <div class="word-count-bar">
              <div class="word-bar-track"><div class="word-bar-fill" id="af-bb-en-${i}"
                style="width:${Math.min((AIFETCH._wc(r.body_en || '') / 600) * 100, 100)}%;background:${(AIFETCH._wc(r.body_en || '') >= 400 && AIFETCH._wc(r.body_en || '') <= 600) ? '#22c55e' : AIFETCH._wc(r.body_en || '') > 600 ? '#ef4444' : '#f59e0b'}">
              </div></div>
              <span class="word-count ${(AIFETCH._wc(r.body_en || '') >= 400 && AIFETCH._wc(r.body_en || '') <= 600) ? 'ok' : AIFETCH._wc(r.body_en || '') > 600 ? 'over' : 'warn'}" id="af-bc-en-${i}">${AIFETCH._wc(r.body_en || '')} / 600 words</span>
            </div>
          </div>
          <div class="form-group" style="flex: 1;">
            <label>Body (NP) <small style="color:var(--text-3)">(400–600 words)</small></label>
            <textarea id="af-body-np-${i}" rows="14"
              oninput="AIFETCH._wcUp('af-body-np-${i}','af-bb-np-${i}','af-bc-np-${i}',400,600)"
            >${escapeHtml(r.body_np || '')}</textarea>
            <div class="word-count-bar">
              <div class="word-bar-track"><div class="word-bar-fill" id="af-bb-np-${i}"
                style="width:${Math.min((AIFETCH._wc(r.body_np || '') / 600) * 100, 100)}%;background:${(AIFETCH._wc(r.body_np || '') >= 400 && AIFETCH._wc(r.body_np || '') <= 600) ? '#22c55e' : AIFETCH._wc(r.body_np || '') > 600 ? '#ef4444' : '#f59e0b'}">
              </div></div>
              <span class="word-count ${(AIFETCH._wc(r.body_np || '') >= 400 && AIFETCH._wc(r.body_np || '') <= 600) ? 'ok' : AIFETCH._wc(r.body_np || '') > 600 ? 'over' : 'warn'}" id="af-bc-np-${i}">${AIFETCH._wc(r.body_np || '')} / 600 words</span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Image URL <small style="color:var(--text-3)">(auto-detected)</small></label>
            <input type="url" id="af-img-${i}" value="${escapeAttr(r.thumbnail || '')}" placeholder="https://…" />
          </div>
          <div class="form-group">
            <label>Tags <small style="color:var(--text-3)">(comma separated)</small></label>
            <input type="text" id="af-tags-${i}" value="${escapeAttr((r.tags || []).join(', '))}" placeholder="tag1, tag2…" />
          </div>
        </div>
      </div>`;
    }).join('');
  },

  // ── WORD COUNT HELPERS ───────────────────────────────────────
  _wc: (text) => text.trim() ? text.trim().split(/\s+/).length : 0,

  _wcUp: (taId, barId, lblId, min, max) => {
    const ta = document.getElementById(taId);
    const bar = document.getElementById(barId);
    const lbl = document.getElementById(lblId);
    if (!ta || !bar || !lbl) return;
    const n = AIFETCH._wc(ta.value);
    const pct = Math.min(n / max * 100, 100);
    lbl.textContent = `${n} / ${max} words`;
    bar.style.width = `${pct}%`;
    if (n < min) { lbl.className = 'word-count warn'; bar.style.background = '#f59e0b'; }
    else if (n > max) { lbl.className = 'word-count over'; bar.style.background = '#ef4444'; }
    else { lbl.className = 'word-count ok'; bar.style.background = '#22c55e'; }
  },

  // ── COLLECT CARD DATA ────────────────────────────────────────
  _collect: (i) => {
    const r = AF.results[i];
    return {
      title: (document.getElementById(`af-title-en-${i}`)?.value || r.title_en || '').trim(), // Legacy fallback
      title_en: (document.getElementById(`af-title-en-${i}`)?.value || r.title_en || '').trim(),
      title_np: (document.getElementById(`af-title-np-${i}`)?.value || r.title_np || '').trim(),
      summary: (document.getElementById(`af-sum-en-${i}`)?.value || r.summary_en || '').trim(), // Legacy fallback
      summary_en: (document.getElementById(`af-sum-en-${i}`)?.value || r.summary_en || '').trim(),
      summary_np: (document.getElementById(`af-sum-np-${i}`)?.value || r.summary_np || '').trim(),
      body: (document.getElementById(`af-body-en-${i}`)?.value || r.body_en || '').trim(), // Legacy fallback
      body_en: (document.getElementById(`af-body-en-${i}`)?.value || r.body_en || '').trim(),
      body_np: (document.getElementById(`af-body-np-${i}`)?.value || r.body_np || '').trim(),
      imageUrl: (document.getElementById(`af-img-${i}`)?.value || r.thumbnail || '').trim(),
      categoryLabel: r.category || 'World',
      tags: (document.getElementById(`af-tags-${i}`)?.value || '').split(',').map(t => t.trim()).filter(Boolean),
      sources: r.sources || [],
    };
  },

  // ── SAVE AS DRAFT ────────────────────────────────────────────
  saveDraft: async (i) => {
    const data = AIFETCH._collect(i);
    if (!data.title) { UI.showToast('Title is required', 'error'); return; }
    try {
      await db.collection('articles').add({
        ...data,
        isPublished: false,
        isFeatured: false,
        autoGenerated: true,
        publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      UI.showToast('Saved as draft ✓', 'success');
      AIFETCH.discard(i);
    } catch (e) { UI.showToast('Error: ' + e.message, 'error'); }
  },

  // ── PUBLISH ──────────────────────────────────────────────────
  publish: async (i) => {
    const data = AIFETCH._collect(i);
    if (!data.title) { UI.showToast('Title is required', 'error'); return; }
    if (!confirm(`Publish "${data.title}"?`)) return;
    try {
      await db.collection('articles').add({
        ...data,
        isPublished: true,
        isFeatured: true,
        autoGenerated: true,
        publishedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      UI.showToast('Published ✓', 'success');
      AIFETCH.discard(i);
    } catch (e) { UI.showToast('Error: ' + e.message, 'error'); }
  },

  // ── DISCARD ──────────────────────────────────────────────────
  discard: (i) => {
    AF.results.splice(i, 1);
    AIFETCH.renderResults();
  },

  // ── CLEAR ALL RESULTS ────────────────────────────────────────
  clearAll: () => {
    if (!AF.results.length) return;
    if (!confirm('Discard all generated articles?')) return;
    AF.results = [];
    AIFETCH.renderResults();
  },

  // ── PROGRESS UI ──────────────────────────────────────────────
  _progress: (pct, label) => {
    const bar = document.getElementById('af-prog-bar');
    const lbl = document.getElementById('af-prog-label');
    const wrap = document.getElementById('af-prog-wrap');
    if (wrap) wrap.classList.remove('hidden');
    if (bar) bar.style.width = `${pct}%`;
    if (lbl) lbl.textContent = label;
  },

  _log: (msg) => {
    const el = document.getElementById('af-log');
    if (!el) return;
    el.classList.remove('hidden');
    el.innerHTML += `<div class="af-log-line">${escapeHtml(msg)}</div>`;
    el.scrollTop = el.scrollHeight;
  },

  _resetLog: () => {
    const log = document.getElementById('af-log');
    if (log) { log.innerHTML = ''; log.classList.remove('hidden'); }
    const wrap = document.getElementById('af-prog-wrap');
    if (wrap) wrap.classList.remove('hidden');
    AIFETCH._progress(0, '');
  },

  _setBusy: (busy) => {
    const runBtn = document.getElementById('af-run-btn');
    const stopBtn = document.getElementById('af-stop-btn');
    if (runBtn) {
      runBtn.disabled = busy;
      runBtn.textContent = busy ? 'Running pipeline…' : '⚡ Fetch & Summarize';
    }
    if (stopBtn) {
      if (busy) {
        stopBtn.classList.remove('hidden');
        stopBtn.disabled = false;
        stopBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="6" y="6" width="12" height="12"/></svg> Stop`;
      } else {
        stopBtn.classList.add('hidden');
      }
    }
  },

  stop: () => {
    if (!AF.running) return;
    AF.stopRequested = true;
    AIFETCH._log('🛑 Stopping pipeline…');
    const stopBtn = document.getElementById('af-stop-btn');
    if (stopBtn) {
      stopBtn.disabled = true;
      stopBtn.textContent = 'Stopping…';
    }
  },

  _sleep: ms => new Promise(r => setTimeout(r, ms)),
};

// ─── HTML ESCAPE HELPERS ─────────────────────────────────────────
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function escapeAttr(s) {
  return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
