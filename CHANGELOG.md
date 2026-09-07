# Changelog — PD-L1 AP Tool

Le note delle versioni precedenti alla 3.5.0 stanno in `CHANGELOG_v3.4.7.md` e `BUGFIX_v2.4.md`.

## v3.6.0 (7 settembre 2026) — revisione delle indicazioni su SmPC EMA; nuovo metodo TAP

Verifica puntuale su SmPC/EPAR EMA di **Keytruda, Opdivo, Tecentriq, Imfinzi, Libtayo, Tevimbra, Cejemly, Jemperli, Bavencio**.
La v3.5.0 (verifica 27/08/2026) era corretta su tutto quello che conteneva — inclusi ovaio (KEYNOTE-B96, CPS≥1) e
SCLC (IMforte), approvati nel 2026. Gli scostamenti trovati sono **omissioni** e **due voci che non sono indicazioni EMA**.

### Rimosse: non sono indicazioni EMA
| voce | perché |
|---|---|
| esofago squamoso · pembrolizumab · 2ª linea · CPS≥10 (KEYNOTE-181) | La SmPC Keytruda prevede per l'esofago **solo** la prima linea in combinazione (CPS≥10). FDA ha ritirato la 2ª linea nel 2023. |
| cervice · pembrolizumab · 2ª linea · CPS≥1 (KEYNOTE-158) | La SmPC Keytruda ha per la cervice **solo** la 1ª linea in combinazione con chemio ± bevacizumab (CPS≥1). La monoterapia dopo platino è indicazione FDA. |

La seconda linea della cervice esiste, ma con un altro farmaco: **cemiplimab**, e **non richiede PD-L1**. È stata aggiunta.

### Aggiunte: indicazioni con soglia che mancavano
| tumore | farmaco | indicazione | soglia | studio |
|---|---|---|---|---|
| NSCLC | pembrolizumab | monoterapia dopo ≥1 chemioterapia | **TPS ≥1%** | KEYNOTE-010 |
| NSCLC | nivolumab | perioperatorio (neoadiuvante + adiuvante) | **TC ≥1%** | CheckMate-77T |
| NSCLC | sugemalimab | stadio III non resecabile, post-chemioradioterapia | **TC ≥1%** | GEMSTONE-301 |
| NSCLC | tislelizumab | 1ª linea non squamoso + pemetrexed/platino | **TC ≥50%** | RATIONALE-304 |
| gastrico/GEJ | tislelizumab | 1ª linea HER2-neg + platino/fluoropirimidina | **TAP ≥5%** | RATIONALE-305 |
| esofago squamoso | tislelizumab | 1ª linea + platino | **TAP ≥5%** | RATIONALE-306 |

Due osservazioni che valgono più delle righe di tabella:

- **KEYNOTE-010 era il buco più grosso.** È l'unica indicazione NSCLC di pembrolizumab con soglia all'**1%**: un tool
  che elenca solo la prima linea induce ad applicare il 50% a una richiesta di seconda linea.
- **Tislelizumab non squamoso è una combinazione con soglia alta.** Tutte le altre combinazioni con chemioterapia sono
  PD-L1 agnostiche; questa richiede TC ≥50%. È esattamente il tipo di eccezione che si sbaglia a memoria.

### Nuovo metodo di score: TAP
Il **TAP** (tumour area positivity) è la percentuale di **area tumorale** occupata da cellule tumorali *e* immunitarie
PD-L1 positive, stimata visivamente. Il CPS si ottiene **contando le cellule** ed è un numero puro. **Non sono convertibili**:
la concordanza pubblicata è buona (ICC ≈ 0,81; concordanza 82% alla soglia del 5%) ma non è equivalenza, e vicino al cutoff
le due misure divergono. Il tool ora disegna un campo TAP dedicato, con la formula e la differenza dal CPS scritte accanto.

Sull'assay: la SmPC Tevimbra **non nomina un clone** e chiede genericamente «un IVD marcato CE con la destinazione d'uso
corrispondente». Il TAP è stato sviluppato negli studi RATIONALE con **VENTANA PD-L1 (SP263)** — che è in-house. Il tool lo
dice, e avverte che la validazione interna deve coprire esplicitamente la lettura in area, che non è la procedura del TPS.

Nell'esofago squamoso convivono ora **tre metodi diversi**: CPS ≥10 (pembrolizumab), TC ≥1% (nivolumab+ipilimumab),
TAP ≥5% (tislelizumab). Il metodo dipende dal farmaco richiesto, non dal tumore.

### Aggiunte: indicazioni agnostiche
Servono a far dire al tool «questo esame non serve» quando viene richiesto lo stesso.
Atezolizumab NSCLC non eleggibili al platino (IPSOS) e induzione ES-SCLC (IMpower133); durvalumab NSCLC perioperatorio
(AEGEAN) e 1ª linea + tremelimumab (POSEIDON), SCLC stadio esteso (CASPIAN) e limitato (ADRIATIC), HCC (HIMALAYA);
sugemalimab 1ª linea metastatico; tislelizumab (perioperatorio, squamoso, 2ª linea, ES-SCLC, esofago 2ª linea);
cemiplimab cSCC adiuvante (C-POST) e cervice (EMPOWER-Cervical 1). Nuovo tumore: **carcinoma rinofaringeo**.

### Difetti di codice
1. **Il CPS non poteva superare 100.** La formula in pagina diceva «il CPS è un numero (non %), può superare 100» e
   l'input aveva `max="100"` e la validazione rifiutava i valori sopra 100. Un CPS di 120 in un gastrico non era inseribile.
   Il massimo ora dipende dal metodo: percentuali 0–100, CPS fino a 400.
2. **`optionalScoreMethod: 'TPS'` su un'indicazione TC/IC** (atezolizumab IMpower110): configurazione morta — il campo
   opzionale viene offerto solo nelle indicazioni agnostiche. Rimossa.
3. **La data di ultima verifica era riscritta a mano in cinque punti** (banner di obsolescenza, referto, intestazione del
   database, log). Ora è un'unica costante in `engine.js`; un test verifica che non ricompaia a mano fuori dal log versioni.
4. **Note assenti su due voci gastriche** (`'CPS >=1'`, `'CPS >=5'`): sostituite con la formulazione della SmPC. La
   seconda linea gastrica di pembrolizumab risale alla verifica di aprile e resta marcata come da ricontrollare.

### Infrastruttura
- Database e logica pura estratti in **`engine.js`** (nessun DOM).
- **`npm test`** → `tests/run.mjs`, **746 asserzioni**. Il database viene percorso riga per riga: ogni indicazione ha nome,
  note e studio; ogni metodo è fra quelli che l'interfaccia sa disegnare **e ha un ramo in `createScoreInputs`**;
  ogni metodo con soglia ha il proprio cutoff; nessuna indicazione con score ha clone «Non richiesto» (altrimenti la
  pagina mostra «PD-L1 non richiesto» e non disegna il campo); gli id del contesto clinico sono unici perché diventano id
  del DOM; i tumori citati in `cloneInterchangeability` esistono.

### Fonti
SmPC/EPAR EMA di Keytruda, Opdivo, Tecentriq, Imfinzi, Libtayo, Tevimbra, Cejemly, Jemperli (consultate il 07/09/2026);
CHMP meeting highlights 20–23 luglio 2026 (nessuna variazione PD-L1 rilevante; non si è tenuta riunione ad agosto);
per la concordanza TAP/CPS: *Concordance Between the PD-L1 Tumor Area Positivity Score and Combined Positive Score for
Gastric or Esophageal Cancers Treated With Tislelizumab*, Modern Pathology 2025.

### Aperto
Le voci **non toccate da questa revisione né da quelle di luglio e agosto risalgono alla verifica generale di aprile 2026**
e non sono state ricontrollate: melanoma, RCC, endometrio, mesotelioma, BCC, CRC, HCC (voci preesistenti), UC
(pembrolizumab e atezolizumab), TNBC, gastrico 2ª e 3ª linea. Il log versioni in pagina lo dichiara. Una verifica completa
del database richiede una passata dedicata su tutte le SmPC, non un patch.
