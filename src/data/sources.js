// ─────────────────────────────────────────────────────────────────
// src/data/sources.js
// Single source of truth for all news sources used in:
//   • ProfileScreen.js  (Your Sources section)
//   • admin-portal/aifetch.js  (AI Fetch tab)
// ─────────────────────────────────────────────────────────────────

/**
 * Each source:
 *  id          – unique string
 *  name        – display name
 *  sub         – short description shown in profile cards
 *  letter      – fallback initial when logo fails to load
 *  logoUrl     – favicon / logo URL for source card stack
 *  rssUrl      – RSS feed URL for AI Fetch pipeline
 *  country     – 'NP' | 'INT'
 *  enabled     – default toggle state in AI Fetch
 */
export const ALL_SOURCES = [
  // ── NEPALI SOURCES ────────────────────────────────────────────
  {
    id: 'kantipur',
    name: 'Kantipur',
    sub: 'National Daily',
    letter: 'K',
    logoUrl: 'https://ekantipur.com/assets/images/kantipur-logo.svg',
    rssUrl: 'https://ekantipur.com/feed',
    country: 'NP',
    enabled: true,
  },
  {
    id: 'onlinekhabar',
    name: 'Online Khabar',
    sub: 'Digital First',
    letter: 'O',
    logoUrl: 'https://www.onlinekhabar.com/wp-content/themes/onlinekhabar-2021/img/logo-white.svg',
    rssUrl: 'https://www.onlinekhabar.com/feed',
    country: 'NP',
    enabled: true,
  },
  {
    id: 'ratopati',
    name: 'Ratopati',
    sub: 'Breaking News',
    letter: 'R',
    logoUrl: 'https://npcdn.ratopati.com/media/setting/ratopati-logo_qQKWIp37FR.png',
    rssUrl: 'https://ratopati.com/rss',
    country: 'NP',
    enabled: true,
  },
  {
    id: 'setopati',
    name: 'Setopati',
    sub: 'Social & Political',
    letter: 'S',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=setopati.com',
    rssUrl: 'https://www.setopati.com/feed',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'khabarhub',
    name: 'Khabarhub',
    sub: 'Mainstream Bias-free',
    letter: 'K',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=khabarhub.com',
    rssUrl: 'https://english.khabarhub.com/feed/',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'nepalnews',
    name: 'Nepal News',
    sub: 'Oldest Digital',
    letter: 'N',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=nepalnews.com',
    rssUrl: 'https://www.nepalnews.com/rss',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'himalayan',
    name: 'The Himalayan',
    sub: 'English Daily',
    letter: 'H',
    logoUrl: 'https://thehimalayantimes.com/theme_himalayantimes/images/favicon.png',
    rssUrl: 'https://thehimalayantimes.com/feed/',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'kathmandupost',
    name: 'Kathmandu Post',
    sub: 'Premier English',
    letter: 'K',
    logoUrl: 'https://jcss-cdn.kathmandupost.com/assets/images/device-icon/android-icon-192x192.png',
    rssUrl: 'https://kathmandupost.com/rss',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'myrepublica',
    name: 'My Republica',
    sub: 'Investigative',
    letter: 'M',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=myrepublica.nagariknetwork.com',
    rssUrl: 'https://myrepublica.nagariknetwork.com/rss/',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'annapurnapost',
    name: 'Annapurna Post',
    sub: 'Visual News',
    letter: 'A',
    logoUrl: 'https://snowberry.prixacdn.net/media/gallery_folder/anm-fav_qoxqP25etb_w9atwz27jbcg7tngui3nbrxonkizics7ahdk4abp4xmtzjemqdmsswgktnlo.ico',
    rssUrl: 'https://annapurnapost.com/rss',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'ujyaalo',
    name: 'Ujyaalo',
    sub: 'Radio Network',
    letter: 'U',
    logoUrl: 'https://unncdn.prixa.net/media/albums/favicon_ek1TeKvY53.jpg',
    rssUrl: 'https://ujyaalo.com/feed/',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'rssnepal',
    name: 'RSS Nepal',
    sub: 'News Agency',
    letter: 'R',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=rss.com.np',
    rssUrl: 'https://www.rss.com.np/feed',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'nagarik',
    name: 'Nagarik News',
    sub: 'Public Affairs',
    letter: 'N',
    logoUrl: 'https://jscss.nagariknewscdn.com/images/favicon.png',
    rssUrl: 'https://nagariknews.nagariknetwork.com/feed/',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'gorkhapatra',
    name: 'Gorkhapatra',
    sub: "Nepal's Oldest Paper",
    letter: 'G',
    logoUrl: 'https://gorkhapatraonline.com/landing-assets/img/favicon.png',
    rssUrl: 'https://gorkhapatraonline.com/rss',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'nepalitimes',
    name: 'Nepali Times',
    sub: 'In-depth Weekly',
    letter: 'N',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=nepalitimes.com',
    rssUrl: 'https://www.nepalitimes.com/feed/',
    country: 'NP',
    enabled: false,
  },
  {
    id: 'imaginekhabar',
    name: 'Imagine Khabar',
    sub: 'Digital Native',
    letter: 'I',
    logoUrl: 'https://www.imagekhabar.com/wp-content/uploads/2020/06/cropped-ALPHA-LOGO-2-150x150.png',
    rssUrl: 'https://imaginekhabar.com/rss',
    country: 'NP',
    enabled: false,
  },

  // ── INTERNATIONAL SOURCES ──────────────────────────────────────
  {
    id: 'bbc',
    name: 'BBC News',
    sub: 'British Broadcasting',
    letter: 'B',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=bbc.com',
    rssUrl: 'https://feeds.bbci.co.uk/news/rss.xml',
    country: 'INT',
    enabled: true,
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    sub: 'Qatar-based Global',
    letter: 'A',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=aljazeera.com',
    rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml',
    country: 'INT',
    enabled: true,
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    sub: 'UK Independent',
    letter: 'G',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=theguardian.com',
    rssUrl: 'https://www.theguardian.com/world/rss',
    country: 'INT',
    enabled: true,
  },
  {
    id: 'npr',
    name: 'NPR News',
    sub: 'US Public Radio',
    letter: 'N',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=npr.org',
    rssUrl: 'https://feeds.npr.org/1001/rss.xml',
    country: 'INT',
    enabled: true,
  },
  {
    id: 'cnn',
    name: 'CNN',
    sub: 'Cable News Network',
    letter: 'C',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=cnn.com',
    rssUrl: 'http://rss.cnn.com/rss/edition.rss',
    country: 'INT',
    enabled: false,
  },
  {
    id: 'thehindu',
    name: 'The Hindu',
    sub: 'South Asian Perspective',
    letter: 'H',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=thehindu.com',
    rssUrl: 'https://www.thehindu.com/news/international/?service=rss',
    country: 'INT',
    enabled: false,
  },
  {
    id: 'ndtv',
    name: 'NDTV',
    sub: 'Indian National',
    letter: 'N',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=ndtv.com',
    rssUrl: 'https://feeds.feedburner.com/ndtvnews-top-stories',
    country: 'INT',
    enabled: false,
  },
  {
    id: 'dw',
    name: 'DW News',
    sub: 'Deutsche Welle',
    letter: 'D',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=dw.com',
    rssUrl: 'https://rss.dw.com/rdf/rss-en-world',
    country: 'INT',
    enabled: false,
  },
  {
    id: 'rfi',
    name: 'RFI English',
    sub: 'Radio France Int\'l',
    letter: 'R',
    logoUrl: 'https://www.google.com/s2/favicons?sz=128&domain=rfi.fr',
    rssUrl: 'https://www.rfi.fr/en/rss',
    country: 'INT',
    enabled: false,
  },
];

// ── Helpers ───────────────────────────────────────────────────────

/** Lookup a source by id */
export function getSourceById(id) {
  return ALL_SOURCES.find(s => s.id === id) || null;
}

/** Lookup a source's logo URL by its display name (case-insensitive) */
export function getSourceLogoByName(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  const source = ALL_SOURCES.find(s => s.name.toLowerCase() === lower);
  return source?.logoUrl || null;
}

/** All sources enabled by default */
export const DEFAULT_ENABLED_IDS = ALL_SOURCES
  .filter(s => s.enabled)
  .map(s => s.id);
