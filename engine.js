// -----------------------------------------------------------------------------
//  MOTORE — PD-L1 AP Tool. Database clinico e logica pura: niente DOM.
//  Estratto da index.html nella v3.6.0.
//
//  Perche' esiste: il valore di questo strumento sta tutto in un database curato a
//  mano di 19 tumori. Finche' viveva dentro la pagina, la sua coerenza interna
//  (un metodo di score che l'interfaccia non sa disegnare, un'indicazione con
//  soglia ma clone "Non richiesto", un cutoff mancante) non era verificabile se non
//  cliccando ogni singola combinazione. Ora `npm test` la verifica tutta.
// -----------------------------------------------------------------------------
'use strict';

// Data dell'ultima verifica puntuale del database sulle fonti regolatorie.
// UNICA fonte di verita': la pagina, il referto e il banner di obsolescenza la
// leggono da qui. Prima era ripetuta come stringa in cinque punti diversi.
const LAST_VERIFIED_ISO = '2026-09-07';
const LAST_VERIFIED_IT  = '07/09/2026';

// I metodi di score che l'interfaccia sa disegnare e che il referto sa stampare.
// Un metodo presente nel database e assente da qui e' un campo che non comparira'
// mai a schermo: un test lo intercetta.
const SCORE_METHODS = ['TPS', 'CPS', 'TAP', 'IC', 'TC/IC', 'Non richiesto'];

// Il CPS e' un rapporto fra conteggi moltiplicato per 100 e puo' superare 100.
// Tutti gli altri sono percentuali.
function maxForMethod(method) { return method === 'CPS' ? 400 : 100; }

// Predicato puro dietro la validazione dei campi: interi, dentro il massimo del metodo.
function isValidScoreValue(value, max) {
  if (value === '' || value === null || value === undefined) return true;
  const v = Number(value);
  return Number.isInteger(v) && v >= 0 && v <= (max || 100);
}

const labConfig = {
    inHouseClones: ['SP142', 'SP263'],
    serviceClones: ['22C3', '28-8', '73-10'],
    labName: 'ASST Fatebenefratelli-Sacco'
};

// Etichette dei metodi di score. Il TAP (tumour area positivity) e' entrato nella
// v3.6.0 con tislelizumab: e' una stima di AREA, non un conteggio di cellule.
const METHOD_LABELS = {
    'TPS':   'TPS (Tumor Proportion Score)',
    'CPS':   'CPS (Combined Positive Score)',
    'TAP':   'TAP (Tumour Area Positivity)',
    'IC':    'IC (Immune Cell score)',
    'TC/IC': 'TC/IC (Tumor Cell / Immune Cell)',
    'Non richiesto': 'Non richiesto'
};

const cloneInterchangeability = {
    '22C3': { alternative: 'SP263', concordance: '>90%', tumors: ['nsclc','hnscc','uc','gastric','tnbc','cervical','escc'], note: 'SP263 nativo TPS; se preferisci IC usa SP142' },
    '28-8': { alternative: 'SP263', concordance: '>90%', tumors: ['nsclc','hnscc','uc','melanoma'] }
};

// ============================
// DATABASE v3.5.0 — verifica puntuale più recente 27/08/2026 (vedi log versioni nel disclaimer)
// TNBC pembrolizumab: chiarito SP263 (TPS) vs SP142 (IC) come alternative a 22C3
// Fonte: EPAR EMA (preferenziale), FDA, NCCN/ESMO (supportivi)
// ============================
const clinicalDatabase = {
    nsclc: {
        name: 'NSCLC (Non-Small Cell Lung Cancer)',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: '22C3 (Dako)',
                indications: {
                    'first-mono': {
                        name: 'Prima linea monoterapia', method: 'TPS', cutoff: 50,
                        notes: 'TPS >=50%, popolazione senza alterazioni EGFR/ALK/ROS1 (KEYNOTE-024)',
                        trial: 'KEYNOTE-024',
                        clinicalContext: [
                            { id: 'nsclc_drivers', label: 'Negativita\' EGFR, ALK e ROS1 confermata (IHC/FISH/NGS)', required: true },
                            { id: 'nsclc_hist_mono', label: 'Istotipo non squamoso o squamoso (entrambi ammissibili)', required: false }
                        ]
                    },
                    'first-combo-chemo': {
                        name: 'Prima linea + chemio (non squamoso)', method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Pembrolizumab + pemetrexed + platino per NSCLC non squamoso avanzato. PD-L1 non è criterio di eleggibilità per questa combinazione (EPAR EMA Keytruda). Valutazione clinica su base di performance status, funzione renale, istologia.',
                        trial: 'KEYNOTE-189',
                        guidelineNote: 'PD-L1 può essere richiesto solo a fini prognostici/documentali, non per eleggibilità terapeutica. Se riportato, usare TPS.'
                    },
                    'first-combo-chemo-sq': {
                        name: 'Prima linea + chemio (squamoso)', method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Pembrolizumab + gemcitabina/cisplatino o pembrolizumab + paclitaxel/carboplatin per NSCLC squamoso avanzato. PD-L1 non è criterio di eleggibilità (EPAR EMA Keytruda KEYNOTE-407).',
                        trial: 'KEYNOTE-407'
                    },
                    'perioperative': {
                        name: 'Perioperatorio (neoadiuvante + adiuvante)',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Pembrolizumab + chemioterapia a base di platino come neoadiuvante (4 cicli), poi pembrolizumab monoterapia come adiuvante, NSCLC resecabile ad alto rischio di recidiva. PD-L1 non è criterio di eleggibilità secondo EPAR EMA Keytruda (KEYNOTE-671).',
                        trial: 'KEYNOTE-671',
                        guidelineNote: 'PD-L1 può essere richiesto a fini descrittivi/prognostici (il beneficio è comunque osservato indipendentemente dall\'espressione). Se eseguito, usare TPS.'
                    },
                    'second-mono': {
                        name: 'Monoterapia dopo chemioterapia (>=1 linea precedente)',
                        method: 'TPS', cutoff: 1,
                        notes: 'Pembrolizumab monoterapia nel NSCLC localmente avanzato o metastatico con TPS >=1% in pazienti che hanno ricevuto almeno una precedente chemioterapia (EPAR EMA Keytruda KEYNOTE-010). Nei pazienti con EGFR mutato o ALK positivo deve essere stata somministrata anche la terapia a bersaglio.',
                        trial: 'KEYNOTE-010',
                        guidelineNote: 'Unica indicazione NSCLC di pembrolizumab con soglia TPS >=1%: attenzione a non applicare qui il cutoff 50% della prima linea.',
                        clinicalContext: [
                            { id: 'nsclc_prior_chemo_pembro', label: 'Almeno una precedente linea di chemioterapia documentata (e terapia a bersaglio, se EGFR/ALK positivo)', required: true }
                        ]
                    }
                }
            },
            nivolumab: {
                name: 'Nivolumab', clone: '28-8 (Dako)',
                indications: {
                    'second': { name: 'Seconda linea', method: 'Non richiesto', cutoff: 0, notes: 'Post-platino; PD-L1 agnostico', trial: 'CheckMate-057' },
                    'first-combo-ipi': {
                        name: 'Prima linea + ipilimumab + chemio', method: 'Non richiesto', cutoff: 0,
                        notes: 'Nivolumab + ipilimumab + 2 cicli di chemioterapia in prima linea NSCLC metastatico senza mutazioni EGFR/ALK. PD-L1 non è criterio di eleggibilità secondo EPAR EMA Opdivo. (CheckMate-227 attuali dati + approvazione EMA)',
                        trial: 'CheckMate-227',
                        guidelineNote: 'Nota: la combinazione "nivo + ipi senza chemio" con TPS ≥1% rimane rilevante in ambito trial/guideline, ma la label EMA attuale richiede chemioterapia e non menziona PD-L1 come criterio di eleggibilità.'
                    },
                    'neoadjuvant': {
                        name: 'Neoadiuvante + chemio (pre-chirurgia)',
                        method: 'TPS', cutoff: 1,
                        notes: 'Nivolumab + chemioterapia a base di platino come neoadiuvante (3 cicli), NSCLC resecabile ad alto rischio di recidiva, PD-L1 TC >=1%, secondo EPAR EMA Opdivo (CheckMate-816).',
                        trial: 'CheckMate-816',
                        clinicalContext: [
                            { id: 'nsclc_egfr_alk_nivo_neoadj', label: 'Assenza di mutazioni EGFR o riarrangiamenti ALK documentata (popolazione esclusa dallo studio registrativo)', required: true }
                        ]
                    },
                    'perioperative': {
                        name: 'Perioperatorio (neoadiuvante + adiuvante)',
                        method: 'TPS', cutoff: 1,
                        notes: 'Nivolumab + chemioterapia a base di platino come neoadiuvante, seguito da nivolumab in monoterapia come adiuvante dopo resezione, NSCLC resecabile ad alto rischio di recidiva, PD-L1 su cellule tumorali >=1% (EPAR EMA Opdivo, CheckMate-77T).',
                        trial: 'CheckMate-77T',
                        guidelineNote: 'Indicazione distinta dal neoadiuvante puro (CheckMate-816): stessa soglia >=1% ma percorso terapeutico diverso. Verificare con l\'oncologo quale dei due schemi e\' previsto.',
                        clinicalContext: [
                            { id: 'nsclc_egfr_alk_nivo_periop', label: 'Assenza di mutazioni EGFR o riarrangiamenti ALK documentata', required: true }
                        ]
                    }
                }
            },
            atezolizumab: {
                name: 'Atezolizumab', clone: 'SP142 (Ventana)',
                indications: {
                    'first-combo': { 
                        name: 'Prima linea + chemio + bevacizumab', 
                        method: 'Non richiesto', cutoff: 0, 
                        optionalScoreMethod: null,
                        notes: 'Istotipo non squamoso; PD-L1 non richiesto per la combinazione (IMpower150)', 
                        trial: 'IMpower150',
                        guidelineNote: 'Se PD-L1 viene richiesto a fini descrittivi, specificare metodo e clone validato: SP142 (TC/IC), 22C3 (TPS), 28-8 (TPS) con razionale locale.'
                    },
                    'first-mono-high': { 
                        name: 'Prima linea monoterapia (alta espressione PD-L1)', 
                        method: 'TC/IC', 
                        cutoffTC: 50, 
                        cutoffIC: 10, 
                        notes: 'Atezolizumab monoterapia in NSCLC metastatico con PD-L1 TC >=50% oppure IC >=10%, senza mutazioni EGFR/ALK (IMpower110)', 
                        trial: 'IMpower110',
                        tcic: true,
                        clinicalContext: [
                            { id: 'nsclc_egfr_alk_atezo', label: 'Assenza di mutazioni EGFR o riarrangiamenti ALK documentata', required: true }
                        ]
                    },
                    'first-mono-platinum-ineligible': {
                        name: 'Prima linea monoterapia (non eleggibili al platino)',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Atezolizumab monoterapia in prima linea nel NSCLC localmente avanzato/metastatico in pazienti non eleggibili a chemioterapia contenente platino. PD-L1 non è criterio di eleggibilità (EPAR EMA Tecentriq, IPSOS).',
                        trial: 'IPSOS',
                        guidelineNote: 'Da non confondere con la monoterapia di prima linea ad alta espressione (IMpower110), che invece richiede TC >=50% o IC >=10%.'
                    },
                    'second-postchemo': {
                        name: 'Seconda linea/post-chemioterapia',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Atezolizumab dopo precedente chemioterapia; PD-L1 non è criterio di eleggibilità secondo EPAR EMA Tecentriq (OAK)',
                        trial: 'OAK',
                        guidelineNote: 'PD-L1 può essere valutato a fini descrittivi/prognostici, ma non come requisito di eleggibilità.'
                    },
                    'adjuvant': {
                        name: 'Adiuvante post-resezione + chemio (stadio II-IIIA)',
                        method: 'TPS', cutoff: 50,
                        indicationClone: 'SP263 (Ventana)',
                        notes: 'Atezolizumab monoterapia come adiuvante dopo resezione completa e chemioterapia a base di platino, NSCLC stadio II-IIIA ad alto rischio di recidiva, PD-L1 TC >=50%, EGFR e ALK wild-type, secondo EPAR EMA Tecentriq (IMpower010).',
                        trial: 'IMpower010',
                        guidelineNote: 'ATTENZIONE clone: assay validato per questa indicazione è VENTANA PD-L1 (SP263), diverso da SP142 usato nelle altre indicazioni NSCLC di atezolizumab. Nota anche la divergenza regolatoria: cutoff EMA TC>=50%, mentre il cutoff FDA per la stessa indicazione è TC>=1% sull\'intera popolazione stadio II-IIIA - non intercambiabili, verificare quale autorità è di riferimento.',
                        clinicalContext: [
                            { id: 'nsclc_egfr_alk_atezo_adj', label: 'Assenza di mutazioni EGFR o riarrangiamenti ALK documentata', required: true },
                            { id: 'nsclc_resection_atezo_adj', label: 'Resezione completa (R0) e chemioterapia adiuvante a base di platino completate', required: true }
                        ]
                    }
                }
            },
            durvalumab: {
                name: 'Durvalumab', clone: 'SP263 (Ventana)',
                indications: {
                    'consolidation': {
                        name: 'Consolidamento post-chemioradioterapia (stadio III non resecabile)', method: 'TPS', cutoff: 1,
                        notes: 'Durvalumab monoterapia nel NSCLC stadio III non resecabile la cui malattia non è progredita dopo chemioradioterapia a base di platino, con PD-L1 su >=1% delle cellule tumorali (EPAR EMA Imfinzi, PACIFIC).',
                        trial: 'PACIFIC',
                        guidelineNote: 'Divergenza regolatoria nota: la soglia TC >=1% è EMA; la label FDA non pone requisito di PD-L1. ESMO suggerisce di considerare durvalumab indipendentemente da PD-L1 (beneficio osservato anche in TPS<1% nelle analisi post-hoc). Stessa soglia e stessa nicchia di sugemalimab (GEMSTONE-301).'
                    },
                    'perioperative': {
                        name: 'Perioperatorio (neoadiuvante + adiuvante)',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Durvalumab + chemioterapia a base di platino come neoadiuvante, poi durvalumab in monoterapia come adiuvante dopo resezione, NSCLC resecabile. PD-L1 non è criterio di eleggibilità (EPAR EMA Imfinzi, AEGEAN).',
                        trial: 'AEGEAN',
                        guidelineNote: 'Attenzione: durvalumab nel NSCLC ha una indicazione con soglia (stadio III post-CRT, TC >=1%) e due senza. Il metodo dipende dall\'indicazione, non dal farmaco.'
                    },
                    'first-combo-treme': {
                        name: 'Prima linea metastatico + tremelimumab + chemio',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Durvalumab + tremelimumab + chemioterapia a base di platino in prima linea nel NSCLC metastatico senza mutazioni EGFR sensibilizzanti né alterazioni ALK. PD-L1 non è criterio di eleggibilità (EPAR EMA Imfinzi, POSEIDON).',
                        trial: 'POSEIDON'
                    }
                }
            },
            sugemalimab: {
                name: 'Sugemalimab (Cejemly)', clone: 'SP263 (Ventana)',
                indications: {
                    'stage3-consolidation': {
                        name: 'Stadio III non resecabile, consolidamento post-chemioradioterapia',
                        method: 'TPS', cutoff: 1,
                        notes: 'Sugemalimab monoterapia nel NSCLC stadio III non resecabile, senza mutazioni EGFR sensibilizzanti né riarrangiamenti ALK/ROS1, con PD-L1 espresso su >=1% delle cellule tumorali, la cui malattia non è progredita dopo chemioradioterapia a base di platino (EPAR EMA Cejemly, GEMSTONE-301).',
                        trial: 'GEMSTONE-301',
                        guidelineNote: 'Stessa nicchia di durvalumab post-PACIFIC e stessa soglia (TC >=1%): la richiesta puo\' arrivare per l\'uno o per l\'altro, il dato richiesto e\' identico.',
                        clinicalContext: [
                            { id: 'nsclc_drivers_suge', label: 'Assenza di mutazioni EGFR sensibilizzanti e di riarrangiamenti ALK/ROS1 documentata', required: true },
                            { id: 'nsclc_crt_suge', label: 'Chemioradioterapia a base di platino completata senza progressione', required: true }
                        ]
                    },
                    'first-combo-metastatic': {
                        name: 'Prima linea metastatico + chemio a base di platino',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Sugemalimab + chemioterapia a base di platino in prima linea nel NSCLC metastatico senza mutazioni EGFR sensibilizzanti né alterazioni ALK/ROS1/RET. PD-L1 non è criterio di eleggibilità (EPAR EMA Cejemly).',
                        trial: 'GEMSTONE-302'
                    }
                }
            },
            tislelizumab: {
                name: 'Tislelizumab (Tevimbra)', clone: 'SP263 (Ventana)',
                indications: {
                    'first-combo-nonsq': {
                        name: 'Prima linea non squamoso + pemetrexed/platino',
                        method: 'TPS', cutoff: 50,
                        notes: 'Tislelizumab + pemetrexed e chemioterapia a base di platino in prima linea nel NSCLC non squamoso con PD-L1 espresso su >=50% delle cellule tumorali, EGFR e ALK negativi, localmente avanzato non candidabile a chirurgia/chemioradioterapia oppure metastatico (SmPC Tevimbra).',
                        trial: 'RATIONALE-304',
                        guidelineNote: 'Caso anomalo: e\' una COMBINAZIONE con chemioterapia che richiede comunque una soglia alta (>=50%). Non assimilarla alle altre combinazioni, che sono PD-L1 agnostiche.',
                        clinicalContext: [
                            { id: 'nsclc_egfr_alk_tis', label: 'Assenza di mutazioni EGFR e di positività ALK documentata', required: true },
                            { id: 'nsclc_hist_nonsq_tis', label: 'Istotipo non squamoso confermato', required: true }
                        ]
                    },
                    'first-combo-sq': {
                        name: 'Prima linea squamoso + carboplatino/taxano',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Tislelizumab + carboplatino e paclitaxel o nab-paclitaxel in prima linea nel NSCLC squamoso. PD-L1 non è criterio di eleggibilità (SmPC Tevimbra).',
                        trial: 'RATIONALE-307'
                    },
                    'perioperative': {
                        name: 'Perioperatorio (neoadiuvante + adiuvante)',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Tislelizumab + chemioterapia a base di platino come neoadiuvante, poi monoterapia adiuvante, NSCLC resecabile ad alto rischio di recidiva. PD-L1 non è criterio di eleggibilità (SmPC Tevimbra).',
                        trial: 'RATIONALE-315'
                    },
                    'second-mono': {
                        name: 'Monoterapia dopo platino',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Tislelizumab monoterapia nel NSCLC localmente avanzato o metastatico dopo precedente terapia a base di platino. PD-L1 non è criterio di eleggibilità (SmPC Tevimbra).',
                        trial: 'RATIONALE-303'
                    }
                }
            },
            cemiplimab: {
                name: 'Cemiplimab',
                clone: 'Test PD-L1 validato (assay specifico, non clone SP-defined)',
                indications: {
                    'first-mono': {
                        name: 'Prima linea monoterapia',
                        method: 'TPS',
                        cutoff: 50,
                        notes: 'Cemiplimab monoterapia in NSCLC localmente avanzato/metastatico con PD-L1 >=50% su cellule tumorali, senza EGFR, ALK o ROS1 secondo EPAR EMA Libtayo (EMPOWER-Lung 1).',
                        trial: 'EMPOWER-Lung 1',
                        clinicalContext: [
                            { id: 'nsclc_drivers_cemi_mono', label: 'Assenza di EGFR, ALK e ROS1 documentata', required: true }
                        ]
                    },
                    'first-combo-chemo': {
                        name: 'Prima linea + chemioterapia a base di platino',
                        method: 'TPS',
                        cutoff: 1,
                        notes: 'Cemiplimab + chemioterapia a base di platino in NSCLC localmente avanzato/metastatico con PD-L1 >=1% su cellule tumorali, senza EGFR, ALK o ROS1 secondo EPAR EMA Libtayo (EMPOWER-Lung 3).',
                        trial: 'EMPOWER-Lung 3',
                        clinicalContext: [
                            { id: 'nsclc_drivers_cemi_combo', label: 'Assenza di EGFR, ALK e ROS1 documentata', required: true }
                        ]
                    }
                }
            }
        }
    },
    melanoma: {
        name: 'Melanoma',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: 'SP263 (Ventana)',
                indications: {
                    'advanced': { name: 'Avanzato (non resecabile/metastatico)', method: 'Non richiesto', cutoff: 0, notes: 'Pembrolizumab monoterapia nel melanoma avanzato non resecabile o metastatico. PD-L1 non è criterio di eleggibilità (SmPC EMA Keytruda); SP263 utilizzabile se richiesto a fini prognostici.', trial: 'KEYNOTE-006' },
                    'adjuvant': { name: 'Adiuvante (stadio IIB, IIC o III resecato)', method: 'Non richiesto', cutoff: 0, notes: 'Pembrolizumab monoterapia come adiuvante in adulti e adolescenti dai 12 anni con melanoma di stadio IIB, IIC o III sottoposto a resezione completa (SmPC EMA Keytruda, KEYNOTE-716/KEYNOTE-054). PD-L1 non è criterio di eleggibilità.', trial: 'KEYNOTE-716 / KEYNOTE-054' }
                }
            },
            nivolumab: {
                name: 'Nivolumab', clone: 'SP263 (Ventana)',
                indications: {
                    'any': { name: 'Qualsiasi linea', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico; SP263 usabile per valutazione prognostica', trial: 'CheckMate-066/067' },
                    'adjuvant': { name: 'Adiuvante (stadio IIB/IIC, o linfonodi/metastasi resecati)', method: 'Non richiesto', cutoff: 0, notes: 'Nivolumab monoterapia come adiuvante in adulti e adolescenti dai 12 anni con melanoma di stadio IIB o IIC, oppure con interessamento linfonodale o malattia metastatica sottoposta a resezione completa (SmPC EMA Opdivo). PD-L1 non è criterio di eleggibilità.', trial: 'CheckMate-238 / CheckMate-76K' }
                }
            }
        }
    },
    hnscc: {
        name: 'HNSCC (Head and Neck Squamous Cell)',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: '22C3 (Dako)',
                indications: {
                    'first-mono': { name: 'Prima linea monoterapia', method: 'CPS', cutoff: 1, notes: 'Prima linea R/M HNSCC secondo EPAR EMA: CPS >=1. (KEYNOTE-048)', trial: 'KEYNOTE-048', guidelineNote: 'CPS >=20 rappresenta un sottogruppo clinicamente rilevante ma non è il cutoff regolatorio EMA.' },
                    'first-combo': { name: 'Prima linea + chemio', method: 'CPS', cutoff: 1, notes: 'CPS >=1 in combinazione con platino/5-FU, R/M (KEYNOTE-048)', trial: 'KEYNOTE-048' },
                    'second': { name: 'Seconda linea (R/M post-platino)', method: 'TPS', cutoff: 50, notes: 'Pembrolizumab monoterapia nel R/M HNSCC dopo fallimento di terapia contenente platino: PD-L1 TPS >=50% secondo EPAR EMA Keytruda. (KEYNOTE-040)', trial: 'KEYNOTE-040' },
                    'neoadjuvant-adjuvant': {
                        name: 'Neoadiuvante + adiuvante (resecabile localmente avanzato)',
                        method: 'CPS', cutoff: 1,
                        notes: 'Pembrolizumab monoterapia come neoadiuvante, poi adiuvante in combinazione con radioterapia +/- cisplatino concomitante e infine monoterapia, HNSCC resecabile localmente avanzato (LA-HNSCC), PD-L1 CPS >=1, secondo EPAR EMA Keytruda.',
                        trial: 'KEYNOTE-689'
                    }
                }
            },
            nivolumab: {
                name: 'Nivolumab', clone: '28-8 (Dako)',
                indications: { 
                    'second': { 
                        name: 'Seconda linea (R/M post-platino)', 
                        method: 'Non richiesto', cutoff: 0, 
                        notes: 'Carcinoma squamoso ricorrente/metastatico in progressione durante o dopo chemioterapia a base di platino. PD-L1 non è criterio di eleggibilità (EPAR EMA Opdivo CheckMate-141).', 
                        trial: 'CheckMate-141',
                        guidelineNote: 'PD-L1 può essere valutato a fini prognostici. Se eseguito, usare TPS.'
                    } 
                }
            }
        }
    },
    uc: {
        name: 'Carcinoma uroteliale',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: '22C3 (Dako)',
                indications: {
                    'first-cisplatin-unfit': {
                        name: 'Prima linea (cisplatino-unfit)', method: 'CPS', cutoff: 10,
                        notes: 'CPS >=10; pazienti non eleggibili a cisplatino (EPAR EMA Keytruda KEYNOTE-052)', trial: 'KEYNOTE-052',
                        clinicalContext: [ { id: 'uc_cisplatin_unfit', label: 'Ineleggibilita\' a cisplatino documentata (ECOG >=2, ClCr <60 mL/min, neuropatia >=G2, ipoacusia >=G2 o insufficienza cardiaca NYHA >=III)', required: true } ]
                    },
                    'second': {
                        name: 'Seconda linea (post-platino)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Carcinoma uroteliale metastatico o localmente avanzato in progressione durante o dopo chemioterapia a base di platino. PD-L1 non è criterio di eleggibilità (EPAR EMA Keytruda KEYNOTE-045).',
                        trial: 'KEYNOTE-045',
                        guidelineNote: 'La determinazione di PD-L1 (CPS) può essere eseguita a fini prognostici/descrittivi'
                    },
                    'first-combo-ev': {
                        name: 'Prima linea + enfortumab vedotin (non resecabile/metastatico)',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'CPS',
                        notes: 'Pembrolizumab + enfortumab vedotin in prima linea nel carcinoma uroteliale non resecabile o metastatico. PD-L1 non è criterio di eleggibilità (SmPC EMA Keytruda, KEYNOTE-A39/EV-302).',
                        trial: 'KEYNOTE-A39 / EV-302',
                        guidelineNote: 'E\' oggi lo schema di prima linea di riferimento e non richiede PD-L1: prima di avviare un CPS in un uroteliale, verificare quale schema sia previsto. Il CPS >=10 serve solo per la monoterapia nei non eleggibili a cisplatino.'
                    },
                    'perioperative-ev': {
                        name: 'Perioperatorio MIBC + enfortumab vedotin (cisplatino-ineleggibili)',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'CPS',
                        notes: 'Pembrolizumab + enfortumab vedotin come neoadiuvante e poi proseguito dopo cistectomia radicale come adiuvante, nel carcinoma uroteliale muscolo-invasivo in pazienti non eleggibili a cisplatino (SmPC EMA Keytruda). PD-L1 non è criterio di eleggibilità.',
                        trial: 'KEYNOTE-905 / EV-303',
                        clinicalContext: [ { id: 'uc_cisplatin_unfit_ev', label: 'Ineleggibilita\' a cisplatino documentata', required: true } ]
                    }
                }
            },
            nivolumab: {
                name: 'Nivolumab', clone: '28-8 (Dako)',
                indications: { 
                    'second': { 
                        name: 'Seconda linea (post-platino)', 
                        method: 'Non richiesto', cutoff: 0, 
                        notes: 'Nivolumab monoterapia nel carcinoma uroteliale localmente avanzato/metastatico dopo fallimento di platino; PD-L1 non è criterio di eleggibilità secondo EPAR EMA Opdivo. (CheckMate-275)', 
                        trial: 'CheckMate-275'
                    },
                    'first-combo-cisgem': {
                        name: 'Prima linea + cisplatino/gemcitabina',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TPS',
                        notes: 'Nivolumab + cisplatino e gemcitabina in prima linea nel carcinoma uroteliale non resecabile o metastatico. PD-L1 non è criterio di eleggibilità (SmPC EMA Opdivo, CheckMate-901).',
                        trial: 'CheckMate-901'
                    },
                    'adjuvant-miuc': {
                        name: 'Adiuvante MIUC post-cistectomia',
                        method: 'TPS',
                        cutoff: 1,
                        notes: 'Carcinoma uroteliale muscolo-invasivo ad alto rischio dopo resezione radicale (cistectomia): Tumore cell PD-L1 >=1% secondo EPAR EMA Opdivo. (CheckMate-274)',
                        trial: 'CheckMate-274'
                    }
                }
            },
            atezolizumab: {
                name: 'Atezolizumab', clone: 'SP142 (Ventana)',
                indications: {
                    'first-cisplatin-unfit': {
                        name: 'Prima linea (cisplatino-unfit)',
                        method: 'IC',
                        cutoffIC: 5,
                        notes: 'Atezolizumab monoterapia nei pazienti ineleggibili per cisplatino con PD-L1 >=5% (IC2/3) secondo EPAR EMA Tecentriq. (IMvigor210)',
                        trial: 'IMvigor210',
                        clinicalContext: [
                            { id: 'uc_cisplatin_unfit_atezo', label: 'Ineleggibilita\' a cisplatino documentata (ECOG >=2, ClCr <60 mL/min, neuropatia >=G2, ipoacusia >=G2 o insufficienza cardiaca NYHA >=III)', required: true }
                        ]
                    },
                    'second-postplat': {
                        name: 'Seconda linea (post-platino)',
                        method: 'Non richiesto',
                        cutoff: 0,
                        optionalScoreMethod: 'IC',
                        notes: 'Atezolizumab monoterapia nel carcinoma uroteliale dopo precedente chemioterapia contenente platino; PD-L1 non è criterio di eleggibilità secondo EPAR EMA Tecentriq. (IMvigor211)',
                        trial: 'IMvigor211'
                    }
                }
            },
            avelumab: {
                name: 'Avelumab', clone: 'SP263 (Ventana)',
                indications: { 'maintenance': { name: 'Mantenimento post-chemio', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico; dopo risposta a platino', trial: 'JAVELIN Bladder 100' } }
            },
            durvalumab: {
                name: 'Durvalumab', clone: 'Non richiesto',
                indications: { 'perioperative-mibc': {
                    name: 'Perioperatorio MIBC (neoadiuvante + adiuvante)', method: 'Non richiesto', cutoff: 0,
                    notes: 'Carcinoma uroteliale muscolo-invasivo resecabile: durvalumab + gemcitabina/cisplatino come neoadiuvante, poi durvalumab in monoterapia come adiuvante dopo cistectomia radicale. PD-L1 non e\' criterio di eleggibilita\'.',
                    trial: 'NIAGARA',
                    regulatoryNote: 'FDA Marzo 2025; indicazione presente anche nella SmPC EMA Imfinzi (verifica 07/09/2026).'
                } }
            }
        }
    },
    gastric: {
        name: 'Carcinoma gastrico/GEJ',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: '22C3 (Dako)',
                indications: {
                    'first-combo': {
                        name: 'Prima linea + chemio (HER2-neg)', method: 'CPS', cutoff: 1,
                        notes: 'CPS >=1 (EPAR EMA Keytruda KEYNOTE-859)', trial: 'KEYNOTE-859',
                        clinicalContext: [ { id: 'gastric_her2_neg', label: 'HER2-negativita\' confermata (IHC 0/1+, oppure IHC 2+/ISH negativo)', required: true } ]
                    },
                    'first-her2': {
                        name: 'Prima linea + trastuzumab + chemio (HER2+)', method: 'CPS', cutoff: 1,
                        notes: 'CPS >=1; HER2-positivo (IHC 3+ o IHC 2+/FISH+) (FDA 2025, EPAR EMA Keytruda KEYNOTE-811)',
                        trial: 'KEYNOTE-811',
                        regulatoryNote: 'Indicazione presente nella SmPC EMA Keytruda (verifica 07/09/2026): "in combinazione con trastuzumab, fluoropirimidina e chemioterapia contenente platino... i cui tumori esprimono PD-L1 con CPS >= 1". FDA: approvazione tradizionale Marzo 2025.',
                        clinicalContext: [ { id: 'gastric_her2_pos', label: 'HER2-positivita\' confermata (IHC 3+, oppure IHC 2+/ISH positivo)', required: true } ]
                    },
                }
            },
            nivolumab: {
                name: 'Nivolumab', clone: '28-8 (Dako)',
                indications: {
                    'first-combo': {
                        name: 'Prima linea + chemio', method: 'CPS', cutoff: 5,
                        notes: 'Nivolumab + chemioterapia a base di fluoropirimidina e platino in prima linea nell\'adenocarcinoma gastrico, della giunzione gastro-esofagea o dell\'esofago, HER2-negativo, con CPS >=5 (EPAR EMA Opdivo, CheckMate-649).',
                        trial: 'CheckMate-649',
                        clinicalContext: [ { id: 'gastric_her2_neg_nivo', label: 'HER2-negativita\' confermata', required: true } ]
                    }
                }
            },
            tislelizumab: {
                name: 'Tislelizumab (Tevimbra)', clone: 'SP263 (Ventana)',
                indications: {
                    'first-combo': {
                        name: 'Prima linea + platino/fluoropirimidina (HER2-neg)',
                        method: 'TAP', cutoff: 5,
                        notes: 'Tislelizumab + chemioterapia a base di platino e fluoropirimidina in prima linea nell\'adenocarcinoma gastrico/GEJ HER2-negativo localmente avanzato non resecabile o metastatico, con PD-L1 espresso con TAP score >=5% (SmPC Tevimbra, RATIONALE-305).',
                        trial: 'RATIONALE-305',
                        guidelineNote: 'Metodo di score diverso da tutti gli altri farmaci gastrici: TAP (tumour area positivity), stima visiva su AREA, non conteggio cellulare come il CPS. Non convertire un CPS in TAP.',
                        clinicalContext: [ { id: 'gastric_her2_neg_tis', label: 'HER2-negativita\' confermata (IHC 0/1+, oppure IHC 2+/ISH negativo)', required: true } ]
                    }
                }
            },
            durvalumab: {
                name: 'Durvalumab', clone: 'Non richiesto',
                indications: {
                    'perioperative': {
                        name: 'Perioperatorio + FLOT (resecabile)', method: 'Non richiesto', cutoff: 0,
                        notes: 'PD-L1 agnostico; malattia resecabile', trial: 'MATTERHORN',
                        guidelineNote: 'NCCN Cat.1 (2025). Nessun beneficio documentato nell\'istotipo diffuso di Lauren (analisi esplorativa)'
                    }
                }
            }
        }
    },
    escc: {
        name: 'Carcinoma esofageo squamoso',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: '22C3 (Dako)',
                indications: {
                    'first-combo': {
                        name: 'Prima linea + chemio', method: 'CPS', cutoff: 10,
                        notes: 'Carcinoma dell\'esofago localmente avanzato non resecabile o metastatico, in combinazione con chemioterapia a base di platino e fluoropirimidina; CPS >=10 (EPAR EMA Keytruda KEYNOTE-590).',
                        trial: 'KEYNOTE-590',
                        guidelineNote: 'v3.6.0: rimossa la voce "seconda linea CPS >=10" (KEYNOTE-181), che non e\' un\'indicazione EMA. La SmPC Keytruda prevede per l\'esofago solo la prima linea in combinazione; FDA ha ritirato l\'indicazione di seconda linea nel 2023.'
                    }
                }
            },
            nivolumab: {
                name: 'Nivolumab', clone: '28-8 (Dako)',
                indications: {
                    'first-combo': { 
                        name: 'Prima linea + chemio + ipilimumab', 
                        method: 'TPS', cutoff: 1, 
                        notes: 'Tumore cell (TC) PD-L1 >=1% (EPAR EMA Opdivo CheckMate-648)', 
                        trial: 'CheckMate-648' 
                    },
                    'second': { 
                        name: 'Seconda linea (post-chemio)', 
                        method: 'Non richiesto', cutoff: 0, 
                        optionalScoreMethod: 'TPS',
                        notes: 'Carcinoma esofageo squamoso in progressione dopo fluoropirimidina/platino. PD-L1 non è criterio di eleggibilità; beneficio osservato indipendentemente dall\'espressione tumorale di PD-L1 (EPAR EMA Opdivo, FDA ATTRACTION-3).', 
                        trial: 'ATTRACTION-3',
                        guidelineNote: 'PD-L1 può essere valutato a fini prognostici.'
                    }
                }
            },
            tislelizumab: {
                name: 'Tislelizumab (Tevimbra)', clone: 'SP263 (Ventana)',
                indications: {
                    'first-combo': {
                        name: 'Prima linea + chemio a base di platino',
                        method: 'TAP', cutoff: 5,
                        notes: 'Tislelizumab + chemioterapia a base di platino in prima linea nel carcinoma esofageo squamoso non resecabile, localmente avanzato o metastatico, con PD-L1 espresso con TAP score >=5% (SmPC Tevimbra, RATIONALE-306).',
                        trial: 'RATIONALE-306',
                        guidelineNote: 'Nello stesso istotipo convivono tre metodi diversi: CPS >=10 per pembrolizumab, TC >=1% per nivolumab+ipilimumab, TAP >=5% per tislelizumab. Il metodo dipende dal farmaco richiesto, non dal tumore.'
                    },
                    'second-mono': {
                        name: 'Monoterapia dopo platino',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'TAP',
                        notes: 'Tislelizumab monoterapia nel carcinoma esofageo squamoso non resecabile, localmente avanzato o metastatico, dopo precedente chemioterapia a base di platino. PD-L1 non è criterio di eleggibilità (SmPC Tevimbra).',
                        trial: 'RATIONALE-302'
                    }
                }
            }
        }
    },
    tnbc: {
        name: 'TNBC (Triplo Negativo Mammella)',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: '22C3 (Dako)',
                indications: {
                    'first-combo': { 
                        name: 'Prima linea + chemio', 
                        method: 'CPS', 
                        cutoff: 10, 
                        notes: 'CPS >=10; malattia localmente avanzata o metastatica', 
                        trial: 'KEYNOTE-355',
                        guidelineNote: 'Standard EMA: CPS con 22C3. Nel tuo lab, se non hai 22C3, hai due alternative Ventana: SP263 (TPS, ~90% concordanza vs CPS) oppure SP142 (IC, metodo nativo). Scegli quale usare di routine in base a quello che l\'oncologo preferisce (TPS vs IC).'
                    },
                    'neoadjuvant': { name: 'Neoadiuvante + chemio', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico; alto rischio', trial: 'KEYNOTE-522' }
                }
            },
            atezolizumab: {
                name: 'Atezolizumab', clone: 'SP142 (Ventana)',
                indications: {
                    'first-combo': {
                        name: 'Prima linea + nab-paclitaxel',
                        method: 'IC',
                        cutoffIC: 1,
                        notes: 'IC >=1%; valutato solo IC',
                        trial: 'IMpassion130',
                        regulatoryNote: 'FDA withdrawn Aug 2021 (IMpassion131 OS negativo). Indicazione ancora attiva EMA/AIFA.'
                    }
                }
            }
        }
    },
    rcc: {
        name: 'Carcinoma renale (RCC)',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: 'Non richiesto',
                indications: {
                    'first-combo-axi': { name: 'Prima linea + axitinib', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico; a cellule chiare', trial: 'KEYNOTE-426' },
                    'first-combo-len': { name: 'Prima linea + lenvatinib', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico; a cellule chiare', trial: 'KEYNOTE-581/CLEAR' },
                    'adjuvant': { name: 'Adiuvante post-nefrectomia (rischio aumentato)', method: 'Non richiesto', cutoff: 0, notes: 'Pembrolizumab monoterapia come adiuvante nel carcinoma renale ad aumentato rischio di recidiva dopo nefrectomia, o dopo nefrectomia e resezione delle lesioni metastatiche (SmPC EMA Keytruda, KEYNOTE-564). PD-L1 non è criterio di eleggibilità.', trial: 'KEYNOTE-564' }
                }
            },
            nivolumab: {
                name: 'Nivolumab', clone: 'Non richiesto',
                indications: {
                    'first-combo-ipi': { name: 'Prima linea + ipilimumab', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico; rischio intermedio/alto', trial: 'CheckMate-214' },
                    'second': { name: 'Seconda linea', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico; post-TKI', trial: 'CheckMate-025' },
                    'first-combo-cabo': { name: 'Prima linea + cabozantinib', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico', trial: 'CheckMate-9ER' }
                }
            },
            avelumab: {
                name: 'Avelumab', clone: 'Non richiesto',
                indications: {
                    'first-combo-axi': { name: 'Prima linea + axitinib', method: 'Non richiesto', cutoff: 0, notes: 'Avelumab + axitinib in prima linea nel carcinoma renale avanzato. PD-L1 non è criterio di eleggibilità (SmPC EMA Bavencio, JAVELIN Renal 101).', trial: 'JAVELIN Renal 101' }
                }
            }
        }
    },
    cervical: {
        name: 'Carcinoma cervicale',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: '22C3 (Dako)',
                indications: {
                    'first-combo': {
                        name: 'Prima linea + chemio +/- bevacizumab', method: 'CPS', cutoff: 1,
                        notes: 'Carcinoma della cervice persistente, ricorrente o metastatico, in combinazione con chemioterapia con o senza bevacizumab; CPS >=1 (EPAR EMA Keytruda KEYNOTE-826).',
                        trial: 'KEYNOTE-826',
                        guidelineNote: 'v3.6.0: rimossa la voce "seconda linea CPS >=1" (KEYNOTE-158). La SmPC Keytruda non prevede una monoterapia della cervice dopo platino: e\' un\'indicazione FDA, non EMA.'
                    }
                }
            },
            cemiplimab: {
                name: 'Cemiplimab', clone: 'Non richiesto',
                indications: {
                    'second-mono': {
                        name: 'Monoterapia dopo platino (ricorrente/metastatico)',
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'CPS',
                        notes: 'Cemiplimab monoterapia nel carcinoma della cervice ricorrente o metastatico in progressione durante o dopo chemioterapia a base di platino. PD-L1 non è criterio di eleggibilità (EPAR EMA Libtayo, EMPOWER-Cervical 1).',
                        trial: 'EMPOWER-Cervical 1',
                        guidelineNote: 'E\' la strada per la seconda linea della cervice: pembrolizumab in monoterapia dopo platino non e\' indicazione EMA, cemiplimab si\' — e non richiede PD-L1.'
                    }
                }
            }
        }
    },
    endometrium: {
        name: 'Carcinoma endometriale',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: 'Non richiesto',
                indications: {
                    'first-combo': { name: 'Prima linea + chemio', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico', trial: 'NRG-GY018' },
                    'advanced-lenvatinib': {
                        name: 'Avanzato/ricorrente + lenvatinib (dopo platino)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Pembrolizumab + lenvatinib nel carcinoma endometriale avanzato o ricorrente in progressione durante o dopo un precedente trattamento contenente platino, in pazienti non candidati a chirurgia o radioterapia curativa (SmPC EMA Keytruda, KEYNOTE-775). PD-L1 non è criterio di eleggibilità.',
                        trial: 'KEYNOTE-775',
                        guidelineNote: 'v3.6.0 — CORREZIONE: questa voce esigeva dMMR/MSI-H come requisito bloccante. La SmPC non lo prevede: l\'indicazione vale indipendentemente dallo stato MMR, ed è anzi la strada per i casi MMR-proficienti. Il gate impediva di produrre il referto proprio per la popolazione a cui l\'indicazione si rivolge.'
                    },
                    'advanced-dmmr-mono': {
                        name: 'Monoterapia MSI-H/dMMR (dopo platino)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Pembrolizumab monoterapia nel carcinoma endometriale avanzato o ricorrente MSI-H o dMMR in progressione dopo un precedente trattamento contenente platino, in pazienti non candidati a chirurgia o radioterapia curativa (SmPC EMA Keytruda). PD-L1 non è criterio di eleggibilità; lo è lo stato MMR.',
                        trial: 'KEYNOTE-158 (coorte MSI-H)',
                        clinicalContext: [ { id: 'endo_dmmr_pembro_mono', label: 'MSI-H/dMMR confermato da test validato (IHC MMR e/o PCR/NGS)', required: true } ]
                    }
                }
            },
            dostarlimab: {
                name: 'Dostarlimab', clone: 'Non richiesto',
                indications: {
                    'advanced-dmmr': {
                        name: 'Avanzato (dMMR/MSI-H obbligatorio)', method: 'Non richiesto', cutoff: 0,
                        notes: 'PD-L1 non richiesto; eleggibilita\' condizionata a dMMR/MSI-H', trial: 'GARNET',
                        clinicalContext: [ { id: 'endo_dmmr_dosta', label: 'dMMR/MSI-H confermato da test molecolare validato (IHC MMR +/- PCR/NGS)', required: true } ]
                    },
                    'first-combo': { name: 'Prima linea + chemio', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico', trial: 'RUBY' }
                }
            }
        }
    },
    hcc: {
        name: 'Epatocarcinoma (HCC)',
        drugs: {
            atezolizumab: { name: 'Atezolizumab', clone: 'Non richiesto', indications: { 'first-combo-bev': { name: 'Prima linea + bevacizumab', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico', trial: 'IMbrave150' } } },
            nivolumab: { name: 'Nivolumab', clone: 'Non richiesto', indications: { 'first-combo-ipi': { name: 'Prima linea + ipilimumab', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico secondo EPAR EMA Opdivo', trial: 'CheckMate-040 subset + nuove approvazioni EMA' } } },
            durvalumab: { name: 'Durvalumab', clone: 'Non richiesto', indications: {
                'first-combo-treme': { name: 'Prima linea + tremelimumab (STRIDE)', method: 'Non richiesto', cutoff: 0, notes: 'Durvalumab + dose singola di tremelimumab in prima linea nell\'HCC avanzato/non resecabile. PD-L1 non è criterio di eleggibilità (EPAR EMA Imfinzi, HIMALAYA).', trial: 'HIMALAYA' }
            } },
            pembrolizumab: { name: 'Pembrolizumab', clone: 'Non richiesto', indications: { 'msih-dmmr-fuori-lista': {
                name: 'MSI-H/dMMR — l\'HCC NON è nella lista EMA', method: 'Non richiesto', cutoff: 0,
                notes: 'PD-L1 non è richiesto, ma non è questo il punto: l\'indicazione MSI-H/dMMR di pembrolizumab in EMA è una LISTA CHIUSA — colon-retto, endometrio, stomaco, piccolo intestino, vie biliari — e non è tumour-agnostic come in FDA. L\'epatocarcinoma non ne fa parte. Se arriva una richiesta di PD-L1 su un HCC motivata dallo stato MSI-H, la premessa regolatoria va verificata con l\'oncologo prima dell\'esame.',
                trial: 'KEYNOTE-158 / KEYNOTE-164 (coorti MSI-H)',
                guidelineNote: 'v3.6.0 — CORREZIONE: la voce precedente parlava di "indicazioni tumour-agnostic secondo EPAR EMA". In EMA quella lista è chiusa e non comprende l\'HCC.',
                clinicalContext: [ { id: 'hcc_msih_fuori_lista', label: 'Preso atto che l\'HCC non rientra nell\'indicazione MSI-H/dMMR EMA di pembrolizumab: la richiesta è stata verificata con l\'oncologo', required: true } ]
            } } }
        }
    },
    mesothelioma: {
        name: 'Mesotelioma pleurico',
        drugs: {
            nivolumab: { name: 'Nivolumab', clone: 'Non richiesto', indications: { 'first-combo-ipi': { name: 'Prima linea + ipilimumab', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico secondo EPAR EMA Opdivo', trial: 'CheckMate-743' } } },
            pembrolizumab: { name: 'Pembrolizumab', clone: 'Non richiesto', indications: { 'first-combo-chemo': { name: 'Prima linea + pemetrexed + platino', method: 'Non richiesto', cutoff: 0, notes: 'Mesotelioma pleurico maligno non epitelioide; PD-L1 agnostico secondo EPAR EMA Keytruda', trial: 'IND.227/KEYNOTE-483' } } }
        }
    },
    cscc: {
        name: 'Carcinoma cutaneo squamoso (cSCC)',
        drugs: {
            cemiplimab: { name: 'Cemiplimab', clone: 'Non richiesto', indications: {
                'advanced': { name: 'Localmente avanzato/metastatico', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico (EPAR EMA Libtayo)', trial: 'EMPOWER-CSCC-1' },
                'adjuvant': { name: 'Adiuvante dopo chirurgia e radioterapia', method: 'Non richiesto', cutoff: 0, notes: 'Cemiplimab adiuvante nel cSCC ad alto rischio di recidiva dopo resezione e radioterapia. PD-L1 non è criterio di eleggibilità (EPAR EMA Libtayo, C-POST).', trial: 'C-POST' }
            } },
            pembrolizumab: { name: 'Pembrolizumab', clone: 'Non richiesto', indications: { 'recurrent': { name: 'Ricorrente/metastatico', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico', trial: 'KEYNOTE-629' } } }
        }
    },
    bcc: {
        name: 'Carcinoma basocellulare (BCC)',
        drugs: {
            cemiplimab: { name: 'Cemiplimab', clone: 'Non richiesto', indications: { 'advanced': { name: 'Avanzato post-hedgehog', method: 'Non richiesto', cutoff: 0, notes: 'PD-L1 agnostico; dopo inibitori hedgehog', trial: 'Phase 2 study' } } }
        }
    },
    btc: {
        name: 'Colangiocarcinoma/vie biliari (BTC)',
        drugs: {
            pembrolizumab: { 
                name: 'Pembrolizumab', clone: '22C3 (Dako)', 
                indications: { 
                    'first-combo': { 
                        name: 'Prima linea + gemcitabina/cisplatino', 
                        method: 'Non richiesto', cutoff: 0,
                        optionalScoreMethod: 'CPS',
                        notes: 'Carcinoma delle vie biliari localmente avanzato/metastatico. PD-L1 non è criterio di eleggibilità (EPAR EMA Keytruda KEYNOTE-966).', 
                        trial: 'KEYNOTE-966',
                        guidelineNote: 'PD-L1 può essere valutato a fini prognostici/descrittivi. Se eseguito, usare CPS.'
                    },
                    'msih-dmmr': {
                        name: 'Monoterapia MSI-H/dMMR (dopo terapia precedente)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Pembrolizumab monoterapia nel carcinoma delle vie biliari non resecabile o metastatico MSI-H o dMMR in progressione dopo una precedente terapia (SmPC EMA Keytruda, lista chiusa MSI-H/dMMR). PD-L1 non è criterio di eleggibilità; lo è lo stato MMR.',
                        trial: 'KEYNOTE-158 (coorte MSI-H)',
                        clinicalContext: [ { id: 'btc_dmmr_pembro', label: 'MSI-H/dMMR confermato (IHC MMR e/o PCR/NGS)', required: true } ]
                    }
                } 
            },
            durvalumab: { name: 'Durvalumab', clone: 'Non richiesto', indications: { 'first-combo': { name: 'Prima linea + gemcitabina/cisplatino', method: 'Non richiesto', cutoff: 0, notes: 'Durvalumab + gemcitabina e cisplatino in prima linea nel carcinoma delle vie biliari localmente avanzato o metastatico. PD-L1 non è criterio di eleggibilità (EPAR EMA Imfinzi, TOPAZ-1).', trial: 'TOPAZ-1' } } }
        }
    },
    crc: {
        name: 'Carcinoma colon-retto (CRC)',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: 'Non richiesto',
                indications: {
                    'first-line-dmmr': {
                        name: 'Prima linea metastatico (MSI-H/dMMR)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Pembrolizumab monoterapia in prima linea nel carcinoma del colon-retto metastatico MSI-H o dMMR (SmPC EMA Keytruda, KEYNOTE-177). PD-L1 non è criterio di eleggibilità; lo è lo stato MMR.',
                        trial: 'KEYNOTE-177',
                        clinicalContext: [ { id: 'crc_dmmr_pembro_1l', label: 'MSI-H/dMMR confermato (IHC MMR e/o PCR per MSI)', required: true } ]
                    },
                    'pretreated-dmmr': {
                        name: 'Dopo fluoropirimidina (MSI-H/dMMR)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Pembrolizumab monoterapia nel carcinoma del colon-retto non resecabile o metastatico MSI-H o dMMR dopo precedente terapia di combinazione a base di fluoropirimidina (SmPC EMA Keytruda). PD-L1 non è criterio di eleggibilità.',
                        trial: 'KEYNOTE-164',
                        clinicalContext: [ { id: 'crc_dmmr_pembro_2l', label: 'MSI-H/dMMR confermato (IHC MMR e/o PCR per MSI)', required: true } ]
                    }
                }
            },
            nivolumab: {
                name: 'Nivolumab', clone: 'Non richiesto',
                indications: {
                    'first-line-dmmr': {
                        name: 'Prima linea + ipilimumab (MSI-H/dMMR)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Nivolumab + ipilimumab in prima linea nel carcinoma del colon-retto non resecabile o metastatico dMMR o MSI-H (SmPC EMA Opdivo, CheckMate-8HW). PD-L1 non è criterio di eleggibilità; lo è lo stato MMR.',
                        trial: 'CheckMate-8HW',
                        clinicalContext: [ { id: 'crc_dmmr_nivo_1l', label: 'MSI-H/dMMR confermato (IHC MMR e/o PCR per MSI)', required: true } ]
                    },
                    'pretreated-dmmr': {
                        name: 'Dopo fluoropirimidina + ipilimumab (MSI-H/dMMR)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Nivolumab + ipilimumab nel carcinoma del colon-retto metastatico dMMR o MSI-H dopo precedente chemioterapia di combinazione a base di fluoropirimidina (SmPC EMA Opdivo). PD-L1 non è criterio di eleggibilità.',
                        trial: 'CheckMate-142 / CheckMate-8HW',
                        clinicalContext: [ { id: 'crc_dmmr_nivo_2l', label: 'MSI-H/dMMR confermato (IHC MMR e/o PCR per MSI)', required: true } ]
                    }
                }
            }
        }
    },
    sclc: {
        name: 'Microcitoma polmonare (SCLC)',
        drugs: {
            atezolizumab: {
                name: 'Atezolizumab', clone: 'Non richiesto',
                indications: {
                    'first-line-es': {
                        name: 'Prima linea ES-SCLC + carboplatino/etoposide',
                        method: 'Non richiesto', cutoff: 0,
                        notes: 'Atezolizumab + carboplatino ed etoposide in prima linea nel microcitoma in stadio esteso. PD-L1 non è criterio di eleggibilità (EPAR EMA Tecentriq, IMpower133).',
                        trial: 'IMpower133'
                    },
                    'maintenance': {
                        name: 'Mantenimento prima linea + lurbinectedina',
                        method: 'Non richiesto', cutoff: 0,
                        notes: 'Mantenimento dopo induzione con atezolizumab + carboplatino + etoposide senza progressione, in ES-SCLC. PD-L1 agnostico: IMforte non prevede stratificazione né selezione per PD-L1 (EC approval Mar/2026, parere CHMP 27/03/2026).',
                        trial: 'IMforte'
                    }
                }
            },
            durvalumab: {
                name: 'Durvalumab', clone: 'Non richiesto',
                indications: {
                    'first-line-es': {
                        name: 'Prima linea ES-SCLC + etoposide/platino',
                        method: 'Non richiesto', cutoff: 0,
                        notes: 'Durvalumab + etoposide e carboplatino o cisplatino in prima linea nel microcitoma in stadio esteso. PD-L1 non è criterio di eleggibilità (EPAR EMA Imfinzi, CASPIAN).',
                        trial: 'CASPIAN'
                    },
                    'ls-consolidation': {
                        name: 'Consolidamento LS-SCLC post-chemioradioterapia',
                        method: 'Non richiesto', cutoff: 0,
                        notes: 'Durvalumab monoterapia nel microcitoma in stadio limitato la cui malattia non è progredita dopo chemioradioterapia a base di platino. PD-L1 non è criterio di eleggibilità (EPAR EMA Imfinzi, ADRIATIC).',
                        trial: 'ADRIATIC',
                        guidelineNote: 'Da non confondere con il consolidamento PACIFIC nel NSCLC stadio III, che invece richiede TC >=1%.'
                    }
                }
            },
            tislelizumab: {
                name: 'Tislelizumab (Tevimbra)', clone: 'Non richiesto',
                indications: {
                    'first-line-es': {
                        name: 'Prima linea ES-SCLC + etoposide/platino',
                        method: 'Non richiesto', cutoff: 0,
                        notes: 'Tislelizumab + etoposide e chemioterapia a base di platino in prima linea nel microcitoma in stadio esteso. PD-L1 non è criterio di eleggibilità (SmPC Tevimbra).',
                        trial: 'RATIONALE-312'
                    }
                }
            }
        }
    },
    mcc: {
        name: 'Carcinoma a cellule di Merkel (MCC)',
        drugs: {
            avelumab: {
                name: 'Avelumab', clone: 'Non richiesto',
                indications: {
                    'metastatic': {
                        name: 'Metastatico (monoterapia)', method: 'Non richiesto', cutoff: 0,
                        notes: 'Avelumab monoterapia nel carcinoma a cellule di Merkel metastatico. PD-L1 non è criterio di eleggibilità (SmPC EMA Bavencio, JAVELIN Merkel 200).',
                        trial: 'JAVELIN Merkel 200',
                        guidelineNote: 'La caratterizzazione utile in AP è semmai lo stato di poliomavirus di Merkel (MCPyV, IHC CM2B4) e il CK20 con pattern paranucleare a punto, non il PD-L1.'
                    }
                }
            }
        }
    },

    npc: {
        name: 'Carcinoma rinofaringeo (NPC)',
        drugs: {
            tislelizumab: {
                name: 'Tislelizumab (Tevimbra)', clone: 'Non richiesto',
                indications: {
                    'first-combo': {
                        name: 'Prima linea + gemcitabina/cisplatino',
                        method: 'Non richiesto', cutoff: 0,
                        notes: 'Tislelizumab + gemcitabina e cisplatino in prima linea nel carcinoma rinofaringeo ricorrente non suscettibile di chirurgia o radioterapia curativa, o metastatico. PD-L1 non è criterio di eleggibilità (SmPC Tevimbra).',
                        trial: 'RATIONALE-309'
                    }
                }
            }
        }
    },

    ovarian: {
        name: 'Carcinoma ovarico/tube di Falloppio/peritoneale primitivo',
        drugs: {
            pembrolizumab: {
                name: 'Pembrolizumab', clone: '22C3 (Dako)',
                indications: {
                    'platinum-resistant': {
                        name: 'Platino-resistente + paclitaxel ± bevacizumab',
                        method: 'CPS', cutoff: 1,
                        notes: 'Carcinoma epiteliale ovarico/tube di Falloppio/peritoneale primitivo platino-resistente, dopo 1-2 linee precedenti; CPS >=1. Approvazione EC su parere CHMP di febbraio 2026.',
                        trial: 'KEYNOTE-B96/ENGOT-ov65'
                    }
                }
            }
        }
    }
};

function getCloneName(s) {
    for (const c of ['22C3','28-8','73-10','SP142','SP263']) if (s && s.includes(c)) return c;
    return null;
}
function getCloneAvailability(s) {
    if (!s || s === 'Non richiesto') return 'none';
    if (s.includes('Test PD-L1 validato')) return 'validated_generic';
    if (labConfig.inHouseClones.some(c => s.includes(c))) return 'inhouse';
    if (labConfig.serviceClones.some(c => s.includes(c))) return 'service';
    return 'unknown';
}

function getOptionalScoreMethod(indication) {
    if (Object.prototype.hasOwnProperty.call(indication, 'optionalScoreMethod')) {
        return indication.optionalScoreMethod; // può essere 'TPS', 'CPS', 'IC', oppure null
    }
    return null; // default prudente: niente score opzionale automatico
}

function checkInterchangeability(cloneStr, tumor) {
    const name = getCloneName(cloneStr);
    if (!name || !cloneInterchangeability[name]) return null;
    const info = cloneInterchangeability[name];
    if (!info.alternative || !info.tumors.includes(tumor)) return null;
    if (!labConfig.inHouseClones.includes(info.alternative)) return null;
    return { originalClone: name, alternativeClone: info.alternative, concordance: info.concordance };
}

const API = { labConfig, METHOD_LABELS, cloneInterchangeability, clinicalDatabase,
              LAST_VERIFIED_ISO, LAST_VERIFIED_IT, SCORE_METHODS,
              maxForMethod, isValidScoreValue,
              getCloneName, getCloneAvailability, getOptionalScoreMethod, checkInterchangeability };
if (typeof globalThis !== 'undefined') Object.assign(globalThis, API);
if (typeof module !== 'undefined' && module.exports) module.exports = API;
