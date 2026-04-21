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
  { id: 'kantipur', name: 'Kantipur', sub: 'National Daily', letter: 'K', logoUrl: 'https://logo.clearbit.com/kantipurdaily.com', rssUrl: 'https://ekantipur.com/feed', country: 'NP', enabled: true },
  { id: 'onlinekhabar', name: 'Online Khabar', sub: 'Digital First', letter: 'O', logoUrl: 'https://logo.clearbit.com/onlinekhabar.com', rssUrl: 'https://www.onlinekhabar.com/feed', country: 'NP', enabled: true },
  { id: 'ratopati', name: 'Ratopati', sub: 'Breaking News', letter: 'R', logoUrl: 'https://logo.clearbit.com/ratopati.com', rssUrl: 'https://ratopati.com/rss', country: 'NP', enabled: true },
  { id: 'setopati', name: 'Setopati', sub: 'Social & Political', letter: 'S', logoUrl: 'https://logo.clearbit.com/setopati.com', rssUrl: 'https://www.setopati.com/feed', country: 'NP', enabled: false },
  { id: 'khabarhub', name: 'Khabarhub', sub: 'Mainstream Bias-free', letter: 'K', logoUrl: 'https://logo.clearbit.com/khabarhub.com', rssUrl: 'https://english.khabarhub.com/feed/', country: 'NP', enabled: false },
  { id: 'nepalnews', name: 'Nepal News', sub: 'Oldest Digital', letter: 'N', logoUrl: 'https://logo.clearbit.com/nepalnews.com', rssUrl: 'https://www.nepalnews.com/rss', country: 'NP', enabled: false },
  { id: 'himalayan', name: 'The Himalayan', sub: 'English Daily', letter: 'H', logoUrl: 'https://logo.clearbit.com/thehimalayantimes.com', rssUrl: 'https://thehimalayantimes.com/feed/', country: 'NP', enabled: false },
  { id: 'kathmandupost', name: 'Kathmandu Post', sub: 'Premier English', letter: 'K', logoUrl: 'https://logo.clearbit.com/kathmandupost.com', rssUrl: 'https://kathmandupost.com/rss', country: 'NP', enabled: false },
  { id: 'myrepublica', name: 'My Republica', sub: 'Investigative', letter: 'M', logoUrl: 'https://logo.clearbit.com/myrepublica.nagariknetwork.com', rssUrl: 'https://myrepublica.nagariknetwork.com/rss/', country: 'NP', enabled: false },
  { id: 'annapurnapost', name: 'Annapurna Post', sub: 'Visual News', letter: 'A', logoUrl: 'https://logo.clearbit.com/annapurnapost.com', rssUrl: 'https://annapurnapost.com/rss', country: 'NP', enabled: false },
  { id: 'ujyaalo', name: 'Ujyaalo', sub: 'Radio Network', letter: 'U', logoUrl: 'https://logo.clearbit.com/ujyaalo.com', rssUrl: 'https://ujyaalo.com/feed/', country: 'NP', enabled: false },
  { id: 'rssnepal', name: 'RSS Nepal', sub: 'News Agency', letter: 'R', logoUrl: 'https://logo.clearbit.com/rss.com.np', rssUrl: 'https://www.rss.com.np/feed', country: 'NP', enabled: false },
  { id: 'nagarik', name: 'Nagarik News', sub: 'Public Affairs', letter: 'N', logoUrl: 'https://logo.clearbit.com/nagariknetwork.com', rssUrl: 'https://nagariknews.nagariknetwork.com/feed/', country: 'NP', enabled: false },
  { id: 'gorkhapatra', name: 'Gorkhapatra', sub: "Nepal's Oldest Paper", letter: 'G', logoUrl: 'https://logo.clearbit.com/gorkhapatraonline.com', rssUrl: 'https://gorkhapatraonline.com/rss', country: 'NP', enabled: false },
  { id: 'nepalitimes', name: 'Nepali Times', sub: 'In-depth Weekly', letter: 'N', logoUrl: 'https://logo.clearbit.com/nepalitimes.com', rssUrl: 'https://www.nepalitimes.com/feed/', country: 'NP', enabled: false },
  { id: 'imaginekhabar', name: 'Imagine Khabar', sub: 'Digital Native', letter: 'I', logoUrl: 'https://logo.clearbit.com/imaginekhabar.com', rssUrl: 'https://imaginekhabar.com/rss', country: 'NP', enabled: false },
  // ── INTERNATIONAL ─────────────────────────────────────────────
  { id: 'bbc', name: 'BBC News', sub: 'British Broadcasting', letter: 'B', logoUrl: 'https://logo.clearbit.com/bbc.com', rssUrl: 'https://feeds.bbci.co.uk/news/rss.xml', country: 'INT', enabled: true },
  { id: 'aljazeera', name: 'Al Jazeera', sub: 'Qatar-based Global', letter: 'A', logoUrl: 'https://logo.clearbit.com/aljazeera.com', rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml', country: 'INT', enabled: true },
  { id: 'guardian', name: 'The Guardian', sub: 'UK Independent', letter: 'G', logoUrl: 'https://logo.clearbit.com/theguardian.com', rssUrl: 'https://www.theguardian.com/world/rss', country: 'INT', enabled: true },
  { id: 'npr', name: 'NPR News', sub: 'US Public Radio', letter: 'N', logoUrl: 'https://logo.clearbit.com/npr.org', rssUrl: 'https://feeds.npr.org/1001/rss.xml', country: 'INT', enabled: true },
  { id: 'cnn', name: 'CNN', sub: 'Cable News Network', letter: 'C', logoUrl: 'https://logo.clearbit.com/cnn.com', rssUrl: 'http://rss.cnn.com/rss/edition.rss', country: 'INT', enabled: false },
  { id: 'thehindu', name: 'The Hindu', sub: 'South Asian Persp.', letter: 'H', logoUrl: 'https://logo.clearbit.com/thehindu.com', rssUrl: 'https://www.thehindu.com/news/international/?service=rss', country: 'INT', enabled: false },
  { id: 'ndtv', name: 'NDTV', sub: 'Indian National', letter: 'N', logoUrl: 'https://logo.clearbit.com/ndtv.com', rssUrl: 'https://feeds.feedburner.com/ndtvnews-top-stories', country: 'INT', enabled: false },
  { id: 'dw', name: 'DW News', sub: 'Deutsche Welle', letter: 'D', logoUrl: 'https://logo.clearbit.com/dw.com', rssUrl: 'https://rss.dw.com/rdf/rss-en-world', country: 'INT', enabled: false },
  { id: 'rfi', name: 'RFI English', sub: "Radio France Int'l", letter: 'R', logoUrl: 'https://logo.clearbit.com/rfi.fr', rssUrl: 'https://www.rfi.fr/en/rss', country: 'INT', enabled: false },
];

// ─── MODULE STATE ────────────────────────────────────────────────
const AF_VERSION = '2'; // bump when source schema changes
if (localStorage.getItem('af_version') !== AF_VERSION) {
  localStorage.removeItem('af_sources'); // clear stale old format
  localStorage.setItem('af_version', AF_VERSION);
}

const AF = {
  sources: JSON.parse(localStorage.getItem('af_sources') || 'null') || DEFAULT_SOURCES.map(s => ({ ...s })),
  freshness: 24,
  results: [],
  running: false,
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
    AIFETCH._setBusy(true);
    AIFETCH._resetLog();
    AIFETCH._progress(0, 'Starting…');

    try {
      // ── 1. Fetch RSS ────────────────────────────────────────
      const allArticles = [];
      const cutoff = Date.now() - AF.freshness * 3_600_000;

      for (let i = 0; i < active.length; i++) {
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
        await AIFETCH._sleep(600);
      }

      AIFETCH._progress(100, `Done! ${AF.results.length} article(s) ready for review.`);
      AIFETCH._log(`─── Complete. ${AF.results.length} article(s) generated.`);

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

    return validItems.map(it => ({
      title: (it.title || '').replace(/<[^>]+>/g, '').trim(),
      description: (it.description || '').replace(/<[^>]+>/g, '').slice(0, 600).trim(),
      link: it.link || '',
      pubDate: it.pubDate || '',
      thumbnail: it.enclosure?.link || it.thumbnail || '',
    }));
  },

  // ── TOPIC CLUSTERING ─────────────────────────────────────────
  // Batches articles in groups of 25 so the prompt never overflows
  // the reasoning model's token budget.
  // Always uses local 0-based indices in the LLM prompt (the model
  // follows its example format), then remaps to global indices after.
  _cluster: async (articles) => {
    const BATCH = 25;
    const allClusters = [];
    let offset = 0;

    while (offset < articles.length) {
      const batch = articles.slice(offset, offset + BATCH);
      // Use local 0-based indices so the model matches the example format
      const list = batch.map((a, i) => `[${i}] ${a.sourceName}: ${a.title}`).join('\n');

      const prompt = `Group these ${batch.length} headlines by specific news event (not broad topic). Each cluster = one real-world event. Include every index in some cluster.

HEADLINES:
${list}

Reply ONLY with this exact JSON shape (no markdown):
{"clusters":[{"topic":"short label","indices":[0,1]},{"topic":"label","indices":[2]}]}`;

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
        } else {
          // Model returned empty or unreadable clusters — treat each as its own
          AIFETCH._log(`⚠ Cluster batch (offset ${offset}) returned 0 clusters — using individual clusters`);
          batch.forEach((a, i) => allClusters.push({ topic: a.title.slice(0, 40), indices: [offset + i] }));
        }
      } catch (e) {
        // Fallback: treat each article in the batch as its own cluster
        AIFETCH._log(`⚠ Cluster batch failed (offset ${offset}): ${e.message} — using individual clusters`);
        batch.forEach((a, i) => allClusters.push({ topic: a.title.slice(0, 40), indices: [offset + i] }));
      }

      offset += BATCH;
      if (offset < articles.length) await AIFETCH._sleep(500);
    }

    return allClusters;
  },

  // ── SUMMARIZE one cluster (two-step) ────────────────────────
  // Step 1: get title/category/tags/summary (short, focused JSON)
  // Step 2: get the body separately so it has its own full token budget
  _summarize: async (cluster, all) => {
    const arts = cluster.indices.map(i => all[i]).filter(Boolean);
    const names = [...new Set(arts.map(a => a.sourceName))];
    const text = arts.map(a =>
      `SOURCE: ${a.sourceName}\nHEADLINE: ${a.title}\nSNIPPET: ${a.description}`
    ).join('\n\n---\n\n');

    // ── Step 1: metadata + summary ───────────────────────────
    const metaPrompt = `You are a neutral news editor for "Lucid Newsroom". Read these ${arts.length} article(s) from [${names.join(', ')}]:

${text}

Reply ONLY with valid JSON (no markdown):
{
  "title": "Neutral headline, max 15 words",
  "category": "one of: Politics|Technology|Business|Science|Health|Sports|Entertainment|World|Environment|Culture",
  "tags": ["tag1","tag2","tag3"],
  "summary": "ONE paragraph, EXACTLY 60-69 words. Neutral, factual, covers who/what/where/when. Count words and adjust before outputting."
}`;

    const metaRaw = await AIFETCH._llm(metaPrompt);
    const meta = AIFETCH._json(metaRaw);

    // ── Step 2: full article body ────────────────────────────
    const bodyPrompt = `You are a neutral journalist writing a full article for "Lucid Newsroom" based on these ${arts.length} source(s) from [${names.join(', ')}]:

${text}

Write the article BODY only — plain prose, NO JSON, NO markdown, NO bullet points.
Requirements:
- Exactly 5 paragraphs separated by a blank line
- Paragraph 1 (~90 words): what happened — the key facts
- Paragraph 2 (~90 words): what each source reported and their angle
- Paragraph 3 (~90 words): background context and timeline
- Paragraph 4 (~90 words): significance, implications, and what to watch next
- Paragraph 5 (~90 words): broader impact, expert perspectives, and future outlook
- Total: 400-500 words. Count and expand short paragraphs before finishing.

Output ONLY the body text, nothing else:`;

    const bodyRaw = await AIFETCH._llm(bodyPrompt);
    // body comes back as plain text, not JSON — strip any accidental JSON wrapping
    let body = bodyRaw.trim();
    const bodyJsonMatch = body.match(/"body"\s*:\s*"([\s\S]*?)"\s*\}?\s*$/);
    if (bodyJsonMatch) body = bodyJsonMatch[1].replace(/\\n/g, '\n');

    // Log a warning if word counts are still off
    const wS = AIFETCH._wc(meta.summary || '');
    const wB = AIFETCH._wc(body);
    if (wS < 55 || wB < 350) {
      AIFETCH._log(`⚠ Word count low for "${cluster.topic}": summary=${wS} words, body=${wB} words`);
    }

    return {
      ...meta,
      body,
      sources: arts.map(a => ({ name: a.sourceName, url: a.link || a.sourceUrl, logo: a.sourceLogo || '' })),
      thumbnail: arts.find(a => a.thumbnail)?.thumbnail || '',
      _id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
  },

  // ── AI REST CALL (Free Keyless API) ──────────────────────────
  // NOTE: pollinations.ai uses a reasoning LLM (gpt-oss-20b). Without a high
  // max_tokens budget the model exhausts its limit mid-reasoning and returns an
  // empty `content` field. We also request low reasoning effort so it doesn't
  // blow most of the budget on chain-of-thought before producing JSON.
  _llm: async (prompt) => {
    const res = await fetch(AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        jsonMode: true,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI API ${res.status}: ${err.slice(0, 120)}`);
    }
    
    // The new text endpoint returns the string directly.
    const content = await res.text();
    
    if (!content) {
      throw new Error(`AI returned no content. Status: ${res.status}`);
    }
    return content;
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
      try { return JSON.parse(candidate); } catch { /* keep trying */ }
    }

    // 5. Last resort: try the whole raw string
    try { return JSON.parse(raw.trim()); } catch { /* fall through */ }

    console.error('Failed to parse JSON from:', raw.slice(0, 200));
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

        <div class="form-group" style="margin-top:16px">
          <label>Title</label>
          <input type="text" id="af-title-${i}" value="${escapeAttr(r.title || '')}" />
        </div>

        <div class="form-group">
          <label>Summary <small style="color:var(--text-3)">(≤ 69 words)</small></label>
          <textarea id="af-sum-${i}" rows="4"
            oninput="AIFETCH._wcUp('af-sum-${i}','af-sb-${i}','af-sc-${i}',60,69)"
          >${escapeHtml(r.summary || '')}</textarea>
          <div class="word-count-bar">
            <div class="word-bar-track"><div class="word-bar-fill" id="af-sb-${i}"
              style="width:${Math.min(wS / 69 * 100, 100)}%;background:${sOk ? '#22c55e' : wS > 69 ? '#ef4444' : '#f59e0b'}">
            </div></div>
            <span class="word-count ${sOk ? 'ok' : wS > 69 ? 'over' : 'warn'}" id="af-sc-${i}">${wS} / 69 words</span>
          </div>
        </div>

        <div class="form-group">
          <label>Body <small style="color:var(--text-3)">(400–600 words)</small></label>
          <textarea id="af-body-${i}" rows="14"
            oninput="AIFETCH._wcUp('af-body-${i}','af-bb-${i}','af-bc-${i}',400,600)"
          >${escapeHtml(r.body || '')}</textarea>
          <div class="word-count-bar">
            <div class="word-bar-track"><div class="word-bar-fill" id="af-bb-${i}"
              style="width:${Math.min(wB / 600 * 100, 100)}%;background:${bOk ? '#22c55e' : wB > 600 ? '#ef4444' : '#f59e0b'}">
            </div></div>
            <span class="word-count ${bOk ? 'ok' : wB > 600 ? 'over' : 'warn'}" id="af-bc-${i}">${wB} / 600 words</span>
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
      title: (document.getElementById(`af-title-${i}`)?.value || r.title || '').trim(),
      summary: (document.getElementById(`af-sum-${i}`)?.value || r.summary || '').trim(),
      fullBody: (document.getElementById(`af-body-${i}`)?.value || r.body || '').trim(),
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
    const btn = document.getElementById('af-run-btn');
    if (btn) {
      btn.disabled = busy;
      btn.textContent = busy ? 'Running pipeline…' : '⚡ Fetch & Summarize';
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
