# PD-L1 AP Tool v3.3

[![Status](https://img.shields.io/badge/Uso-Supporto_operativo_interno-blue)](#disclaimer)
[![Updated](https://img.shields.io/badge/Aggiornato-Dicembre_2025-green)](#changelog)
[![HTML5](https://img.shields.io/badge/HTML-5-orange)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Dipendenze](https://img.shields.io/badge/Dipendenze_esterne-nessuna-brightgreen)](#specifiche-tecniche)

Tool HTML/JS single-file per la valutazione IHC di PD-L1 in Anatomia Patologica. Gestisce selezione clone, metodo di scoring, confronto cutoff e generazione referto strutturato in tre sezioni distinte.

---

## ⚠️ Disclaimer

**Questo tool è uno strumento di supporto operativo interno. Non sostituisce il giudizio clinico-patologico professionale.**

In particolare non sostituisce:
- Le linee guida ufficiali aggiornate (NCCN, ESMO, AIOM)
- Le determine AIFA per la rimborsabilità
- La valutazione multidisciplinare paziente-specifica
- La verifica diretta di criteri clinici, molecolari e regolatori della singola indicazione

I campi di contesto clinico mostrati sono indicativi e **non esaustivi**. Verificare sempre le fonti ufficiali prima di qualsiasi decisione diagnostica o terapeutica.

**I cutoff e le approvazioni regolatorie variano tra FDA, EMA e AIFA e cambiano nel tempo. Il database ha una data di congelamento (Dicembre 2025) e invecchia.**

---

## Configurazione laboratorio

Preconfigurato per **ASST Fatebenefratelli-Sacco — Anatomia Patologica**.

### Cloni in-house (Ventana)

| Clone | Companion diagnostic | Note |
|-------|---------------------|------|
| **SP142** | Atezolizumab | Scoring TC/IC separati |
| **SP263** | Durvalumab, Avelumab | Alternativa operativa per 22C3/28-8 |

### Cloni service esterno (Dako)

| Clone | Companion diagnostic |
|-------|---------------------|
| **22C3** | Pembrolizumab |
| **28-8** | Nivolumab |
| **73-10** | Avelumab |

### Intercambiabilità cloni

Basata sui **Blueprint PD-L1 IHC Comparison Studies**:
- Hirsch FR et al. *J Thorac Oncol.* 2017;12(2):208–222
- Tsao MS et al. *J Thorac Oncol.* 2018;13(9):1302–1311

| Clone richiesto | Alternativa in-house | Concordanza analitica | Tumori validati |
|----------------|---------------------|----------------------|-----------------|
| 22C3 (Dako) | SP263 (Ventana) | >90% | NSCLC, HNSCC, uroteliale, gastrico, TNBC, cervicale, esofageo sq. |
| 28-8 (Dako) | SP263 (Ventana) | >90% | NSCLC, HNSCC, uroteliale, melanoma |

> **Nota critica.** Concordanza analitica >90% non equivale a intercambiabilità regolatoria formale, né a equivalenza clinico-decisionale in ogni contesto. La variabilità è potenzialmente rilevante vicino ai valori di cutoff. L'utilizzo di clone alternativo va documentato nel referto (sezione B).

SP142 **non è intercambiabile** (concordanza 73–76%, kappa 0.39–0.55; sensibilità TC −16% rispetto ad altri cloni).

### Personalizzazione

```javascript
const labConfig = {
    inHouseClones: ['SP142', 'SP263'],
    serviceClones: ['22C3', '28-8', '73-10'],
    labName: 'Nome laboratorio'
};
```

---

## Database clinico v3.3

### Tumori e farmaci coperti (16 tumori, 50+ indicazioni)

| Tumore | Farmaci |
|--------|---------|
| NSCLC | Pembrolizumab, Nivolumab, Atezolizumab, Durvalumab, Cemiplimab |
| Melanoma | Pembrolizumab, Nivolumab |
| HNSCC | Pembrolizumab, Nivolumab |
| Carcinoma uroteliale | Pembrolizumab, Nivolumab, Atezolizumab, Avelumab, Durvalumab |
| Carcinoma gastrico/GEJ | Pembrolizumab, Nivolumab, Durvalumab |
| Carcinoma esofageo squamoso | Pembrolizumab, Nivolumab |
| TNBC | Pembrolizumab, Atezolizumab |
| RCC | Pembrolizumab, Nivolumab |
| Carcinoma cervicale | Pembrolizumab |
| Carcinoma endometriale | Pembrolizumab, Dostarlimab |
| HCC | Atezolizumab, Nivolumab, Pembrolizumab |
| Mesotelioma pleurico | Nivolumab, Pembrolizumab |
| cSCC | Cemiplimab, Pembrolizumab |
| BCC | Cemiplimab |
| BTC (vie biliari) | Pembrolizumab, Durvalumab |
| CRC | Pembrolizumab, Nivolumab |

### Struttura dei dati per indicazione

Ogni indicazione contiene campi separati per tipo di informazione:

| Campo | Contenuto | Invecchiamento |
|-------|-----------|----------------|
| `notes` | Evidenza trial (popolazione, endpoint, cutoff) | Lento |
| `regulatoryNote` | Stato approvativo FDA/EMA/AIFA con date | **Rapido** — verificare |
| `guidelineNote` | Indicazioni ESMO/NCCN | Medio |
| `clinicalContext` | Prerequisiti clinici/molecolari verificabili | Stabile |
| `trial` | Trial pivotale di riferimento | Stabile |

---

## Metodi di scoring

### TPS — Tumor Proportion Score
```
TPS = (Cellule tumorali PD-L1+) / (Totale cellule tumorali) × 100
```
Range 0–100%. Cloni: 22C3, 28-8, SP263.

### CPS — Combined Positive Score
```
CPS = (N° TC PD-L1+ + N° IC PD-L1+) / (N° totale TC) × 100
```
Numero assoluto; teoricamente >100, convenzionalmente cappato a 100. Richiede almeno 100 TC vitali valutate. Clone: 22C3.

### IC — Immune Cell score
```
IC = % area tumorale occupata da cellule immunitarie PD-L1+
```
Clone: SP142 (Ventana, in-house). Indicazioni: atezolizumab uroteliale seconda linea (IC ≥5%), atezolizumab TNBC prima linea (IC ≥1%). **Valutato solo IC; TC non considerato.**

### TC/IC separati
TC e IC inseriti come valori distinti. Eleggibilità: TC ≥soglia **oppure** IC ≥soglia. Clone: SP142. Il cutoff personalizzato non è applicabile (cutoff TC e IC sono distinti e trial-specifici).

---

## Workflow

### 1. Selezione indicazione
Tumore → Farmaco → Linea di trattamento. Ogni step filtra le opzioni successive.

### 2. Verifica clone
Il tool classifica automaticamente:
- **In-house** → procedere
- **Alternativa in-house** → warning con concordanza e limiti; scelta esplicita richiesta
- **Service esterno obbligatorio** → nessuna alternativa validata disponibile

### 3. Contesto clinico (quando presente)
Per alcune indicazioni vengono mostrati prerequisiti da verificare prima di procedere. I campi contrassegnati come **obbligatori** bloccano la generazione del referto se non spuntati. I campi opzionali sono informativi.

Indicazioni con `clinicalContext` attualmente configurato:
- NSCLC prima linea monoterapia/nivolumab+ipi → negatività EGFR/ALK/ROS1
- Uroteliale cisplatino-unfit → criteri di ineleggibilità documentati
- Gastrico → status HER2 (per tutte le linee pembrolizumab e nivolumab prima linea)
- Endometrio + CRC dMMR → conferma dMMR/MSI-H

> Per tutte le indicazioni prive di `clinicalContext` esplicito, la sezione C del referto riporta una nota standard che ricorda i parametri clinici da verificare manualmente.

### 4. Inserimento score
- **TPS/CPS**: range 0–100; opzione cutoff personalizzato disponibile (con tracciabilità nel referto)
- **IC only**: range 0–100; cutoff fisso (assay-specifico, non modificabile)
- **TC/IC**: due campi distinti; cutoff fissi; sufficiente uno dei due

### 5. Generazione referto

Il referto è diviso in tre blocchi separati e copiabili indipendentemente:

| Blocco | Contenuto | Destinazione |
|--------|-----------|--------------|
| **A — Referto Clinico** | Clone, metodo, risultato, cutoff, interpretazione tecnica, nota competenza oncologo | Cartella clinica / LIS |
| **B — Nota Tecnica Clone** | Solo se clone alternativo: companion diagnostic originario, concordanza, limiti, riferimenti Blueprint | Documentazione interna |
| **C — Note Clinico-Regolatorie** | Trial, evidenza, stato regolatorio, note guideline, contesto clinico verificato | Uso interno |

**Linguaggio di output deliberato.** Il referto usa "risultato superiore/inferiore al cutoff" e non "paziente eleggibile/non eleggibile". L'eleggibilità terapeutica dipende da fattori che esulano dalla IHC.

---

## Note regolatorie critiche

| Indicazione | FDA | EMA/AIFA | Note |
|-------------|-----|----------|------|
| Atezolizumab TNBC 1L | **Ritirato** Aug 2021 | Attivo | IMpassion131 OS negativo |
| Pembrolizumab HNSCC periop | Approvato Jun 2025 | In valutazione | KEYNOTE-689 |
| Pembrolizumab gastrico HER2+ 1L | Approvato Mar 2025 | In aggiornamento | KEYNOTE-811, PD-L1 agnostico |
| Durvalumab uroteliale neoadiuvante | Approvato Apr 2025 | In valutazione | NIAGARA |

---

## Specifiche tecniche

- **Formato**: single HTML file, zero dipendenze esterne
- **Dimensione**: ~85 KB
- **JavaScript**: ES6, no framework
- **Storage**: nessuno (nessun dato salvato localmente o trasmesso)
- **Browser**: Chrome/Chromium 90+, Firefox 88+, Safari 14+, Edge 90+
- **Offline**: funzionante senza rete
- **Stampa**: CSS media query dedicata; i pannelli di input non vengono stampati

---

## Struttura database — come aggiornare

Il database clinico è un oggetto JS (`clinicalDatabase`) nella sezione `<script>`. Ogni aggiornamento regolatorio va fatto **solo nei campi appropriati**:

```javascript
// Esempio: aggiornare stato EMA dopo approvazione
'perioperative': {
    name: 'Perioperatorio (neoadiuvante + adiuvante)',
    method: 'CPS', cutoff: 1,
    notes: 'Stadio III/IVA resecabile, CPS >=1',       // non toccare
    trial: 'KEYNOTE-689',                               // non toccare
    regulatoryNote: 'FDA Jun 2025; EMA approvato ...',  // aggiornare qui
    guidelineNote: '...'                                // aggiornare qui se ESMO/NCCN si esprime
}
```

Per aggiungere un'indicazione nuova, copiare la struttura di un'esistente e compilare tutti i campi. Aggiungere `clinicalContext` se l'indicazione ha prerequisiti molecolari obbligatori (dMMR, HER2, driver alterations).

---

## Changelog

### v3.3 (Dicembre 2025)
- `NCCN Cat.1` spostato da `regulatoryNote` a `guidelineNote` (classificazione semantica corretta)
- Guard `navigator.clipboard && navigator.clipboard.writeText` in entrambe le funzioni di copia
- Sezione A referto: distinzione esplicita "clone di riferimento (trial)" vs "clone utilizzato" quando viene usata alternativa in-house
- Nota standard in sezione C per indicazioni prive di `clinicalContext` (elenco parametri clinici da verificare manualmente)
- Disclaimer finale: "Supporto operativo interno; non sostituisce il giudizio clinico-patologico professionale"

### v3.2 (Dicembre 2025)
- `icOnly` rimosso dal database; unico marker: `method: 'IC'`
- `dmmrRequired` rimosso come flag; gestito esclusivamente via `clinicalContext` obbligatorio (comportamento uniforme con HER2/EGFR)
- `interpretationMode: 'cutoff' | 'agnostic'` — il caso agnostico non inquina più `isAboveCutoff`; banner viola distinto
- Custom cutoff disabilitato anche per `method === 'IC'` (cutoff assay-specifico)
- Note database ristrutturate in tre campi separati: `notes`, `regulatoryNote`, `guidelineNote`
- Nota standard in sezione C per `clinicalContext` assente
- Disclaimer generale sempre visibile

### v3.1 (Dicembre 2025)
- `appState` object centralizzato (sostituisce `window.current*`)
- `getCloneAvailability()` sostituisce `getCloneType()` (semantica corretta: disponibilità ≠ piattaforma)
- `copyReferto(event)` → `copySection(btn, key)` + fallback `execCommand` con gestione errore
- Referto diviso in blocchi A/B/C con copy button indipendenti
- Linguaggio referto: "superiore/inferiore al cutoff" invece di "eleggibile/non eleggibile"
- Badge "Solo IC" distinto da "TC/IC separati"
- Custom cutoff nascosto e disabilitato per indicazioni TC/IC
- `hideDownstream()` null-safe; `resetAll()` null-safe
- Disclaimer clone alternativo rinforzato
- `clinicalContext` condizionale con blocco su campi obbligatori
- `escapeHtml()` nel rendering referto
- "PDL-1" → "PD-L1" uniformato

### v3.0 (Novembre 2025)
- Release semplificata per uso AP interno
- Database clinico consolidato (16 tumori, 50+ indicazioni)
- Gestione in-house/service/intercambiabilità automatica
- Generazione referto

---

## Riferimenti

**Blueprint Studies**
- Hirsch FR, et al. PD-L1 Immunohistochemistry Assays for Lung Cancer: Results from Phase 1 of the Blueprint PD-L1 IHC Assay Comparison Project. *J Thorac Oncol.* 2017;12(2):208–222.
- Tsao MS, et al. PD-L1 Immunohistochemistry Comparability Study in Real-Life Clinical Samples: Results of Blueprint Phase 2 Project. *J Thorac Oncol.* 2018;13(9):1302–1311.

**Linee guida**
- [NCCN Clinical Practice Guidelines in Oncology](https://www.nccn.org/guidelines)
- [ESMO Clinical Practice Guidelines](https://www.esmo.org/guidelines)
- [AIOM Linee Guida](https://www.aiom.it/linee-guida/)
- [AIFA Determine](https://www.aifa.gov.it/)

---

## Licenza

MIT — uso interno, nessuna garanzia clinica.

---

*ASST Fatebenefratelli-Sacco — Anatomia Patologica. Ultimo aggiornamento: Dicembre 2025.*
