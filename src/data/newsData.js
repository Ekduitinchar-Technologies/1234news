export const categories = [
  { id: 'all', label: 'For You' },
  { id: 'tech', label: 'Technology' },
  { id: 'world', label: 'World' },
  { id: 'business', label: 'Business' },
  { id: 'science', label: 'Science' },
  { id: 'health', label: 'Health' },
  { id: 'sports', label: 'Sports' },
  { id: 'entertainment', label: 'Entertainment' },
];

export const articles = [
  {
    id: '1',
    category: 'tech',
    categoryLabel: 'Technology',
    title: 'OpenAI Unveils GPT-5 with Unprecedented Reasoning Capabilities',
    summary: 'GPT-5 marks a landmark leap in AI, combining next-token prediction with a self-verification layer that checks outputs before responding. Benchmarks place it in the 97th percentile for maths olympiad problems, outperforming PhD experts. In legal analysis it beat experienced attorneys at 91% accuracy. The EU is weighing an emergency AI Act conformity review while OpenAI has already rolled out API access to enterprise customers worldwide.',
    fullBody: `OpenAI's GPT-5 represents the most significant architectural leap since the original transformer. Unlike its predecessors, GPT-5 employs a hybrid reasoning engine that combines traditional next-token prediction with a novel chain-of-thought verification layer — allowing the model to check its own outputs before delivering a response.

In standardised benchmark testing conducted across 14 research institutions, GPT-5 scored in the 97th percentile on the MATH olympiad dataset, outperforming the previous record held by a team of PhD mathematicians. In legal analysis tasks, the model correctly identified case precedent relevance with 91% accuracy, compared to 76% for experienced attorneys.

CEO Sam Altman described the release as "a genuine step toward systems that can participate in scientific discovery," while simultaneously acknowledging that the company has instituted new safety guardrails including output rate-limiting for sensitive medical contexts.

Critics, however, warn the launch could accelerate job displacement in white-collar professions. The AI Safety Institute has called for an emergency regulatory review, and the European Commission has indicated it may invoke Article 53 of the AI Act to mandate a conformity assessment before commercial deployment within EU member states.

OpenAI has made GPT-5 available via its API to enterprise customers immediately, with a broader public rollout through ChatGPT expected within 30 days.`,
    imageUrl: 'https://picsum.photos/seed/ai1/800/500',
    author: 'Sarah Chen',
    publishedAt: '2 hours ago',
    readTime: '4 min read',
    isFeatured: true,
    isBookmarked: false,
    likes: 2841,
    comments: 347,
    sources: [
      { label: 'OpenAI Blog', url: 'https://openai.com/blog' },
      { label: 'MIT Technology Review', url: 'https://www.technologyreview.com' },
      { label: 'The Verge', url: 'https://www.theverge.com' },
    ],
  },
  {
    id: '2',
    category: 'world',
    categoryLabel: 'World',
    title: 'G20 Summit Reaches Historic Climate Finance Agreement',
    summary: 'G20 leaders in Rio reached a landmark $3 trillion climate finance deal after four tense days of talks. The package introduces a debt-for-climate swap allowing developing nations to cancel sovereign debt by committing to renewable energy targets, plus a technology corridor requiring G7 members to share clean energy patents. Fourteen nations have pledged to join the first funding tranche, though critics warn emissions-reduction language remains dangerously vague.',
    fullBody: `After four days of gruelling negotiations in Rio de Janeiro, G20 leaders emerged with a deal that climate scientists are calling the most consequential multilateral agreement since the 2015 Paris Accord. The $3 trillion package will be disbursed over 15 years through a combination of public grants, concessional loans, and a pioneering "debt-for-climate" swap mechanism.

The swap mechanism — championed by Brazil and backed by the IMF — allows heavily indebted developing nations to cancel portions of sovereign debt in exchange for binding commitments to renewable energy capacity targets. Fourteen nations, primarily in sub-Saharan Africa and Southeast Asia, have already indicated intent to participate in the first tranche.

The agreement also establishes what negotiators are calling a "technology transfer corridor," requiring G7 members to share patents for solar panel manufacturing, advanced battery storage, and green hydrogen production with developing economies at preferential licensing rates.

Critics point out that the language on binding emissions reductions remains vague, with commitments tied to "best-effort" frameworks rather than hard penalties. The fossil fuel lobby in the United States successfully lobbied to keep natural gas classified as a "transition fuel" under the agreement's taxonomy.

UN Secretary-General António Guterres welcomed the deal but cautioned that "commitments on paper must become megawatts in the ground" if the global community is to limit warming to 1.5°C above pre-industrial levels.`,
    imageUrl: 'https://picsum.photos/seed/climate2/800/500',
    author: 'James Weller',
    publishedAt: '4 hours ago',
    readTime: '5 min read',
    isFeatured: true,
    isBookmarked: false,
    likes: 1520,
    comments: 218,
    sources: [
      { label: 'Reuters', url: 'https://www.reuters.com' },
      { label: 'BBC World News', url: 'https://www.bbc.com/news/world' },
      { label: 'UN Climate Portal', url: 'https://unfccc.int' },
    ],
  },
  {
    id: '3',
    category: 'business',
    categoryLabel: 'Business',
    title: 'Apple Announces $200B Stock Buyback and Dividend Hike',
    summary: 'Apple smashed Q2 expectations by $8.3 billion, driven by iPhone 16 strength in emerging markets and a Services segment crossing $30 billion for the first time, with 78% gross margins. The company announced a $200 billion share buyback — the largest in corporate history — and raised its dividend by 10%. Shares surged 5.8% to $224, pushing Apple\'s market cap back above $3.4 trillion.',
    fullBody: `Apple's fiscal Q2 results obliterated Wall Street consensus estimates by $8.3 billion, driven by a combination of factors analysts describe as a "perfect quarterly storm." iPhone 16 demand proved far more resilient than feared, particularly in emerging markets where localised pricing strategies and carrier financing programmes expanded the addressable base. India alone accounted for $7.4 billion in revenue — a 34% year-over-year increase.

The Services segment crossed the $30 billion quarterly threshold for the first time, fuelled by record App Store billings, Apple TV+ subscriber growth following the global hit series "Meridian," and expanding Apple Intelligence subscription tier adoption. Gross margins for Services reached 78.2%, underscoring why investors increasingly view Apple as much a software company as a hardware manufacturer.

The $200 billion buyback programme — the largest in corporate history — will be executed over the next three fiscal years and is expected to retire approximately 8% of outstanding shares at current prices. CFO Luca Maestri described it as a "signal of supreme confidence in the durability of our cash generation."

Not everyone is celebrating. Senator Elizabeth Warren has called for congressional hearings on the buyback, arguing the capital would be better deployed in domestic manufacturing investment or workforce development. Apple currently manufactures the majority of its products in China, though it has pledged to shift 30% of iPhone production to India by 2026.

Shares closed up 5.8% at $224.40, pushing Apple's market capitalisation back above $3.4 trillion.`,
    imageUrl: 'https://picsum.photos/seed/apple3/800/500',
    author: 'Priya Nair',
    publishedAt: '6 hours ago',
    readTime: '3 min read',
    isFeatured: false,
    isBookmarked: false,
    likes: 983,
    comments: 145,
    sources: [
      { label: 'Apple Investor Relations', url: 'https://investor.apple.com' },
      { label: 'Bloomberg Markets', url: 'https://www.bloomberg.com/markets' },
      { label: 'Financial Times', url: 'https://www.ft.com' },
    ],
  },
  {
    id: '4',
    category: 'science',
    categoryLabel: 'Science',
    title: 'NASA Confirms Water Ice Deposits Near Mars South Pole',
    summary: 'NASA has confirmed vast sub-surface water ice deposits near Mars\'s south pole using SHARAD radar data collected over seven Martian years. The deposits extend 1.8 km deep, holding enough water to cover the planet in an 8.4-metre ocean. The ice lies beneath CO₂ and regolith, but the pole\'s near-continuous summer sunlight makes in-situ extraction theoretically feasible for future crewed missions to the red planet.',
    fullBody: `The findings, published in Nature Geoscience, are based on SHARAD (Shallow Radar) soundings collected over seven Martian years — equivalent to approximately 13 Earth years. The data reveals stratified ice sheets extending to depths of 1.8 kilometres beneath the southern polar layered deposits, comprising a mixture of water ice and fine dust particles in a ratio that scientists say is 85% pure water ice by volume.

The sheer scale of the deposit is staggering. Lead author Dr. Elena Vasquez of the Jet Propulsion Laboratory estimates the total water equivalent volume at approximately 1.2 million cubic kilometres — comparable to Lake Superior multiplied by 30. If returned to liquid form, this volume would theoretically cover the Martian surface to an average depth of 8.4 metres.

Critically, the ice is not accessible at the surface. It lies beneath a permanent layer of carbon dioxide ice and regolith that would require significant excavation technology to access. However, the proximity to the south pole — which receives near-continuous solar illumination during the southern Martian summer — makes in-situ resource utilisation (ISRU) theoretically feasible for future crewed missions.

NASA's Artemis-Mars programme chief, Dr. Rashid Hassan, called the confirmation "the single most important discovery for the human Mars programme since the initial detection of subsurface water." SpaceX's internal mission planning documents, leaked last month, reportedly already incorporate southern polar landing zone options contingent on precisely this kind of confirmation.

The next step will be targeted drilling experiments proposed for the Mars Sample Return mission extension, currently under congressional budget review.`,
    imageUrl: 'https://picsum.photos/seed/mars4/800/500',
    author: 'Dr. Elena Vasquez',
    publishedAt: '8 hours ago',
    readTime: '5 min read',
    isFeatured: false,
    isBookmarked: true,
    likes: 3204,
    comments: 412,
    sources: [
      { label: 'NASA JPL', url: 'https://www.jpl.nasa.gov' },
      { label: 'Nature Geoscience', url: 'https://www.nature.com/ngeo' },
      { label: 'Science Daily', url: 'https://www.sciencedaily.com' },
    ],
  },
  {
    id: '5',
    category: 'health',
    categoryLabel: 'Health',
    title: 'Breakthrough mRNA Vaccine Shows 94% Efficacy Against Multiple Cancer Types',
    summary: 'A personalised mRNA cancer vaccine showed 94% disease-free survival at 24 months across 12 cancer types in a 4,200-patient trial, versus 51.7% on standard chemotherapy. Built from each patient\'s tumour biopsy, it trains the immune system to target unique neoantigens. Pancreatic cancer survival more than doubled. The FDA granted Breakthrough Therapy designation while Moderna and BioNTech are scaling production capacity to 50,000 patients annually.',
    fullBody: `The phase III trial, designated HERALD-3, enrolled 4,200 patients across 28 oncology centres in North America and Europe. Participants were randomised to receive either the personalised mRNA vaccine — produced from genomic sequencing of each patient's own tumour biopsy — or standard-of-care chemotherapy alone. The results, published simultaneously in the New England Journal of Medicine, showed a 94.3% disease-free survival rate at 24 months in the vaccine arm versus 51.7% in the control group.

The vaccine's personalisation process takes approximately 6 weeks from biopsy to first injection. Using next-generation sequencing, scientists identify up to 20 neoantigens — protein fragments unique to tumour cells — and encode them into lipid nanoparticle-wrapped mRNA sequences. When injected, the patient's own immune cells learn to recognise and destroy any cell displaying these markers.

Perhaps most notably, the vaccine demonstrated efficacy across 12 cancer types tested, including notoriously treatment-resistant pancreatic cancer and glioblastoma, where median survival historically measured in months. For pancreatic cancer specifically, 24-month survival in the vaccine group was 68% — compared to a historical benchmark of roughly 12%.

Dr. Michael Park, the trial's principal investigator, cautioned that manufacturing personalisation at scale remains "the central challenge." Current production capacity can serve approximately 50,000 patients per year globally. Multiple mRNA manufacturers including Moderna and BioNTech have announced partnerships to scale capacity, with commercial availability targeted for late next year pending FDA approval.

The FDA has granted the treatment Breakthrough Therapy designation, expediting its review timeline.`,
    imageUrl: 'https://picsum.photos/seed/health5/800/500',
    author: 'Dr. Michael Park',
    publishedAt: '10 hours ago',
    readTime: '6 min read',
    isFeatured: false,
    isBookmarked: false,
    likes: 4512,
    comments: 589,
    sources: [
      { label: 'NEJM', url: 'https://www.nejm.org' },
      { label: 'Memorial Sloan Kettering', url: 'https://www.mskcc.org' },
      { label: 'FDA Newsroom', url: 'https://www.fda.gov/news-events' },
    ],
  },
  {
    id: '6',
    category: 'tech',
    categoryLabel: 'Technology',
    title: 'Google DeepMind\'s AlphaFold 3 Solves Protein-Drug Interaction Problem',
    summary: 'AlphaFold 3 predicts not just protein shapes but how they interact with drug molecules, achieving binding pose accuracy within 0.9 Ångströms — for the first time making predictions clinically useful. AstraZeneca has moved three oncology candidates from virtual screening to in-vitro validation in under four months, a process that previously took years. The model is free for academic research, with a commercial API available for industry partners.',
    fullBody: `AlphaFold 3 builds on the Nobel Prize-winning protein structure prediction technology with a fundamentally new diffusion-based architecture that enables it to model not just static protein shapes, but the dynamic conformational changes that occur when proteins interact with small molecules — the core mechanism of virtually all drug therapies.

In head-to-head comparisons with experimental data from the Protein Data Bank, AlphaFold 3 predicted protein-ligand binding poses with a median RMSD of 0.9 Ångströms — well within the threshold considered "experimentally accurate" — compared to 2.7 Ångströms for the previous best computational method. For drug discovery, this means the difference between a useful prediction and one that sends chemists down a dead end.

AstraZeneca, Novo Nordisk, and Pfizer have all confirmed active integration of AlphaFold 3 into their early-stage discovery workflows. An AstraZeneca spokesperson disclosed that three oncology candidates have moved from virtual screening to in vitro validation in under four months — a process that previously took two to three years.

The model is available through a free academic web service and a commercial API for industry partners. DeepMind has committed to open-sourcing the model weights for non-commercial research within six months, a decision that has drawn praise from academics but criticism from biotech investors who argue it undermines the competitive moat of companies that licensed the technology early.

The research team cautioned that the model still struggles with intrinsically disordered proteins and highly flexible binding sites, areas that represent active development priorities for AlphaFold 4.`,
    imageUrl: 'https://picsum.photos/seed/deepmind6/800/500',
    author: 'Alex Reeves',
    publishedAt: '12 hours ago',
    readTime: '4 min read',
    isFeatured: false,
    isBookmarked: false,
    likes: 1876,
    comments: 203,
    sources: [
      { label: 'DeepMind Blog', url: 'https://deepmind.google/blog' },
      { label: 'Nature', url: 'https://www.nature.com' },
      { label: 'Science Magazine', url: 'https://www.science.org' },
    ],
  },
  {
    id: '7',
    category: 'world',
    categoryLabel: 'World',
    title: 'European Parliament Passes Landmark Digital Services Act Amendments',
    summary: 'The European Parliament voted 412–189 to tighten the Digital Services Act, bringing platforms with over 10 million EU users under full DSA obligations. New rules mandate real-time algorithmic transparency dashboards for every citizen and ban synthetic engagement amplification near elections, with criminal liability for executives. Meta and X Corp have vowed to challenge the provisions at the European Court of Justice before the 90-day implementation deadline.',
    fullBody: `The European Parliament voted 412 to 189 to adopt the DSA Amendment Package, described by rapporteur MEP Sophie Delacroix as "the most consequential update to platform governance since the original GDPR." The core provisions expand the definition of "very large online platforms" to include any service with more than 10 million monthly active users in the EU — down from the previous 45 million threshold — bringing mid-tier platforms including Telegram and several AI chatbot services under full DSA obligations for the first time.

Most controversially, the amendments introduce mandatory real-time algorithmic transparency dashboards that must be accessible to any EU citizen. Users will be able to see why specific content was recommended, what weight was given to engagement signals versus recency, and how the algorithm ranked their personal feed. Platforms have 90 days to implement functional dashboards or face fines of up to 6% of global annual turnover.

A new prohibition on "synthetic engagement amplification" targets the use of bot networks and coordinated inauthentic behaviour to artificially inflate the reach of political content in the 30 days preceding any EU election. Violations carry criminal liability for executives in addition to corporate fines — a provision that Meta and X Corp have vowed to challenge at the European Court of Justice.

The amendments also expand whistleblower protections for platform employees who report algorithmic manipulation to national Digital Services Coordinators, a mechanism that was widely criticised as toothless in the original DSA.

The rules enter into force 90 days after publication in the Official Journal of the European Union.`,
    imageUrl: 'https://picsum.photos/seed/eu7/800/500',
    author: 'Marta Kowalski',
    publishedAt: '14 hours ago',
    readTime: '4 min read',
    isFeatured: false,
    isBookmarked: false,
    likes: 742,
    comments: 98,
    sources: [
      { label: 'European Parliament', url: 'https://www.europarl.europa.eu' },
      { label: 'Politico Europe', url: 'https://www.politico.eu' },
      { label: 'The Guardian', url: 'https://www.theguardian.com' },
    ],
  },
  {
    id: '8',
    category: 'sports',
    categoryLabel: 'Sports',
    title: 'World Athletics Record Broken at Berlin Grand Prix — Sub-3:40 Mile',
    summary: 'Jakob Ingebrigtsen ran 3:39.84 at the Berlin Grand Prix, becoming the first human to break 3 minutes 40 seconds for the mile, shaving 1.06 seconds off a record that stood for two decades. Racing with relay-format pacers on a warm night at near-perfect conditions, he unleashed a savage 53.8-second final lap. Critics are now debating whether paced-only road records deserve a separate classification from championship marks.',
    fullBody: `At 9:47 PM local time on a warm Berlin evening, Jakob Ingebrigtsen crossed the finish line of the Olympiastadion track to cheers that shook the grandstands. His time of 3:39.84 shaved 1.06 seconds off the previous world record held by Morocco's Hicham El Guerrouj, a record that had stood for over two decades.

Ingebrigtsen, 26, had been targeting the record for three seasons and made no secret of his intentions. Racing with four world-class pacers rotating through 400-metre splits of 54.5, 54.8, 55.0, and a blistering 55.5, he executed the race with a precision that left commentators searching for superlatives. He broke from the pacers with 350 metres remaining and ran the final lap in 53.8 seconds — a kick of extraordinary savagery.

The conditions were near-perfect: 18°C, 2 m/s tailwind within legal limits, and a barometric pressure that coaches noted was favourable for oxygen uptake. Critics immediately pointed to the pacing configuration, with some statisticians arguing the relay-format pacing provides an artificial advantage not available in championship racing. World Athletics rules permit the practice, but a growing faction within the sport is lobbying for a secondary "championship conditions" record to exist alongside assisted marks.

For Ingebrigtsen, the achievement caps a season in which he has already claimed the 1500m and 5000m Diamond League titles. His coach, Gjert Ingebrigtsen, confirmed the team will now shift focus toward the World Championships in Tokyo, where Jakob is overwhelming favourite for a treble across three distance events.`,
    imageUrl: 'https://picsum.photos/seed/sports8/800/500',
    author: 'Tom Fitzgerald',
    publishedAt: '1 day ago',
    readTime: '3 min read',
    isFeatured: false,
    isBookmarked: false,
    likes: 5621,
    comments: 891,
    sources: [
      { label: 'World Athletics', url: 'https://www.worldathletics.org' },
      { label: 'Athletics Weekly', url: 'https://www.athleticsweekly.com' },
      { label: 'BBC Sport', url: 'https://www.bbc.com/sport' },
    ],
  },
  {
    id: '9',
    category: 'entertainment',
    categoryLabel: 'Entertainment',
    title: 'Christopher Nolan\'s "Odyssey" Breaks Opening Weekend Box Office Records',
    summary: 'Christopher Nolan\'s Odyssey grossed $540 million globally in its opening weekend, eclipsing the previous record by $62 million. Shot on 65mm IMAX film with custom anamorphic lenses — an experience streaming cannot replicate — the space disaster epic has audiences returning for second viewings. Cate Blanchett\'s lead performance is generating early Oscar consensus while Hans Zimmer\'s pipe organ score debuted at number one on the classical charts.',
    fullBody: `Christopher Nolan's 13th feature film has done what few in Hollywood believed possible in the current streaming era: it has made going to the cinema feel essential again. "Odyssey" — the story of a near-future deep-space mission gone catastrophically wrong — opened on 7,400 screens across 47 countries and grossed $540 million global in its opening weekend, surpassing the previous record by $62 million.

The film was shot entirely on 65mm IMAX film stock, with Nolan and cinematographer Hoyte van Hoytema developing custom anamorphic lenses that capture an image resolution equivalent to 18K. In IMAX auditoriums, the image fills the entire curved screen — a visual experience that streaming cannot replicate and that audiences appear willing to pay a premium for. Average IMAX ticket prices of $28 contributed disproportionately to the opening gross.

Cate Blanchett leads the ensemble as Dr. Celeste Rourke, mission commander and the sole survivor of the initial disaster. Her performance, described by critics as "the finest hour of a career defined by them," is already generating significant awards conversation. Tom Hardy co-stars as the AI system aboard the vessel — a role he performs entirely through voice acting and motion capture — in what he has described as "the most challenging and rewarding work I've done."

The film's combination of practical spacecraft sets built at Elstree Studios, location photography in Antarctica and the Atacama Desert, and restrained (for Nolan) use of visual effects has been universally praised. The score, composed by Hans Zimmer in collaboration with the London Symphony Orchestra and a custom-built pipe organ, is already available on streaming platforms and entered the classical chart at number one.

Nolan has declined to confirm whether "Odyssey" constitutes the beginning of a planned trilogy, saying only that he has "ideas about where this world could go."`,
    imageUrl: 'https://picsum.photos/seed/movie9/800/500',
    author: 'Rachel Bloom',
    publishedAt: '1 day ago',
    readTime: '4 min read',
    isFeatured: false,
    isBookmarked: true,
    likes: 7823,
    comments: 1204,
    sources: [
      { label: 'Variety', url: 'https://variety.com' },
      { label: 'The Hollywood Reporter', url: 'https://www.hollywoodreporter.com' },
      { label: 'Box Office Mojo', url: 'https://www.boxofficemojo.com' },
    ],
  },
  {
    id: '10',
    category: 'business',
    categoryLabel: 'Business',
    title: 'SpaceX Starship Completes First Commercial Payload Mission Successfully',
    summary: 'SpaceX Starship completed its first commercial payload mission, deploying 40 Starlink Gen3 satellites to a 340 km orbit before executing its fourth consecutive booster catch at the Mechazilla tower arms. All satellites linked with ground stations within 12 minutes. At projected costs of $97 per kilogram to LEO — versus $2,700 for Falcon 9 — the commercial launch industry faces a structural reset. NASA called the data confidence-building for future crewed flights.',
    fullBody: `IFT-9, the ninth integrated test flight of Starship, was always intended to be different. Unlike its predecessors — which prioritised proving out the vehicle's aerodynamics, reentry thermal protection, and propulsion systems — IFT-9 carried a real, revenue-generating payload for the first time: 40 Starlink Gen3 satellites stacked in a custom dispenser integration.

Liftoff from Boca Chica, Texas occurred at 14:42 UTC. The Super Heavy booster, powered by 33 Raptor 3 engines generating approximately 74 meganewtons of thrust at liftoff, executed a nominal ascent profile before separating cleanly at T+2:52. The booster then conducted a series of boostback and landing burns before being caught by the "Mechazilla" tower-mounted mechanical arms at T+7:42 — a precision manoeuvre that SpaceX engineers described as "textbook." This marks the fourth consecutive successful booster catch.

Ship continued to orbit, deploying all 40 satellites in two batches over a 47-minute period in the target 340km circular orbit. All satellites established communication with SpaceX ground stations within 12 minutes of deployment — a near-perfect deployment sequence. Ship subsequently executed a deorbit burn and performed a controlled ocean splashdown in the Indian Ocean, where recovery vessels retrieved heat shield tile samples for post-flight analysis.

Elon Musk announced via post that with IFT-9's success, SpaceX is now targeting a launch cadence of one Starship mission per month by Q4, rising to one per week by mid-next year. At the projected payload cost of $97 per kilogram to LEO — compared to Falcon 9's ~$2,700/kg — analysts project a fundamental restructuring of the commercial launch industry.

NASA's Artemis programme, which has contracted Starship as the Human Landing System for Moon missions, confirmed IFT-9's data "significantly advances our confidence" in the vehicle's readiness for crewed operations.`,
    imageUrl: 'https://picsum.photos/seed/spacex10/800/500',
    author: 'Connor Walsh',
    publishedAt: '2 days ago',
    readTime: '5 min read',
    isFeatured: false,
    isBookmarked: false,
    likes: 9104,
    comments: 1543,
    sources: [
      { label: 'SpaceX Updates', url: 'https://www.spacex.com/updates' },
      { label: 'Ars Technica Space', url: 'https://arstechnica.com/space' },
      { label: 'NASA.gov', url: 'https://www.nasa.gov' },
    ],
  },
];

export const topStories = articles.filter(a => a.isFeatured || a.likes > 3000).slice(0, 5);

export const comments = [
  {
    id: 'c1',
    author: 'TechWatcher2049',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    text: 'This is genuinely groundbreaking. The implications for drug discovery alone could save millions of lives.',
    time: '1h ago',
    likes: 142,
  },
  {
    id: 'c2',
    author: 'SkepticalSam',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    text: 'Let\'s pump the brakes. We\'ve seen "breakthrough" AI announcements before. I\'ll believe it when peer-reviewed results are published.',
    time: '2h ago',
    likes: 89,
  },
  {
    id: 'c3',
    author: 'FuturistFinn',
    avatar: 'https://picsum.photos/seed/user3/100/100',
    text: 'The convergence of AI and biotech is accelerating faster than anyone predicted. Exciting times.',
    time: '3h ago',
    likes: 56,
  },
  {
    id: 'c4',
    author: 'NewsAnalyst',
    avatar: 'https://picsum.photos/seed/user4/100/100',
    text: 'The regulatory implications are enormous. We need global governance frameworks before this gets too far ahead.',
    time: '4h ago',
    likes: 34,
  },
];
