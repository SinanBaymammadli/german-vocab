// Words that are near-identical to English — pre-marked as learned on first open.
// Users can undo via the Learned tab.

// Direct loanwords / internationally identical words
const LOANWORDS = new Set([
  'App','Baby','Ball','Blog','Bus','Camping','Chaos','Chat','Cola',
  'Computer','Design','Email','Feedback','Film','Fitness','Forum',
  'Golf','Grill','Handball','Hotel','Humor','Internet','Job','Kamera',
  'Laptop','Marketing','Massage','Material','Meditation','Modul',
  'Museum','Musik','Normal','Online','Option','PC','Park','Party',
  'Pilot','Pilates','Pizza','Pool','Porto','Programm','Projekt',
  'Radio','Recycling','Restaurant','Roboter','Sandwich','Service',
  'Shopping','Shorts','Smartphone','Snack','Software','Sport','Steak',
  'Stress','Symbol','System','Tablet','Taxi','Team','Test','Theater',
  'Toast','Training','Trend','Video','Volleyball','Volleyball','Wifi',
  'Workshop','Yoga',
  // A2/A1 common ones
  'Toaster','Handy','Hobby','Supermarkt','Supermarkt','Kiosk',
  'Café','Disco','Disko','Drama','Euro','Kilo','Kino','Klima',
  'Konzert','Kultur','Liter','Mango','Menu','Meter','Motor',
  'Museum','Natur','Opera','Park','Pasta','Planet','Plus',
  'Poster','Problem','Produkt','Profil','Protest','Pub',
  'Satellit','Sauna','Sofa','Solo','Sport','Standard','Start',
  'Station','Status','Stereo','Studio','Sturm','Super',
  'Tango','Tattoo','Technik','Tempo','Tennis','Terror',
  'Text','Ticket','Tipp','Ton','Tour','Tourist',
  'Uniform','Universal','Vitamin','Zone','Zoo',
]);

// Systematic endings that almost always map to English equivalents
const PATTERNS = [
  // -tion → -tion (Demonstration, Integration, Investition...)
  [/tion$/i, w => w.english?.includes('tion')],
  // -ität → -ity (Qualität, Aktivität...)
  [/ität$/i, () => true],
  // -ie → -y (Demokratie, Energie, Therapie...)
  [/ie$/i, w => w.english?.match(/y$|ie$/)],
  // -ell → -al (individuell, professionell...)
  [/ell$/i, w => w.english?.includes('al')],
  // -isch → -ic/-ical (historisch, biologisch...)
  [/isch$/i, w => w.english?.match(/ic$|ical$/)],
  // -iv → -ive (aktiv, kreativ, positiv...)
  [/iv$/i, w => w.english?.includes('ive')],
  // -ismus → -ism (Nationalismus, Rassismus...)
  [/ismus$/i, () => true],
  // -ist/-istin → -ist (Pianist, Optimist...)
  [/ist(in)?$/i, () => true],
];

export function getEasyWordIds(allWords) {
  const ids = [];
  for (const word of allWords) {
    const g = word.german ?? '';
    // Strip article
    const bare = g.replace(/^(der|die|das|sich) /i, '').trim();

    if (LOANWORDS.has(bare)) { ids.push(word.id); continue; }

    let matched = false;
    for (const [pattern, check] of PATTERNS) {
      if (pattern.test(bare) && check(word)) { matched = true; break; }
    }
    if (matched) ids.push(word.id);
  }
  return ids;
}
