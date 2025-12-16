# PDL-1 Clinical Evaluator v2.3

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML-5-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](https://www.ecma-international.org/ecma-262/)
[![Status](https://img.shields.io/badge/Status-Educational-blue.svg)](#disclaimer)
[![Updated](https://img.shields.io/badge/Updated-November%202025-green.svg)](#changelog)

Tool interattivo per la valutazione dell'espressione PDL-1 e la selezione delle indicazioni immunoterapiche in oncologia, con gestione automatica dei cloni disponibili in-house vs service esterno.

---

## ⚠️ DISCLAIMER IMPORTANTE

**QUESTO TOOL È ESCLUSIVAMENTE EDUCATIVO E NON SOSTITUISCE:**

- ❌ Le linee guida ufficiali (NCCN, ESMO, AIOM)
- ❌ Il giudizio clinico professionale
- ❌ Le determine AIFA per la rimborsabilità in Italia
- ❌ La valutazione multidisciplinare paziente-specifica
- ❌ La revisione di esperti patologi e oncologi

**Le indicazioni terapeutiche e i cutoff PDL-1 variano significativamente tra FDA, EMA e AIFA.**

**🔴 VERIFICARE SEMPRE LE FONTI UFFICIALI AGGIORNATE PRIMA DI QUALSIASI DECISIONE CLINICA.**

---

## 🆕 Changelog v2.3 (Novembre 2025)

### Nuove funzionalità

| Feature | Descrizione |
|---------|-------------|
| **Salvataggio automatico** | I dati vengono salvati ogni 30 secondi in localStorage |
| **Recupero sessione** | Banner per ripristinare i dati dopo refresh accidentale |
| **Casi demo per formazione** | 6 esempi precompilati per training (NSCLC, HNSCC, gastrico, TNBC, endometrio) |
| **Validazione input** | Controllo automatico che i valori percentuali siano tra 0 e 100 |
| **Gestione errori** | Try-catch su tutte le funzioni principali - il tool non si blocca |
| **Localizzazione italiana** | Tutte le stringhe tradotte in italiano |
| **Generazione email richiesta** | Bottone per generare email precompilata da inviare ad AP |
| **Gestione cloni in-house/service** | Warning automatico per cloni Dako non disponibili in laboratorio |
| **Intercambiabilità cloni** | Suggerimento automatico di clone alternativo Ventana quando concordanza >90% |
| **Workflow Oncologia → AP** | Sezioni separate per compilazione oncologi e anatomia patologica |
| **Input TC/IC separati** | Campi distinti per TC% e IC% quando richiesto SP142 |

### Bug fix

| Bug | Correzione |
|-----|------------|
| Cemiplimab clone | Ora correttamente indicato come "Non richiesto" (nessun companion diagnostic FDA) |
| Dostarlimab dMMR | Check obbligatorio dMMR/MSI-H con messaggio bloccante |
| HER2 gastrico | Validazione stringente con errore se mismatch indicazione/status |
| TC/IC approssimato | Rimossa logica approssimata, ora input separati precisi |

---

## 🏥 Configurazione Laboratorio

Il tool è preconfigurato per i cloni disponibili presso **ASST Fatebenefratelli-Sacco**:

### Cloni IN-HOUSE (Ventana)
- ✅ **SP142** - Companion diagnostic atezolizumab
- ✅ **SP263** - Companion diagnostic durvalumab

### Cloni SERVICE ESTERNO (Dako)
- ⚡ **22C3** - Companion diagnostic pembrolizumab
- ⚡ **28-8** - Companion diagnostic nivolumab  
- ⚡ **73-10** - Companion diagnostic avelumab

### Personalizzazione

Per modificare la configurazione, editare l'oggetto `labConfig` all'inizio dello script:

```javascript
const labConfig = {
    inHouseClones: ['SP142', 'SP263'], // Cloni disponibili
    serviceClones: ['22C3', '28-8', '73-10'], // Cloni da inviare fuori
    labName: 'Nome del tuo laboratorio'
};
```

### Configurazione Email

Il tool è configurato per la webmail ASST Fatebenefratelli-Sacco:

| Parametro | Valore |
|-----------|--------|
| **Webmail URL** | https://posta.asst-fbf-sacco.it/static/login/ |
| **Email AP** | anatomia.patologica.fbf@asst-fbf-sacco.it |

Per modificare, cercare nel codice:
- `openWebmail()` → cambiare URL webmail
- `emailTo` → cambiare indirizzo destinatario

---

## 🔄 Intercambiabilità Cloni

Basata sui **Blueprint PD-L1 IHC Comparison Studies** (Hirsch 2017, Tsao 2018).

### Cloni intercambiabili (concordanza >90%)

| Clone richiesto | Alternativa | Concordanza | Tumori validati |
|-----------------|-------------|-------------|-----------------|
| **22C3** (Dako) | SP263 (Ventana) | >90% | NSCLC, HNSCC, uroteliale, gastrico, esofageo, cervicale |
| **28-8** (Dako) | SP263 (Ventana) | >90% | NSCLC, HNSCC, uroteliale, melanoma |

### Cloni NON intercambiabili

| Clone | Motivo |
|-------|--------|
| **SP142** | Concordanza 73-76% (kappa 0.39-0.55). Sensibilità TC -16% vs altri cloni. |
| **73-10** | Dati di concordanza insufficienti |

### Comportamento del tool

Quando l'oncologo seleziona un farmaco che richiede clone Dako:

1. **Se intercambiabile** → Warning giallo con alternativa SP263 e concordanza
2. **Se NON intercambiabile** → Warning rosso "SERVICE ESTERNO obbligatorio"

---

## 👥 Workflow Operativo

### Step 1: Compilazione Oncologia

L'oncologo compila:
- 🎯 **Tipo di tumore** (16 opzioni)
- 💊 **Farmaco immunoterapico** (filtrato per tumore)
- 📊 **Linea di trattamento** (filtrata per farmaco)
- 🧬 **Alterazioni molecolari** (se applicabile: EGFR, ALK, ROS1, BRAF, HER2, MSI)

**Dati paziente:**
- Cognome e Nome
- Data di nascita
- Nosologico / ID
- N. preparato istologico
- Sede prelievo

**Dati richiedente:**
- Medico richiedente
- U.O.
- Telefono / Email

### Step 2: Generazione Email per AP

Cliccando **"📧 GENERA RICHIESTA EMAIL PER AP"**, il sistema genera una email precompilata con:

- **Destinatario:** anatomia.patologica.fbf@asst-fbf-sacco.it
- **Oggetto:** Richiesta PDL-1 - [Farmaco] - [Tumore]
- **Corpo:**
  - Dati clinici (tumore, farmaco, linea, trial)
  - Requisiti tecnici (clone, metodo, cutoff)
  - Status clone (in-house / intercambiabile / service)
  - Campi da compilare (dati paziente, richiedente)

**Bottoni disponibili:**
- 🌐 **Apri Webmail ASST** - Apre la webmail aziendale (https://posta.asst-fbf-sacco.it)
- 📋 **Copia corpo** - Copia il corpo dell'email negli appunti
- 📝 **Copia oggetto** - Copia solo l'oggetto negli appunti
- 📋 **Copia** (accanto al destinatario) - Copia l'indirizzo email AP

**Istruzioni per l'oncologo:**
1. Compila tutti i campi (tumore, farmaco, linea, dati paziente, dati richiedente)
2. Clicca "📧 GENERA RICHIESTA EMAIL PER AP"
3. Clicca "Apri Webmail ASST" (si apre in nuova tab)
4. Effettua login alla webmail
5. Crea nuovo messaggio
6. Copia e incolla: destinatario, oggetto e corpo (usando i bottoni)
7. Verifica i dati e invia

### Step 3: Verifica Clone (automatica)

L'email include automaticamente lo status del clone:

| Scenario | Testo nell'email |
|----------|------------------|
| Clone Ventana | ✓ CLONE IN-HOUSE: SP263 disponibile |
| Clone Dako intercambiabile | ⚠️ CLONE INTERCAMBIABILE: 22C3 non disponibile, utilizzare SP263 (concordanza >90%) |
| Clone Dako non intercambiabile | ⚡ SERVICE ESTERNO RICHIESTO: 73-10 non disponibile, nessuna alternativa |
| PDL-1 non richiesto | ✓ PDL-1 NON RICHIESTO per questa indicazione |

### Step 4: Compilazione Anatomia Patologica

Se il clone è disponibile (in-house o intercambiabile), l'AP compila:
- 📈 **Score PDL-1** (TPS%, CPS%, o TC%/IC% separati)

### Step 5: Valutazione e Referto

- 🧪 **VALUTA INDICAZIONE** → Verifica eleggibilità vs cutoff
- 📄 **GENERA REFERTO** → Documento stampabile con tutte le note

---

## 📚 Casi Demo per Formazione

Il tool include 6 casi precompilati per la formazione del personale:

| Caso | Tumore | Farmaco | Caratteristiche |
|------|--------|---------|-----------------|
| **NSCLC TPS≥50%** | NSCLC | Pembrolizumab mono | Score TPS 65%, clone 22C3 |
| **NSCLC TC/IC** | NSCLC | Atezolizumab 2ª linea | Score TC/IC separati, clone SP142 |
| **HNSCC CPS** | HNSCC | Pembrolizumab 1ª linea | Score CPS 35%, cutoff ≥20 |
| **Gastrico HER2+** | Gastrico | Pembrolizumab + trastuzumab | KEYNOTE-811, checkbox HER2 |
| **TNBC warning FDA** | TNBC | Atezolizumab | Warning ritiro FDA, attivo EMA |
| **Endometrio dMMR** | Endometrio | Dostarlimab | Checkbox dMMR obbligatorio |

**Come usare:**
1. Clicca sul caso demo desiderato
2. I campi vengono precompilati automaticamente
3. Prova a generare email e referto
4. Usa "🗑️ Pulisci tutto" per ricominciare

---

## 💾 Salvataggio Automatico e Recovery

### Funzionamento
- I dati vengono salvati automaticamente ogni **30 secondi**
- In caso di refresh accidentale, appare un banner per ripristinare la sessione
- I dati vengono conservati per **24 ore**

### Privacy
- Tutti i dati sono salvati **localmente nel browser** (localStorage)
- Nessun dato viene inviato a server esterni
- Per cancellare i dati salvati, clicca "🗑️ Pulisci tutto"

---

## 📊 Database Clinico v2.3

### Tumori supportati (16)

| Tumore | Farmaci disponibili |
|--------|---------------------|
| NSCLC | Pembrolizumab, Nivolumab, Atezolizumab, Durvalumab, Cemiplimab |
| Melanoma | Pembrolizumab, Nivolumab |
| HNSCC | Pembrolizumab, Nivolumab |
| Uroteliale | Pembrolizumab, Nivolumab, Atezolizumab, Avelumab |
| Gastrico/GEJ | Pembrolizumab, Nivolumab |
| Esofageo squamoso | Pembrolizumab, Nivolumab |
| TNBC | Pembrolizumab, Atezolizumab |
| RCC | Pembrolizumab, Nivolumab |
| Cervicale | Pembrolizumab |
| Endometriale | Pembrolizumab, Dostarlimab |
| HCC | Atezolizumab, Pembrolizumab, Nivolumab |
| Mesotelioma | Nivolumab, Pembrolizumab |
| cSCC | Cemiplimab, Pembrolizumab |
| BCC | Cemiplimab |
| BTC (vie biliari) | Pembrolizumab, Durvalumab |
| MIBC | Pembrolizumab, Nivolumab |

### Indicazioni totali: 50+

---

## 🔬 Metodi di Scoring

### TPS (Tumor Proportion Score)
```
TPS = (Cellule tumorali PDL-1+) / (Totale cellule tumorali) × 100
```
- **Range:** 0-100%
- **Cutoff comuni:** 1%, 10%, 50%
- **Cloni:** 22C3, 28-8, SP263

### CPS (Combined Positive Score)
```
CPS = (TC PDL-1+ + IC PDL-1+) / (Totale cellule tumorali) × 100
```
- **Range:** 0-100+ (può superare 100)
- **Cutoff comuni:** 1%, 5%, 10%, 20%
- **Clone:** 22C3

### TC/IC (Tumor Cell/Immune Cell)
```
TC Score: % cellule tumorali PDL-1+ su membrana
IC Score: % area tumorale occupata da IC PDL-1+
```
- **Categorie:** TC0/IC0, TC1/IC1, TC2/IC2, TC3/IC3
- **Clone:** SP142 (esclusivo per atezolizumab)
- **Input:** Campi separati per TC% e IC%

---

## ⚠️ Note Regolatorie Critiche

### Discordanze FDA/EMA/AIFA

| Indicazione | FDA | EMA | Note |
|-------------|-----|-----|------|
| Atezolizumab TNBC | **RITIRATO** (Aug 2021) | Attivo | IMpassion131 fallito OS |
| Pembrolizumab HNSCC periop | Approvato Jun 2025 | In valutazione | KEYNOTE-689 |

### Validazione LDT

Quando si utilizza un clone alternativo (es. SP263 invece di 22C3):
- ✅ Concordanza >90% documentata in letteratura
- ⚠️ **Richiede validazione locale come LDT**
- 📋 Documentare nel referto il clone effettivamente utilizzato

---

## 🧬 Requisiti Biomarker Obbligatori

### NSCLC - Alterazioni molecolari
Prima dell'immunoterapia in prima linea, verificare:
- EGFR mutazioni
- ALK riarrangiamento
- ROS1 riarrangiamento
- BRAF V600E

### Gastrico - Status HER2
- **HER2-positivo:** KEYNOTE-811 (pemb + trastuzumab + chemio)
- **HER2-negativo:** KEYNOTE-859, CheckMate-649

### Endometrio - Status dMMR/MSI-H
- **Dostarlimab:** OBBLIGATORIO dMMR/MSI-H confermato
- **Pembrolizumab + lenvatinib:** OBBLIGATORIO dMMR/MSI-H confermato

---

## 📚 Trial Pivotali Principali

### NSCLC
- KEYNOTE-024, -042, -189, -407, -671, -091
- CheckMate-057, -227, -816
- IMpower150, -010
- PACIFIC, AEGEAN

### HNSCC
- KEYNOTE-048, -040, -689
- CheckMate-141

### Uroteliale
- KEYNOTE-052, -045, -A39/EV-302, -905/EV-303
- CheckMate-274, -275
- IMvigor211
- JAVELIN Bladder 100

### Gastrico
- KEYNOTE-811, -859, -061
- CheckMate-649

### Vie Biliari
- KEYNOTE-966
- TOPAZ-1

---

## 🔧 Specifiche Tecniche

### Browser Supportati
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Requisiti
- JavaScript abilitato
- Nessuna dipendenza esterna (self-contained HTML)
- Funziona offline

### Dimensione File
- HTML: ~85 KB
- Zero librerie CDN

---

## 📖 Riferimenti Bibliografici

### Blueprint Studies (Concordanza cloni)
- Hirsch FR, et al. PD-L1 Immunohistochemistry Assays for Lung Cancer: Results from Phase 1 of the Blueprint PD-L1 IHC Assay Comparison Project. **J Thorac Oncol.** 2017;12(2):208-222.
- Tsao MS, et al. PD-L1 Immunohistochemistry Comparability Study in Real-Life Clinical Samples: Results of Blueprint Phase 2 Project. **J Thorac Oncol.** 2018;13(9):1302-1311.

### Linee Guida Ufficiali
- [NCCN Guidelines](https://www.nccn.org/guidelines)
- [ESMO Clinical Practice Guidelines](https://www.esmo.org/guidelines)
- [AIOM Linee Guida](https://www.aiom.it/)
- [AIFA Determine](https://www.aifa.gov.it/)

---

## 📝 Licenza

MIT License - Uso educativo

---

## 🎯 Storico Versioni

### v2.3 (Novembre 2025)
- ✨ Salvataggio automatico ogni 30 secondi
- ✨ Recovery sessione dopo refresh
- ✨ 6 casi demo per formazione
- ✨ Validazione input 0-100%
- ✨ Try-catch per gestione errori
- ✨ Localizzazione italiana completa

### v2.2 (Novembre 2025)
- ✨ Generazione email per webmail ASST
- ✨ Campi anagrafici paziente e richiedente
- ✨ Gestione cloni in-house vs service
- ✨ Intercambiabilità automatica con concordanza
- ✨ Workflow separato Oncologia/AP
- ✨ Input TC/IC separati
- 🐛 Fix cemiplimab, dostarlimab, HER2

### v2.1 (Novembre 2025)
- Aggiunte indicazioni BTC, MIBC, perioperatorio
- Warning regolatorio TNBC atezolizumab
- Badge regolatori FDA/EMA

### v2.0 (Novembre 2025)
- Debug console migliorata
- Layout referto professionale

### v1.0 (2024)
- Release iniziale

---

## 👤 Autore

Tool sviluppato per **ASST Fatebenefratelli-Sacco** - Anatomia Patologica

**Disclaimer:** Questo tool non sostituisce il giudizio clinico professionale.

---

**Ultimo aggiornamento:** Novembre 2025

**Status:** Educational - For clinical support purposes only
