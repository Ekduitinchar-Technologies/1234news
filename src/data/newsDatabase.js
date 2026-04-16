/**
 * newsDatabase.js
 *
 * Centralized read-only content database for News69.
 * Every export maps to a future backend endpoint (documented per section).
 * User interaction data (votes, likes, saves, comments) lives in userInteractionsDB.js
 */

// ─────────────────────────────────────────────────────────────────
// MARKET TICKER  →  future: GET /api/markets/tickers
// ─────────────────────────────────────────────────────────────────
export const MARKET_TICKERS = [
  { id: 'gold',   label: 'GOLD',    value: '$2,341.20', change: '-0.4%',  up: false },
  { id: 'silver', label: 'SILVER',  value: '$28.45',    change: '+1.2%',  up: true  },
  { id: 'sp500',  label: 'S&P 500', value: '5,123.44',  change: '+0.15%', up: true  },
  { id: 'btc',    label: 'BTC',     value: '$64,210',   change: '+2.4%',  up: true  },
  { id: 'eth',    label: 'ETH',     value: '$3,180',    change: '-0.8%',  up: false },
  { id: 'nasdaq', label: 'NASDAQ',  value: '18,244',    change: '+0.3%',  up: true  },
  { id: 'dow',    label: 'DOW',     value: '38,910',    change: '+0.1%',  up: true  },
  { id: 'oil',    label: 'OIL',     value: '$82.10',    change: '-1.1%',  up: false },
  { id: 'eurusd', label: 'EUR/USD', value: '1.0834',    change: '+0.2%',  up: true  },
  { id: 'usdjpy', label: 'USD/JPY', value: '151.24',    change: '-0.05%', up: false },
];

// ─────────────────────────────────────────────────────────────────
// NEWS CATEGORIES  →  future: GET /api/categories
// ─────────────────────────────────────────────────────────────────
export const NEWS_CATEGORIES = [
  'All News', 'Trending', 'Latest', 'Politics', 'Tech', 'Economy',
];

// ─────────────────────────────────────────────────────────────────
// NEWS ARTICLES  →  future: GET /api/articles?category=<slug>
// ─────────────────────────────────────────────────────────────────
export const NEWS_ARTICLES = {
  'All News': [
    {
      id: 'a1',
      tag: 'GLOBAL AFFAIRS',
      title: 'The shift in sustainable urban planning across major European hubs',
      time: '12m ago',
      readTime: '4 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMgAu1g8O0qMI_VXdEpMyq6whAqL1f93X2nctE7P4XynzbSFQz8lTB36rlD3vzUOfphmH2lnqTQn2tBVmlyDvtsQdIh-eI9iBcSjVdj53z3CdN4WQ4FusZEFePDzuEbs2TWMeNvD-5QMt1xoPRf0rI_8CbZ8-dV6B7ID8bV2-8YXCGyCWQjkjHFmcJemvBuxBu7FkM7LEVk_OgcKHxLKo9jjLirTOPS3YZhay-XpHz5fueiNgsPaGVZ0CKhrTd0iwTBum-lN7cPYGj',
    },
    {
      id: 'a2',
      tag: 'TECHNOLOGY',
      title: 'Next-gen semiconductors: How localized manufacturing is changing the market',
      time: '45m ago',
      readTime: '6 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjFUANRnN6BpkBVVSVNYeum3tGLfM_-sLMNLfN1P2Yv5F0JknSSO6_6XcbUl4gqucpMrY6xyF0jZTm776cogGjBw1EegKpjWcSDacCBdcHNZYcemv3um250bF23CvFNEAPjBolGLJ42VM4xHj-QWzdzmGPrr6Z5ZaNKpStAtmGWqdM8TAFB7UNmn9SIqa7KbMNlGpYgXSVlQiJwi-GP2DvAsGGfBqnpj6DMe0VQDxZImpynWCgN3ejz7jNqiX4XKfQbb9aXNd1dt4HNN9',
    },
    {
      id: 'a3',
      tag: 'ECONOMY',
      title: 'Interest rate impacts: What first-time homeowners need to watch in Q3',
      time: '2h ago',
      readTime: '3 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJHp80XYf2ccRkgG5CuZjVQontHkf9zrfw_YIZ1PcwD1FRJUGhwdD4H7bMDU5_x2dFTjUCRx-YE_npcechStJIL-YHUfBw90FmkVOzMaRrGf2dtsDJp6Kbp9RK3PoZNcmDPLg8i8hgghCTf5LpIgr8Ahng1gaM6-2u8X3_HyDIyR_JzyLTHiBzjoKEidrKu_dN4eRKxLCk9b89ifN9yuzg2WWX_zDYh5iHD1DTQzhbV-wr4ib24Fd5VuU1ONvJvbGQdVIrBmmyzFLP',
    },
  ],
  'Trending': [
    {
      id: 't1',
      tag: 'TRENDING',
      title: 'Private sector moon missions set to double by 2026',
      time: '1h ago',
      readTime: '5 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGxPAbeANDOxW8tv8AcZKnjk1KlirGAl9PEjmYtRlnPN2m0NxeVHUOVP5CpAHYkCgnGWE-ckDuiaDsQu1juHyjXKLvlU1B_1ADFIDX2dcCP1SoE8BsXPXLFv0B1vUzEaV45284_59BSxAhXarZXgvvUUd1AUhHm0NOy6eJ3JWZHWKat4D_ISRwbJq8BqcmGiciSAFfKMsG_VgW9gXdSZ8Y7pTh3SdG1ykCwayvgdjPHA90Iwj0_Vi1cvk_42IqBPBJaDMDgnLdtj0c',
    },
    {
      id: 't2',
      tag: 'VIRAL',
      title: 'New reforestation AI achieves 90% success rate in the Andes',
      time: '3h ago',
      readTime: '4 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrmGD_Klswjbq1jLzbGZLGWlx_QNqZCBoQwImZmWlrNjljAorN1w9ldf-rCDMDs7cJUhdnwu7NuUAMfXwTC2KTjAZXwiUctxggChwqrhySoIe1Kz2NsVnziu4C3xICAwHXAQpNQKWhBgZYLYrGKm1FwxBAVdNRfw7ii6V-fSmFJDUky-cD_xEk1U8RsSMMZNIBbeK8Ww4wxXERVmb4BNlJq6V4c3XYpSzeg2GTpPxi0nXnZmjCQcj9NYm5F5MdNJ4nNhhddtp0NfpS',
    },
    {
      id: 't3',
      tag: 'HOT TAKE',
      title: 'Why decentralized finance is outpacing traditional banking models',
      time: '5h ago',
      readTime: '7 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN9EkuiFXt21V5St503D6NQ7b7cO7To7xW5ep5FX68sm-2BH4bZFBc37oiAznt-uhjlkAeogRkC8AC6ZmC5pol8igROIfo6VqT8bo6q1-laydbkYfYBMZ8VxHcf6zKLNSWo_BOFyeE_yo4KZljh7Li8lVn6igVaYhnjbiYZgCOG4BGyslH4COCQOzEi7JYKAHc7aGWlZxM9UWU021YNrT8gTAcysAAMJcAvXFdboxVxRGwm-5BbcZNRGVnvx5-hXGuZrpvafxxBntV',
    },
  ],
  'Latest': [
    {
      id: 'l1',
      tag: 'BREAKING',
      title: 'G7 leaders agree on new carbon credit framework at emergency summit',
      time: '5m ago',
      readTime: '3 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMgAu1g8O0qMI_VXdEpMyq6whAqL1f93X2nctE7P4XynzbSFQz8lTB36rlD3vzUOfphmH2lnqTQn2tBVmlyDvtsQdIh-eI9iBcSjVdj53z3CdN4WQ4FusZEFePDzuEbs2TWMeNvD-5QMt1xoPRf0rI_8CbZ8-dV6B7ID8bV2-8YXCGyCWQjkjHFmcJemvBuxBu7FkM7LEVk_OgcKHxLKo9jjLirTOPS3YZhay-XpHz5fueiNgsPaGVZ0CKhrTd0iwTBum-lN7cPYGj',
    },
    {
      id: 'l2',
      tag: 'JUST IN',
      title: 'Apple announces iOS 19 with live AI model integration baked in',
      time: '18m ago',
      readTime: '5 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjFUANRnN6BpkBVVSVNYeum3tGLfM_-sLMNLfN1P2Yv5F0JknSSO6_6XcbUl4gqucpMrY6xyF0jZTm776cogGjBw1EegKpjWcSDacCBdcHNZYcemv3um250bF23CvFNEAPjBolGLJ42VM4xHj-QWzdzmGPrr6Z5ZaNKpStAtmGWqdM8TAFB7UNmn9SIqa7KbMNlGpYgXSVlQiJwi-GP2DvAsGGfBqnpj6DMe0VQDxZImpynWCgN3ejz7jNqiX4XKfQbb9aXNd1dt4HNN9',
    },
    {
      id: 'l3',
      tag: 'LIVE UPDATE',
      title: 'Pakistan floods displace 3.4M residents as monsoon season accelerates',
      time: '34m ago',
      readTime: '4 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrmGD_Klswjbq1jLzbGZLGWlx_QNqZCBoQwImZmWlrNjljAorN1w9ldf-rCDMDs7cJUhdnwu7NuUAMfXwTC2KTjAZXwiUctxggChwqrhySoIe1Kz2NsVnziu4C3xICAwHXAQpNQKWhBgZYLYrGKm1FwxBAVdNRfw7ii6V-fSmFJDUky-cD_xEk1U8RsSMMZNIBbeK8Ww4wxXERVmb4BNlJq6V4c3XYpSzeg2GTpPxi0nXnZmjCQcj9NYm5F5MdNJ4nNhhddtp0NfpS',
    },
  ],
  'Politics': [
    {
      id: 'p1',
      tag: 'POLITICS',
      title: 'Senate OKs bipartisan infrastructure spending in final 67-33 vote',
      time: '1h ago',
      readTime: '5 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN9EkuiFXt21V5St503D6NQ7b7cO7To7xW5ep5FX68sm-2BH4bZFBc37oiAznt-uhjlkAeogRkC8AC6ZmC5pol8igROIfo6VqT8bo6q1-laydbkYfYBMZ8VxHcf6zKLNSWo_BOFyeE_yo4KZljh7Li8lVn6igVaYhnjbiYZgCOG4BGyslH4COCQOzEi7JYKAHc7aGWlZxM9UWU021YNrT8gTAcysAAMJcAvXFdboxVxRGwm-5BbcZNRGVnvx5-hXGuZrpvafxxBntV',
    },
    {
      id: 'p2',
      tag: 'WORLD',
      title: 'NATO alliance extends its eastern border presence into the Balkan region',
      time: '3h ago',
      readTime: '6 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJHp80XYf2ccRkgG5CuZjVQontHkf9zrfw_YIZ1PcwD1FRJUGhwdD4H7bMDU5_x2dFTjUCRx-YE_npcechStJIL-YHUfBw90FmkVOzMaRrGf2dtsDJp6Kbp9RK3PoZNcmDPLg8i8hgghCTf5LpIgr8Ahng1gaM6-2u8X3_HyDIyR_JzyLTHiBzjoKEidrKu_dN4eRKxLCk9b89ifN9yuzg2WWX_zDYh5iHD1DTQzhbV-wr4ib24Fd5VuU1ONvJvbGQdVIrBmmyzFLP',
    },
    {
      id: 'p3',
      tag: 'DIPLOMACY',
      title: 'France-India strategic tech treaty aims to rival US-China dominance',
      time: '6h ago',
      readTime: '8 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGxPAbeANDOxW8tv8AcZKnjk1KlirGAl9PEjmYtRlnPN2m0NxeVHUOVP5CpAHYkCgnGWE-ckDuiaDsQu1juHyjXKLvlU1B_1ADFIDX2dcCP1SoE8BsXPXLFv0B1vUzEaV45284_59BSxAhXarZXgvvUUd1AUhHm0NOy6eJ3JWZHWKat4D_ISRwbJq8BqcmGiciSAFfKMsG_VgW9gXdSZ8Y7pTh3SdG1ykCwayvgdjPHA90Iwj0_Vi1cvk_42IqBPBJaDMDgnLdtj0c',
    },
  ],
  'Tech': [
    {
      id: 'tc1',
      tag: 'AI',
      title: 'OpenAI launches o4 reasoning model trained on 50 trillion tokens',
      time: '2h ago',
      readTime: '5 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjFUANRnN6BpkBVVSVNYeum3tGLfM_-sLMNLfN1P2Yv5F0JknSSO6_6XcbUl4gqucpMrY6xyF0jZTm776cogGjBw1EegKpjWcSDacCBdcHNZYcemv3um250bF23CvFNEAPjBolGLJ42VM4xHj-QWzdzmGPrr6Z5ZaNKpStAtmGWqdM8TAFB7UNmn9SIqa7KbMNlGpYgXSVlQiJwi-GP2DvAsGGfBqnpj6DMe0VQDxZImpynWCgN3ejz7jNqiX4XKfQbb9aXNd1dt4HNN9',
    },
    {
      id: 'tc2',
      tag: 'HARDWARE',
      title: 'TSMC 2nm chips are now in mass production across Taiwan fabs',
      time: '4h ago',
      readTime: '6 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMgAu1g8O0qMI_VXdEpMyq6whAqL1f93X2nctE7P4XynzbSFQz8lTB36rlD3vzUOfphmH2lnqTQn2tBVmlyDvtsQdIh-eI9iBcSjVdj53z3CdN4WQ4FusZEFePDzuEbs2TWMeNvD-5QMt1xoPRf0rI_8CbZ8-dV6B7ID8bV2-8YXCGyCWQjkjHFmcJemvBuxBu7FkM7LEVk_OgcKHxLKo9jjLirTOPS3YZhay-XpHz5fueiNgsPaGVZ0CKhrTd0iwTBum-lN7cPYGj',
    },
    {
      id: 'tc3',
      tag: 'CYBERSEC',
      title: 'Zero-day in widely deployed Linux kernel patch placed on hold at CISA',
      time: '8h ago',
      readTime: '4 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrmGD_Klswjbq1jLzbGZLGWlx_QNqZCBoQwImZmWlrNjljAorN1w9ldf-rCDMDs7cJUhdnwu7NuUAMfXwTC2KTjAZXwiUctxggChwqrhySoIe1Kz2NsVnziu4C3xICAwHXAQpNQKWhBgZYLYrGKm1FwxBAVdNRfw7ii6V-fSmFJDUky-cD_xEk1U8RsSMMZNIBbeK8Ww4wxXERVmb4BNlJq6V4c3XYpSzeg2GTpPxi0nXnZmjCQcj9NYm5F5MdNJ4nNhhddtp0NfpS',
    },
  ],
  'Economy': [
    {
      id: 'e1',
      tag: 'MARKETS',
      title: 'Fed signals two more rate cuts before end of fiscal year 2025',
      time: '30m ago',
      readTime: '4 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJHp80XYf2ccRkgG5CuZjVQontHkf9zrfw_YIZ1PcwD1FRJUGhwdD4H7bMDU5_x2dFTjUCRx-YE_npcechStJIL-YHUfBw90FmkVOzMaRrGf2dtsDJp6Kbp9RK3PoZNcmDPLg8i8hgghCTf5LpIgr8Ahng1gaM6-2u8X3_HyDIyR_JzyLTHiBzjoKEidrKu_dN4eRKxLCk9b89ifN9yuzg2WWX_zDYh5iHD1DTQzhbV-wr4ib24Fd5VuU1ONvJvbGQdVIrBmmyzFLP',
    },
    {
      id: 'e2',
      tag: 'TRADE',
      title: 'US-China tariff negotiations stall as trade deficit widens to $91B',
      time: '2h ago',
      readTime: '5 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGxPAbeANDOxW8tv8AcZKnjk1KlirGAl9PEjmYtRlnPN2m0NxeVHUOVP5CpAHYkCgnGWE-ckDuiaDsQu1juHyjXKLvlU1B_1ADFIDX2dcCP1SoE8BsXPXLFv0B1vUzEaV45284_59BSxAhXarZXgvvUUd1AUhHm0NOy6eJ3JWZHWKat4D_ISRwbJq8BqcmGiciSAFfKMsG_VgW9gXdSZ8Y7pTh3SdG1ykCwayvgdjPHA90Iwj0_Vi1cvk_42IqBPBJaDMDgnLdtj0c',
    },
    {
      id: 'e3',
      tag: 'FINANCE',
      title: 'Housing bubble fears resurface as mortgage defaults hit a 5-year high',
      time: '4h ago',
      readTime: '6 min read',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjFUANRnN6BpkBVVSVNYeum3tGLfM_-sLMNLfN1P2Yv5F0JknSSO6_6XcbUl4gqucpMrY6xyF0jZTm776cogGjBw1EegKpjWcSDacCBdcHNZYcemv3um250bF23CvFNEAPjBolGLJ42VM4xHj-QWzdzmGPrr6Z5ZaNKpStAtmGWqdM8TAFB7UNmn9SIqa7KbMNlGpYgXSVlQiJwi-GP2DvAsGGfBqnpj6DMe0VQDxZImpynWCgN3ejz7jNqiX4XKfQbb9aXNd1dt4HNN9',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────
// FEATURED STORY  →  future: GET /api/articles/featured
// ─────────────────────────────────────────────────────────────────
export const FEATURED_STORY = {
  id: 'feat1',
  badge: 'EXCLUSIVE REPORT',
  title: 'The Decentralized Future: How Web3 is Re-shaping Local Governance',
  description:
    'An in-depth look at the first digital-first municipality in the Nordic region and its implications for democracy.',
  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN9EkuiFXt21V5St503D6NQ7b7cO7To7xW5ep5FX68sm-2BH4bZFBc37oiAznt-uhjlkAeogRkC8AC6ZmC5pol8igROIfo6VqT8bo6q1-laydbkYfYBMZ8VxHcf6zKLNSWo_BOFyeE_yo4KZljh7Li8lVn6igVaYhnjbiYZgCOG4BGyslH4COCQOzEi7JYKAHc7aGWlZxM9UWU021YNrT8gTAcysAAMJcAvXFdboxVxRGwm-5BbcZNRGVnvx5-hXGuZrpvafxxBntV',
  date: 'Apr 12, 2026',
};

// ─────────────────────────────────────────────────────────────────
// SPOTLIGHT INTERVIEW  →  future: GET /api/spotlight/current
// ─────────────────────────────────────────────────────────────────
export const SPOTLIGHT_INTERVIEW = {
  badge: 'MONTHLY SPOTLIGHT',
  quote:
    '"Information without curation is just noise. We need to build systems that respect the user\'s cognitive load."',
  authorName: 'Dr. Marcus Thorne',
  authorTitle: 'Ethical AI Lead, Vox Dynamics',
  authorAvatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB4ZIhlihs-Mw2t5ZKfsxWyrEPTFCbXVDQgJPizGTiFN0Ini1dTB8h3A1JPWZYGvrbqri70xhgqatcX2iuAXyhH-NDECSTANip0bnPNF9uG_UZU-9xj32VDNdDk_0pvU0ycC7NIcK27UvoyMO-Hjq2o24rsGq7FrxMppiDYpewz5-ySkW3_h8IZFfVrgWM_cgCdEpCJ8pyyIlUv-4auio_EiQkOMl3pbbMLGlTuF8spFp3tqN9hfPooHzkqjl5IQZNf6M3oy7btr7_R',
};

// ─────────────────────────────────────────────────────────────────
// POLLS  →  future: GET /api/polls (array of active polls)
// ─────────────────────────────────────────────────────────────────
export const POLLS = [
  {
    id: 'poll_biometric',
    label: 'Tech & Society',
    question: 'Should biometric data be required for social media verification?',
    options: [
      { id: 'pa', label: 'Strongly Agree',    votes: 420 },
      { id: 'pb', label: 'Agree',             votes: 210 },
      { id: 'pc', label: 'Somewhat Disagree', votes: 280 },
      { id: 'pd', label: 'Strongly Disagree', votes: 150 },
    ],
  },
  {
    id: 'poll_ai_regulation',
    label: 'Artificial Intelligence',
    question: 'Should AI companies face mandatory government audits before releasing new models?',
    options: [
      { id: 'pa', label: 'Yes, absolutely',          votes: 680 },
      { id: 'pb', label: 'Only for high-risk AI',    votes: 520 },
      { id: 'pc', label: 'Self-regulation is better', votes: 180 },
      { id: 'pd', label: 'No regulation needed',     votes: 95  },
    ],
  },
  {
    id: 'poll_remote_work',
    label: 'Work & Lifestyle',
    question: 'What is your preferred working arrangement in 2026?',
    options: [
      { id: 'pa', label: 'Fully remote',        votes: 1240 },
      { id: 'pb', label: 'Hybrid (2-3 days)',   votes: 980  },
      { id: 'pc', label: 'Mostly in-office',    votes: 310  },
      { id: 'pd', label: 'Fully in-office',     votes: 175  },
    ],
  },
  {
    id: 'poll_space',
    label: 'Space & Science',
    question: 'Should governments invest more in space exploration over domestic programs?',
    options: [
      { id: 'pa', label: 'Yes, space is the future',    votes: 540 },
      { id: 'pb', label: 'Balance between both',        votes: 820 },
      { id: 'pc', label: 'Prioritize domestic issues',  votes: 630 },
      { id: 'pd', label: 'Leave it to private sector',  votes: 290 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// DISCUSSION THREADS  →  future: GET /api/discussions?limit=3
// Each thread also has nested replies on comments.
// ─────────────────────────────────────────────────────────────────
export const DISCUSSION_THREADS = [
  {
    id: 'disc_web3_gov',
    title: 'Decentralized Governance: The Future or a Fad?',
    category: 'Politics',
    totalComments: 47,
    totalLikes: 312,
    comments: [
      {
        id: 'c1',
        initials: 'JD',
        name: 'Julian Deva',
        time: '2h ago',
        text: 'The point about decentralized governance in the Nordic region is fascinating. We have seen similar attempts in smaller communities, but a whole municipality is a massive leap. This raises real questions about accountability.',
        likes: 24,
        replies: [
          {
            id: 'c1r1',
            parentId: 'c1',
            initials: 'AM',
            name: 'Alicia M.',
            time: '1h ago',
            text: 'Great point. The accountability issue is the biggest hurdle. Who do you appeal to when the algorithm makes a mistake?',
            likes: 8,
          },
        ],
      },
      {
        id: 'c2',
        initials: 'AM',
        name: 'Alicia M.',
        time: '3h ago',
        text: 'Blockchain-backed voting could work if the tech is auditable. The devil is in the implementation. Most of these pilots fall apart at the integration layer.',
        likes: 18,
        replies: [],
      },
      {
        id: 'c3',
        initials: 'RK',
        name: 'Ravi Kapoor',
        time: '5h ago',
        text: 'I am skeptical. Digital exclusion is real. Not everyone has reliable internet access. Purely digital governance could disenfranchise millions.',
        likes: 31,
        replies: [],
      },
    ],
  },
  {
    id: 'disc_ai_echo',
    title: 'AI News Curation: Are We Living in Echo Chambers?',
    category: 'Technology',
    totalComments: 89,
    totalLikes: 571,
    comments: [
      {
        id: 'd2c1',
        initials: 'SR',
        name: 'Sara Renfrew',
        time: '1h ago',
        text: 'Personalization is a double-edged sword. It improves relevance but at the cost of exposure to diverse viewpoints. We are essentially letting algorithms define our reality.',
        likes: 52,
        replies: [],
      },
      {
        id: 'd2c2',
        initials: 'NK',
        name: 'Neil K.',
        time: '2h ago',
        text: 'Every media outlet curates. The question is whether AI curation is meaningfully different from editorial curation. I would argue it is — scale and speed create qualitatively different effects.',
        likes: 41,
        replies: [
          {
            id: 'd2c2r1',
            parentId: 'd2c2',
            initials: 'SR',
            name: 'Sara Renfrew',
            time: '30m ago',
            text: 'Exactly. A single editor affects thousands. An algorithm affects millions simultaneously with zero human judgment in the loop.',
            likes: 17,
          },
        ],
      },
      {
        id: 'd2c3',
        initials: 'MO',
        name: 'Misaki O.',
        time: '4h ago',
        text: 'The solution is not less AI but better-designed AI. Transparency in ranking factors and user control over recommendation weights would address most concerns.',
        likes: 29,
        replies: [],
      },
    ],
  },
  {
    id: 'disc_carbon',
    title: 'Carbon Credits: Real Solution or Corporate Greenwashing?',
    category: 'Economy',
    totalComments: 63,
    totalLikes: 428,
    comments: [
      {
        id: 'd3c1',
        initials: 'TH',
        name: 'Thomas H.',
        time: '3h ago',
        text: 'The voluntary carbon market is rife with fraud. Multiple investigative reports have found that a significant portion of certified offsets represent no real carbon reduction whatsoever.',
        likes: 67,
        replies: [],
      },
      {
        id: 'd3c2',
        initials: 'LW',
        name: 'Leila W.',
        time: '4h ago',
        text: 'Credits can work if the verification is rigorous. The problem is not the concept but the execution and oversight. Gold Standard certified credits have much better outcomes.',
        likes: 39,
        replies: [],
      },
      {
        id: 'd3c3',
        initials: 'CP',
        name: 'Carlos P.',
        time: '6h ago',
        text: 'Most corporations buy credits to avoid reducing emissions rather than as a supplement to genuine reduction. Until credits are priced high enough to hurt, they are just PR.',
        likes: 88,
        replies: [],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// TRENDING TOPICS (For the "Trending Topics" section in News Screen)
// ─────────────────────────────────────────────────────────────────
export const TRENDING_TOPICS = [
  {
    id: 'tt1',
    topic: 'US Iran Tensions',
    image: 'https://images.unsplash.com/photo-1590455584511-7298516104bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Escalation in the Gulf',
    time: '2h ago',
    source: 'Global News Deck',
    articles: [
      {
        id: 'tt1-1',
        sourceName: 'Reuters',
        sourceLogo: 'https://logo.clearbit.com/reuters.com',
        image: 'https://images.unsplash.com/photo-1574068301540-1e5b80a2b0e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        content: 'Tensions between the United States and Iran have surged significantly following naval confrontations in the strategic Strait of Hormuz. Both nations have deployed additional assets to the region, prompting international concern over potential energy supply disruptions. Diplomatic channels remain open but strained. Analysts warn that any miscalculation could trigger wider regional instability, impacting global markets and oil prices heavily. The UN urges immediate de-escalation.'
      },
      {
        id: 'tt1-2',
        sourceName: 'Al Jazeera',
        sourceLogo: 'https://logo.clearbit.com/aljazeera.com',
        image: 'https://images.unsplash.com/photo-1542361345-89ce18381c81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        content: 'Iranian officials issued stern warnings against what they described as foreign interference in domestic waters. Regional commanders assert readiness to defend territorial integrity against any provocation. Meanwhile, neighboring Gulf states are bolstering their own defenses and calling for mediation. The economic ripple effects are already being felt in local shipping insurance rates. European diplomats are scrambling to salvage communication lines.'
      },
      {
        id: 'tt1-3',
        sourceName: 'CNN',
        sourceLogo: 'https://logo.clearbit.com/cnn.com',
        image: 'https://images.unsplash.com/photo-1555026938-232d3f7cd9bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        content: 'Washington has reiterated its commitment to freedom of navigation in the Middle East amidst rising friction with Tehran. Defense officials briefed lawmakers on contingency plans, stressing a defensive posture rather than offensive intent. Critics argue the heightened rhetoric narrows diplomatic off-ramps. The international community is watching closely, hoping to avert a crisis that could severely hamper global trade routes and economic recovery efforts.'
      }
    ]
  },
  {
    id: 'tt2',
    topic: 'Tech Layoffs 2024',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'Silicon Valley Shifts',
    time: '4h ago',
    source: 'TechPulse Insight',
    articles: [
      {
        id: 'tt2-1',
        sourceName: 'TechCrunch',
        sourceLogo: 'https://logo.clearbit.com/techcrunch.com',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        content: 'The tech sector faces another wave of restructuring as major firms announce strategic workforce reductions. Citing an over-hiring binge during the pandemic and a pivot towards artificial intelligence development, companies are trimming divisions deemed non-core. Tens of thousands of workers have been affected globally. Industry veterans suggest this is a painful but necessary correction to ensure long-term sustainability and align with shifting investor expectations.'
      },
      {
        id: 'tt2-2',
        sourceName: 'Wired',
        sourceLogo: 'https://logo.clearbit.com/wired.com',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        content: 'Beyond the numbers, the human toll of the recent tech layoffs is sparking debates about corporate responsibility. Severance packages vary wildly, and many on work visas find themselves in perilous situations facing tight deadlines to secure new employment. Labor organizers are seeing renewed interest among tech workers. Simultaneously, a wave of newly unemployed talent is attempting to launch independent startups, hoping to disrupt the very giants that let them go.'
      }
    ]
  },
  {
    id: 'tt3',
    topic: 'Climate Summits',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'New Climate Pledges',
    time: '6h ago',
    source: 'Eco Watch',
    articles: [
      {
        id: 'tt3-1',
        sourceName: 'BBC News',
        sourceLogo: 'https://logo.clearbit.com/bbc.com',
        image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        content: 'Global leaders convened today with ambitious new targets to curb greenhouse gas emissions by 2040. Developing nations secured crucial financing commitments for renewable energy transitions, a key sticking point in previous negotiations. However, environmental watchdogs remain skeptical, demanding concrete action plans rather than distant promises. The transition phase must rapidly accelerate to avoid irreversible climatic tipping points, scientists urgently warned world leaders.'
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────
// EXPLAINERS (For the "EXPLAINERS" section in News Screen)
// ─────────────────────────────────────────────────────────────────
export const EXPLAINERS = [
  {
    id: 'exp1',
    topic: 'Ozempic Explained',
    badge: 'HEALTH TRENDS',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5e16ec31f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'The Rise of Weight-Loss Drugs',
    summary: 'A detailed breakdown of how GLP-1 drugs work, their side effects, and the global shortage.',
    cards: [
      {
        id: 'exp1-1',
        title: 'What is Ozempic?',
        text: 'Originally developed to treat Type 2 diabetes, Ozempic (semaglutide) gained spectacular global attention for its significant weight-loss side effects. It works by mimicking a naturally occurring hormone called GLP-1, which targets areas of the brain that regulate appetite and food intake, effectively making patients feel much fuller after eating smaller portions.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5e16ec31f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'exp1-2',
        title: 'How does it work?',
        text: 'The drug slows down gastric emptying, meaning food leaves the stomach more slowly. This prolonged feeling of fullness significantly reduces daily caloric intake. Furthermore, it stimulates insulin release when blood sugar levels are high, which is its primary diabetic function, but the appetite suppression is what drove off-label prescription surges.',
        image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'exp1-3',
        title: 'The Shortage Crisis',
        text: 'Fueled by social media trends and celebrity endorsements, demand skyrocketed, leading to severe global shortages. This created a crisis where diabetic patients who rely on the medication for essential blood sugar management struggled to fill their necessary prescriptions, prompting regulatory warnings to prioritize diabetic care over cosmetic weight loss.',
        image: 'https://images.unsplash.com/photo-1549423719-70377ee1ac4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'exp1-4',
        title: 'Side Effects & Future',
        text: 'Patients often report gastrointestinal issues ranging from mild nausea to severe stomach paralysis in rare cases. Long-term effects of usage by non-diabetics remain understudied. Stop taking it, and the weight typically returns. The pharmaceutical industry is now racing to develop next-generation pills to replace these weekly injections.',
        image: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'exp2',
    topic: 'Quantum Computing',
    badge: 'TECH DEEP DIVE',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'The Next Tech Revolution',
    summary: 'Understanding qubits, superposition, and why tech giants are racing to build the ultimate machine.',
    cards: [
      {
        id: 'exp2-1',
        title: 'Beyond Binary Bits',
        text: 'Classical computers use bits representing 0 or 1. Quantum computers use qubits, which can represent 0, 1, or both simultaneously thanks to a quantum property called superposition. This allows them to process vast amounts of complex possibilities concurrently, making them infinitely more powerful for specific types of algorithmic problem-solving.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'exp2-2',
        title: 'Quantum Entanglement',
        text: 'Another crucial principle is entanglement. When qubits become entangled, the state of one instantly influences the state of another, regardless of the physical distance between them. This allows quantum systems to solve incredibly complex correlating equations exponentially faster than the best supercomputers currently in existence.',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'exp2-3',
        title: 'Real-World Applications',
        text: 'Quantum computing promises to revolutionize fields like drug discovery by perfectly simulating molecular interactions, optimize global logistics routing in real-time, and solve unprecedented climate modeling problems. However, it also poses a massive threat to current encryption methods, prompting a race for quantum-secure cybersecurity.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    id: 'exp3',
    topic: 'Space Debris',
    badge: 'SPACE SCIENCE',
    image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    title: 'The Crowded Orbit',
    summary: 'How defunct satellites and junk threaten future space exploration and global communication.',
    cards: [
      {
        id: 'exp3-1',
        title: 'The Rising Threat',
        text: 'Earth\'s orbit is becoming crowded. Millions of pieces of "space junk"—defunct satellites, spent rocket stages, and collision fragments—are currently orbiting our planet. Even a tiny piece of debris, traveling at orbital speeds of 17,500 mph, can cause catastrophic damage to active satellites and crewed spacecraft.',
        image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'exp3-2',
        title: 'Kessler Syndrome',
        text: 'Scientists worry about the Kessler Syndrome: a theoretical scenario where the density of objects in low Earth orbit becomes high enough that collisions create more debris, leading to a cascading, runaway effect. This could eventually render low Earth orbit completely unusable for generations, killing satellite communications.',
        image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'exp3-3',
        title: 'Cleaning Up',
        text: 'Agencies are actively testing new concepts for active debris removal, including space harpoons, giant nets, and magnetic tugs. However, international law regarding who is legally responsible for removing old debris remains murky and unresolved, making cleanup operations politically and financially incredibly complicated.',
        image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];
