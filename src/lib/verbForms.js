// Irregular / strong verb forms: infinitive → [präteritum, partizip2, aux]
// aux: 'h' = haben, 's' = sein, 'h/s' = both possible
const IRREGULAR = {
  // sein, haben, werden
  'sein':        ['war', 'gewesen', 's'],
  'haben':       ['hatte', 'gehabt', 'h'],
  'werden':      ['wurde', 'geworden', 's'],
  // motion/position – sein
  'gehen':       ['ging', 'gegangen', 's'],
  'kommen':      ['kam', 'gekommen', 's'],
  'fahren':      ['fuhr', 'gefahren', 's'],
  'fliegen':     ['flog', 'geflogen', 's'],
  'laufen':      ['lief', 'gelaufen', 's'],
  'rennen':      ['rannte', 'gerannt', 's'],
  'reisen':      ['reiste', 'gereist', 's'],
  'fallen':      ['fiel', 'gefallen', 's'],
  'steigen':     ['stieg', 'gestiegen', 's'],
  'einsteigen':  ['stieg ein', 'eingestiegen', 's'],
  'aussteigen':  ['stieg aus', 'ausgestiegen', 's'],
  'umsteigen':   ['stieg um', 'umgestiegen', 's'],
  'ankommen':    ['kam an', 'angekommen', 's'],
  'abfahren':    ['fuhr ab', 'abgefahren', 's'],
  'losfahren':   ['fuhr los', 'losgefahren', 's'],
  'wegfahren':   ['fuhr weg', 'weggefahren', 's'],
  'zurückfahren':['fuhr zurück', 'zurückgefahren', 's'],
  'aufstehen':   ['stand auf', 'aufgestanden', 's'],
  'einschlafen': ['schlief ein', 'eingeschlafen', 's'],
  'aufwachen':   ['wachte auf', 'aufgewacht', 's'],
  'umziehen':    ['zog um', 'umgezogen', 's'],
  'einziehen':   ['zog ein', 'eingezogen', 's'],
  'ausziehen':   ['zog aus', 'ausgezogen', 's/h'],
  'bleiben':     ['blieb', 'geblieben', 's'],
  'passieren':   ['passierte', 'passiert', 's'],
  'geschehen':   ['geschah', 'geschehen', 's'],
  'entstehen':   ['entstand', 'entstanden', 's'],
  'sterben':     ['starb', 'gestorben', 's'],
  'fliehen':     ['floh', 'geflohen', 's'],
  'landen':      ['landete', 'gelandet', 's'],
  // haben verbs – irregular
  'sehen':       ['sah', 'gesehen', 'h'],
  'geben':       ['gab', 'gegeben', 'h'],
  'nehmen':      ['nahm', 'genommen', 'h'],
  'essen':       ['aß', 'gegessen', 'h'],
  'trinken':     ['trank', 'getrunken', 'h'],
  'schreiben':   ['schrieb', 'geschrieben', 'h'],
  'lesen':       ['las', 'gelesen', 'h'],
  'sprechen':    ['sprach', 'gesprochen', 'h'],
  'helfen':      ['half', 'geholfen', 'h'],
  'treffen':     ['traf', 'getroffen', 'h'],
  'finden':      ['fand', 'gefunden', 'h'],
  'stehen':      ['stand', 'gestanden', 'h'],
  'liegen':      ['lag', 'gelegen', 'h'],
  'schlafen':    ['schlief', 'geschlafen', 'h'],
  'tragen':      ['trug', 'getragen', 'h'],
  'waschen':     ['wusch', 'gewaschen', 'h'],
  'wissen':      ['wusste', 'gewusst', 'h'],
  'denken':      ['dachte', 'gedacht', 'h'],
  'bringen':     ['brachte', 'gebracht', 'h'],
  'kennen':      ['kannte', 'gekannt', 'h'],
  'nennen':      ['nannte', 'genannt', 'h'],
  'senden':      ['sandte', 'gesandt', 'h'],
  'brennen':     ['brannte', 'gebrannt', 'h'],
  'wenden':      ['wandte', 'gewandt', 'h'],
  'stellen':     ['stellte', 'gestellt', 'h'],
  'rufen':       ['rief', 'gerufen', 'h'],
  'schießen':    ['schoss', 'geschossen', 'h'],
  'schließen':   ['schloss', 'geschlossen', 'h'],
  'brechen':     ['brach', 'gebrochen', 'h'],
  'verbrennen':  ['verbrannte', 'verbrannt', 'h'],
  'schreien':    ['schrie', 'geschrien', 'h'],
  'schweigen':   ['schwieg', 'geschwiegen', 'h'],
  'bitten':      ['bat', 'gebeten', 'h'],
  'bieten':      ['bot', 'geboten', 'h'],
  'ziehen':      ['zog', 'gezogen', 'h'],
  'wiegen':      ['wog', 'gewogen', 'h'],
  'lügen':       ['log', 'gelogen', 'h'],
  'fliegen':     ['flog', 'geflogen', 'h/s'],
  'siegen':      ['siegte', 'gesiegt', 'h'],
  'gewinnen':    ['gewann', 'gewonnen', 'h'],
  'verlieren':   ['verlor', 'verloren', 'h'],
  'vergessen':   ['vergaß', 'vergessen', 'h'],
  'empfehlen':   ['empfahl', 'empfohlen', 'h'],
  'beginnen':    ['begann', 'begonnen', 'h'],
  'gelingen':    ['gelang', 'gelungen', 'h/s'],
  'hängen':      ['hing', 'gehangen', 'h'],
  'lassen':      ['ließ', 'gelassen', 'h'],
  'halten':      ['hielt', 'gehalten', 'h'],
  'heißen':      ['hieß', 'geheißen', 'h'],
  'leiden':      ['litt', 'gelitten', 'h'],
  'schneiden':   ['schnitt', 'geschnitten', 'h'],
  'reiten':      ['ritt', 'geritten', 'h/s'],
  'streiten':    ['stritt', 'gestritten', 'h'],
  'betreten':    ['betrat', 'betreten', 'h'],
  'einladen':    ['lud ein', 'eingeladen', 'h'],
  'aufnehmen':   ['nahm auf', 'aufgenommen', 'h'],
  'anfangen':    ['fing an', 'angefangen', 'h'],
  'aufmachen':   ['machte auf', 'aufgemacht', 'h'],
  'anmachen':    ['machte an', 'angemacht', 'h'],
  'abmachen':    ['machte ab', 'abgemacht', 'h'],
  'aufschreiben':['schrieb auf', 'aufgeschrieben', 'h'],
  'vorstellen':  ['stellte vor', 'vorgestellt', 'h'],
  'einstellen':  ['stellte ein', 'eingestellt', 'h'],
  'feststellen': ['stellte fest', 'festgestellt', 'h'],
  'bestellen':   ['bestellte', 'bestellt', 'h'],
  'verbringen':  ['verbrachte', 'verbracht', 'h'],
  'versprechen': ['versprach', 'versprochen', 'h'],
  'beschreiben': ['beschrieb', 'beschrieben', 'h'],
  'verstehen':   ['verstand', 'verstanden', 'h'],
  'entstehen':   ['entstand', 'entstanden', 's'],
  'besprechen':  ['besprach', 'besprochen', 'h'],
  'ansehen':     ['sah an', 'angesehen', 'h'],
  'aussehen':    ['sah aus', 'ausgesehen', 'h'],
  'fernsehen':   ['sah fern', 'ferngesehen', 'h'],
  'einschreiben':['schrieb ein', 'eingeschrieben', 'h'],
  'unterschreiben':['unterschrieb','unterschrieben','h'],
  'vorschreiben':['schrieb vor', 'vorgeschrieben', 'h'],
  'aufhalten':   ['hielt auf', 'aufgehalten', 'h'],
  'anhalten':    ['hielt an', 'angehalten', 'h'],
  'erhalten':    ['erhielt', 'erhalten', 'h'],
  'behalten':    ['behielt', 'behalten', 'h'],
  'enthalten':   ['enthielt', 'enthalten', 'h'],
  'erzählen':    ['erzählte', 'erzählt', 'h'],
  'empfangen':   ['empfing', 'empfangen', 'h'],
  'erkennen':    ['erkannte', 'erkannt', 'h'],
  'nennen':      ['nannte', 'genannt', 'h'],
  'anerkennen':  ['erkannte an', 'anerkannt', 'h'],
  'auffordern':  ['forderte auf', 'aufgefordert', 'h'],
  'schwingen':   ['schwang', 'geschwungen', 'h'],
  'zusammenstoßen': ['stieß zusammen', 'zusammengestoßen', 's'],
  'stoßen':      ['stieß', 'gestoßen', 'h/s'],
  'aufteilen':   ['teilte auf', 'aufgeteilt', 'h'],
  'mitteilen':   ['teilte mit', 'mitgeteilt', 'h'],
  'zunehmen':    ['nahm zu', 'zugenommen', 'h'],
  'abnehmen':    ['nahm ab', 'abgenommen', 'h'],
  'übernehmen':  ['übernahm', 'übernommen', 'h'],
  'unternehmen': ['unternahm', 'unternommen', 'h'],
  'aufnehmen':   ['nahm auf', 'aufgenommen', 'h'],
};

// Separable prefixes (longest first to avoid greedy mismatch)
const SEP_PREFIXES = [
  'zusammen','zurück','weiter','wieder','voraus','voran','vor','weg',
  'unter','um','über','statt','rück','raus','rauf','ran','mit','los',
  'hin','hervor','herüber','heraus','herunter','herein','herab','her',
  'hinzu','hinunter','hinein','hinaus','hinauf','hin','gegenüber',
  'fort','fest','fern','ein','durch','dar','da','bei','auf','aus','an','ab',
];
// Inseparable prefixes (verb starts with these, NOT separated in use)
const INSEP_PREFIXES = ['be','emp','ent','er','ge','miss','ver','zer'];

function normalize(infinitive) {
  let v = infinitive.trim().toLowerCase();
  if (v.startsWith('sich ')) v = v.slice(5);
  return v;
}

function stripSeparablePrefix(inf) {
  for (const pre of SEP_PREFIXES) {
    if (inf.startsWith(pre) && inf.length > pre.length + 2) {
      const base = inf.slice(pre.length);
      if (IRREGULAR[base]) return { prefix: pre, base };
    }
  }
  return null;
}

// Build regular weak verb forms
function regularForms(inf) {
  let stem = inf;
  if (stem.endsWith('eln')) stem = stem.slice(0, -3) + 'el';
  else if (stem.endsWith('ern')) stem = stem.slice(0, -3) + 'er';
  else if (stem.endsWith('en')) stem = stem.slice(0, -2);
  else if (stem.endsWith('n')) stem = stem.slice(0, -1);

  // Präteritum: stem + te (+ e if stem ends in t/d/m/n after consonant)
  const needsE = /[td]$/.test(stem) || (/[mn]$/.test(stem) && !/[aeiouäöü]/.test(stem.slice(-2, -1)));
  const prat = stem + (needsE ? 'ete' : 'te');

  // Partizip II: ge + stem + t (no ge- for inseparable prefixes be/er/ge/ver/zer/ent/emp/miss)
  const insep = /^(be|er|ge|ver|zer|ent|emp|miss)/.test(stem);
  const pp = insep ? stem + (needsE ? 'et' : 't') : 'ge' + stem + (needsE ? 'et' : 't');

  // Most regular verbs take haben; motion verbs with sein are in IRREGULAR
  return [prat, pp, 'h'];
}

export function getVerbForms(word) {
  if (!word.pos?.toLowerCase().startsWith('verb')) return null;

  const inf = normalize(word.german);

  // 1. Direct lookup
  if (IRREGULAR[inf]) return IRREGULAR[inf];

  // 2. Inseparable prefix: strip and check base
  for (const pre of INSEP_PREFIXES) {
    if (inf.startsWith(pre)) {
      const base = inf.slice(pre.length);
      if (IRREGULAR[base]) {
        const [prat, pp, aux] = IRREGULAR[base];
        // Inseparable: no ge- in pp, forms keep prefix
        return [pre + prat, pre + pp, aux];
      }
    }
  }

  // 3. Separable prefix: strip and check base
  const sep = stripSeparablePrefix(inf);
  if (sep) {
    const [prat, pp, aux] = IRREGULAR[sep.base];
    // Separable Präteritum: "fuhr ab" style already in dict for some;
    // for derived ones, build "base-prat + pre" e.g. "kam an"
    const pratSep = prat.includes(' ') ? prat : `${prat} ${sep.prefix}`;
    // Partizip II: sep prefix + ge + base-stem + en/t
    const ppSep = pp.startsWith('ge') ? `${sep.prefix}${pp}` : `${sep.prefix}ge${pp}`;
    return [pratSep, ppSep, aux];
  }

  // 4. Regular weak verb
  const [prat, pp, aux] = regularForms(inf);
  return [prat, pp, aux];
}
