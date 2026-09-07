// Runner dei test — nessun framework.  node tests/run.mjs  (oppure: npm test)
//
// Perche' esiste: il valore di questo strumento e' un database curato a mano di 19
// tumori, 12 farmaci e un centinaio di indicazioni. Una riga incoerente — un metodo
// che l'interfaccia non sa disegnare, una soglia senza cutoff, un'indicazione con
// score ma clone "Non richiesto" — non produce un errore: produce un campo che non
// compare, o un referto senza il numero. Questi test guardano il database riga per riga.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const E = require('../engine.js');
const { clinicalDatabase, cloneInterchangeability, labConfig, METHOD_LABELS,
        SCORE_METHODS, maxForMethod, isValidScoreValue,
        getCloneName, getCloneAvailability, getOptionalScoreMethod, checkInterchangeability,
        LAST_VERIFIED_ISO, LAST_VERIFIED_IT } = E;

let pass = 0, fail = 0; const failures = [];
const check = (n, c, d = '') => c ? pass++ : (fail++, failures.push(n + (d ? ` — ${d}` : '')));
const eq = (n, a, b) => check(n, a === b, `atteso ${JSON.stringify(b)}, ottenuto ${JSON.stringify(a)}`);
const section = t => console.log(`\n• ${t}`);

// tutte le indicazioni, appiattite
const TUTTE = [];
for (const [tk, tumor] of Object.entries(clinicalDatabase))
  for (const [dk, drug] of Object.entries(tumor.drugs))
    for (const [ik, ind] of Object.entries(drug.indications))
      TUTTE.push({ tk, dk, ik, tumor, drug, ind,
                   via: `${tk} › ${dk} › ${ik}`,
                   clone: ind.indicationClone || drug.clone });

// ══════════════════════════════════════════════════════════════════════════
section('struttura del database');
{
  console.log(`  (${Object.keys(clinicalDatabase).length} tumori, ` +
    `${new Set(TUTTE.map(x => x.dk)).size} farmaci, ${TUTTE.length} indicazioni)`);
  check('almeno 19 tumori', Object.keys(clinicalDatabase).length >= 19);
  check("almeno 85 indicazioni", TUTTE.length >= 85, String(TUTTE.length));
  TUTTE.forEach(x => {
    check(`${x.via}: ha un nome`, typeof x.ind.name === 'string' && x.ind.name.length > 3);
    check(`${x.via}: ha le note`, typeof x.ind.notes === 'string' && x.ind.notes.length > 10);
    check(`${x.via}: dichiara lo studio registrativo`, typeof x.ind.trial === 'string' && x.ind.trial.length > 2);
  });
  Object.entries(clinicalDatabase).forEach(([k, t]) => {
    check(`${k}: ha un nome esteso`, typeof t.name === 'string' && t.name.length > 3);
    check(`${k}: ha almeno un farmaco`, Object.keys(t.drugs).length > 0);
  });
}

section('metodi di score: solo quelli che l interfaccia sa disegnare');
{
  const usati = [...new Set(TUTTE.map(x => x.ind.method))];
  usati.forEach(m => check(`il metodo "${m}" è fra quelli previsti`, SCORE_METHODS.includes(m)));
  usati.forEach(m => check(`il metodo "${m}" ha un'etichetta per il referto`, !!METHOD_LABELS[m]));

  // L'invariante che conta: la pagina deve avere un ramo per ogni metodo.
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const disegnati = [...html.matchAll(/indication\.method === '([^']+)'/g)].map(m => m[1]);
  const perTcic = /indication\.tcic/.test(html);
  usati.filter(m => m !== 'TC/IC' && m !== 'Non richiesto').forEach(m =>
    check(`createScoreInputs disegna un campo per "${m}"`, disegnati.includes(m),
      `rami presenti: ${[...new Set(disegnati)].join(', ')}`));
  check('il metodo TC/IC è gestito dal ramo indication.tcic', perTcic);
  check('nessun metodo dichiarato ma mai usato',
    SCORE_METHODS.every(m => usati.includes(m)),
    SCORE_METHODS.filter(m => !usati.includes(m)).join(','));
}

section('ogni metodo porta con sé i propri cutoff');
{
  TUTTE.forEach(({ via, ind }) => {
    if (ind.method === 'Non richiesto') {
      eq(`${via}: agnostica → cutoff 0`, ind.cutoff, 0);
    } else if (ind.method === 'TC/IC' || ind.tcic) {
      check(`${via}: TC/IC → tcic true`, ind.tcic === true);
      check(`${via}: TC/IC → cutoffTC numerico`, typeof ind.cutoffTC === 'number');
      check(`${via}: TC/IC → cutoffIC numerico`, typeof ind.cutoffIC === 'number');
    } else if (ind.method === 'IC') {
      check(`${via}: IC → cutoffIC numerico`, typeof ind.cutoffIC === 'number');
    } else {
      check(`${via}: ${ind.method} → cutoff numerico > 0`,
        typeof ind.cutoff === 'number' && ind.cutoff > 0, String(ind.cutoff));
      check(`${via}: cutoff dentro il massimo del metodo`,
        ind.cutoff <= maxForMethod(ind.method));
    }
  });
}

section('cloni');
{
  TUTTE.forEach(({ via, ind, clone }) => {
    check(`${via}: il clone è dichiarato`, typeof clone === 'string' && clone.length > 0);
    const avail = getCloneAvailability(clone);
    check(`${via}: la disponibilità del clone è classificata`,
      ['none','inhouse','service','validated_generic'].includes(avail), `${clone} → ${avail}`);
    if (avail === 'unknown') check(`${via}: clone non riconosciuto`, false, clone);
  });

  // La trappola: se il clone è "Non richiesto" la pagina mostra "PD-L1 NON RICHIESTO"
  // e non disegna il campo, qualunque cosa dica il metodo.
  TUTTE.filter(x => x.ind.method !== 'Non richiesto').forEach(({ via, clone, ind }) =>
    check(`${via}: indicazione con score (${ind.method}) → il clone non può essere "Non richiesto"`,
      clone !== 'Non richiesto'));

  // ...e il verso opposto: un clone dichiarato su un'indicazione agnostica va bene
  // (serve per il PD-L1 documentale), ma allora dev'esserci un metodo opzionale o una nota.
  eq('getCloneName riconosce i cloni noti',
    ['22C3','28-8','73-10','SP142','SP263'].map(c => getCloneName(`${c} (X)`)).join(','),
    '22C3,28-8,73-10,SP142,SP263');
  eq('getCloneName su clone ignoto', getCloneName('QR1 (Diagnostic BioSystems)'), null);
  eq('SP263 è in-house', getCloneAvailability('SP263 (Ventana)'), 'inhouse');
  eq('22C3 è service', getCloneAvailability('22C3 (Dako)'), 'service');
  eq('"Non richiesto" non è un clone', getCloneAvailability('Non richiesto'), 'none');
}

section('intercambiabilità dei cloni');
{
  Object.entries(cloneInterchangeability).forEach(([clone, info]) => {
    check(`${clone}: l'alternativa è in-house`, labConfig.inHouseClones.includes(info.alternative));
    info.tumors.forEach(t =>
      check(`${clone}: il tumore "${t}" esiste nel database`, !!clinicalDatabase[t]));
  });
  // il TAP non è intercambiabile: è una misura diversa, non un altro clone
  const tap = TUTTE.filter(x => x.ind.method === 'TAP');
  check('esistono indicazioni con metodo TAP', tap.length >= 2, String(tap.length));
  tap.forEach(({ via, clone, tk }) =>
    check(`${via}: il TAP non passa dal meccanismo di clone alternativo`,
      checkInterchangeability(clone, tk) === null));
}

section('score opzionale');
{
  TUTTE.forEach(({ via, ind }) => {
    const opt = getOptionalScoreMethod(ind);
    if (opt !== null)
      check(`${via}: optionalScoreMethod "${opt}" è un metodo valido`,
        SCORE_METHODS.includes(opt) && opt !== 'Non richiesto', String(opt));
    if (opt !== null && ind.method !== 'Non richiesto')
      check(`${via}: uno score opzionale ha senso solo su indicazione agnostica`, false,
        `metodo ${ind.method} + opzionale ${opt}`);
  });
  eq('senza la chiave, nessuno score opzionale', getOptionalScoreMethod({}), null);
  eq('null esplicito resta null', getOptionalScoreMethod({ optionalScoreMethod: null }), null);
}

section('contesto clinico');
{
  const ids = [];
  TUTTE.forEach(({ via, ind }) => {
    (ind.clinicalContext || []).forEach(c => {
      check(`${via}: la voce di contesto ha id ed etichetta`,
        typeof c.id === 'string' && c.id.length > 2 && typeof c.label === 'string' && c.label.length > 5);
      ids.push({ id: c.id, via });
    });
  });
  const dup = ids.map(x => x.id).filter((v, i, a) => a.indexOf(v) !== i);
  eq('gli id di contesto sono unici (diventano id del DOM)', [...new Set(dup)].join(','), '');
  check('almeno venti voci di contesto clinico', ids.length >= 20, String(ids.length));
}

section('validazione dei valori di score');
{
  eq('il CPS può superare 100', maxForMethod('CPS'), 400);
  eq('il TPS no', maxForMethod('TPS'), 100);
  eq('il TAP no', maxForMethod('TAP'), 100);
  // Il difetto della 3.5.0: la formula diceva che il CPS può superare 100 e la
  // validazione lo rifiutava.
  check('CPS 120 è accettato', isValidScoreValue(120, maxForMethod('CPS')));
  check('TPS 120 è rifiutato', !isValidScoreValue(120, maxForMethod('TPS')));
  check('TAP 120 è rifiutato', !isValidScoreValue(120, maxForMethod('TAP')));
  check('i decimali sono rifiutati', !isValidScoreValue(34.7, 100));
  check('i negativi sono rifiutati', !isValidScoreValue(-1, 100));
  check('il campo vuoto è ammesso', isValidScoreValue('', 100));
  check('0 è ammesso', isValidScoreValue(0, 100));
  check('100 è ammesso', isValidScoreValue(100, 100));
}

section('le voci che la v3.6.0 ha cambiato');
{
  const trova = (t, d, i) => clinicalDatabase[t]?.drugs?.[d]?.indications?.[i];
  // aggiunte
  eq('NSCLC pembrolizumab monoterapia 2L: TPS >=1',
    `${trova('nsclc','pembrolizumab','second-mono')?.method} ${trova('nsclc','pembrolizumab','second-mono')?.cutoff}`, 'TPS 1');
  eq('NSCLC nivolumab perioperatorio: TPS >=1',
    `${trova('nsclc','nivolumab','perioperative')?.method} ${trova('nsclc','nivolumab','perioperative')?.cutoff}`, 'TPS 1');
  eq('NSCLC sugemalimab stadio III: TPS >=1',
    `${trova('nsclc','sugemalimab','stage3-consolidation')?.method} ${trova('nsclc','sugemalimab','stage3-consolidation')?.cutoff}`, 'TPS 1');
  eq('NSCLC tislelizumab non squamoso: TPS >=50',
    `${trova('nsclc','tislelizumab','first-combo-nonsq')?.method} ${trova('nsclc','tislelizumab','first-combo-nonsq')?.cutoff}`, 'TPS 50');
  eq('gastrico tislelizumab: TAP >=5',
    `${trova('gastric','tislelizumab','first-combo')?.method} ${trova('gastric','tislelizumab','first-combo')?.cutoff}`, 'TAP 5');
  eq('esofago squamoso tislelizumab: TAP >=5',
    `${trova('escc','tislelizumab','first-combo')?.method} ${trova('escc','tislelizumab','first-combo')?.cutoff}`, 'TAP 5');
  check('rinofaringe presente', !!clinicalDatabase.npc);

  // rimozioni: non sono indicazioni EMA
  check('esofago: nessuna seconda linea di pembrolizumab', !trova('escc','pembrolizumab','second'));
  check('cervice: nessuna seconda linea di pembrolizumab', !trova('cervical','pembrolizumab','second'));
  // ...ma la seconda linea della cervice esiste, con un altro farmaco e senza PD-L1
  eq('cervice: la seconda linea è cemiplimab, agnostica',
    trova('cervical','cemiplimab','second-mono')?.method, 'Non richiesto');

  // tre metodi diversi nello stesso istotipo: e' il punto che il tool deve rendere evidente
  const escc = clinicalDatabase.escc.drugs;
  eq('esofago squamoso: pembrolizumab CPS', escc.pembrolizumab.indications['first-combo'].method, 'CPS');
  eq('esofago squamoso: nivolumab TPS',      escc.nivolumab.indications['first-combo'].method, 'TPS');
  eq('esofago squamoso: tislelizumab TAP',   escc.tislelizumab.indications['first-combo'].method, 'TAP');
}

section('governance: una sola data di verifica');
{
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const eng  = fs.readFileSync(new URL('../engine.js',  import.meta.url), 'utf8');
  const pkg  = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const senzaCommenti = t => t.replace(/^\s*\/\/.*$/gm, '');

  check('index.html carica engine.js', /<script src="engine\.js/.test(html));
  eq('versione allineata a package.json', html.includes(`engine.js?v=${pkg.version}`), true);
  check('versione mostrata in pagina', html.includes(`v${pkg.version}`), pkg.version);
  check('il motore non tocca il DOM',
    !/document\.|getElementById|querySelector|window\./.test(senzaCommenti(eng)));
  check('il database non è duplicato nella pagina', !html.includes('const clinicalDatabase'));
  check('gli helper non sono duplicati nella pagina', !html.includes('function getCloneName'));

  // La data di verifica veniva riscritta a mano in cinque punti (banner, referto,
  // titolo del database, log). Il log versioni e' una cronologia e le date passate
  // ci stanno; ovunque altro deve venire dalla costante.
  const log = (html.match(/&#x1F4CC;[\s\S]*?non sono state ricontrollate da allora/) || [''])[0];
  const fuoriDalLog = senzaCommenti(html).replace(log, '');
  const dateSparse = [...fuoriDalLog.matchAll(/\d{2}\/\d{2}\/20\d{2}/g)].map(m => m[0]);
  eq('nessuna data scritta a mano fuori dal log versioni',
    [...new Set(dateSparse)].join(','), '');
  eq('la data corrente compare una sola volta, nel log',
    (html.match(new RegExp(LAST_VERIFIED_IT, 'g')) || []).length, 1);
  check('la data vive nel motore', /LAST_VERIFIED_IT/.test(eng));
  eq('le due forme della data coincidono',
    LAST_VERIFIED_ISO.split('-').reverse().join('/'), LAST_VERIFIED_IT);
  check('la pagina usa la costante', html.includes('LAST_VERIFIED_IT'));
}

console.log(`\n${fail === 0 ? 'OK' : 'FALLITO'} — ${pass} pass, ${fail} fail`);
if (failures.length) { console.log('\nFallimenti:'); failures.slice(0, 25).forEach(f => console.log('  ✗ ' + f)); }
if (failures.length > 25) console.log(`  … e altri ${failures.length - 25}`);
process.exit(fail === 0 ? 0 : 1);
