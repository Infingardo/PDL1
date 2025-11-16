# PDL-1 Clinical Evaluator v2.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML-5-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](https://www.ecma-international.org/ecma-262/)
[![Status](https://img.shields.io/badge/Status-Educational-blue.svg)](#disclaimer)

Tool interattivo educativo per la valutazione dell'espressione PDL-1 e la selezione delle indicazioni immunoterapiche in oncologia.

## ⚠️ DISCLAIMER IMPORTANTE

**QUESTO TOOL È ESCLUSIVAMENTE EDUCATIVO E NON SOSTITUISCE:**

- ❌ Le linee guida ufficiali (NCCN, ESMO, AIOM)
- ❌ Il giudizio clinico professionale
- ❌ Le determine AIFA per la rimborsabilità in Italia
- ❌ La valutazione multidisciplinare paziente-specifica
- ❌ La revisione di esperti patologi e oncologi

**Le indicazioni terapeutiche e i cutoff PDL-1 variano tra FDA, EMA e AIFA. Le approvazioni regolatorie cambiano frequentemente.**

**🔴 VERIFICARE SEMPRE LE FONTI UFFICIALI AGGIORNATE PRIMA DI QUALSIASI DECISIONE CLINICA.**

---

## 📋 Descrizione

PDL-1 Clinical Evaluator è uno strumento web-based che aiuta professionisti sanitari, studenti e ricercatori a comprendere le complesse relazioni tra:

- **Espressione PDL-1**: Cloni anticorpali, metodi di scoring, fattori pre-analitici
- **Farmaci immunoterapici**: Pembrolizumab, nivolumab, atezolizumab, durvalumab, avelumab, cemiplimab, dostarlimab
- **Indicazioni oncologiche**: 12+ tipi tumorali con indicazioni specifiche approvate
- **Cutoff validati**: Da trial pivotali (KEYNOTE, CheckMate, IMpower, PACIFIC, ecc.)

---

## ✨ Caratteristiche Principali

### 🔬 Database Clinico Completo

| Elemento | Dettagli |
|----------|----------|
| **Tumori** | 12+ tipi oncologici (NSCLC, melanoma, HNSCC, uroteliale, gastrico, esofageo, mammario, renale, cervicale, endometriale, HCC, mesotelioma, cSCC, BCC) |
| **Farmaci** | 7 immunoterapici con indicazioni approvate |
| **Combinazioni** | 25+ combinazioni farmaco-tumore-linea documentate |
| **Trial** | Database basato su trial pivotali peer-reviewed |

### 💉 Cloni Anticorpali e Metodi di Scoring

**Cloni supportati:**
- **22C3 (Dako)**: Pembrolizumab companion diagnostic
- **28-8 (Dako)**: Nivolumab companion diagnostic
- **SP263 (Ventana)**: Durvalumab companion diagnostic
- **SP142 (Ventana)**: Atezolizumab companion diagnostic
- Informazioni su concordanza inter-clone (>90% per 22C3/28-8/SP263, solo 76% per SP142)

**Metodi di scoring:**
- **TPS** (Tumor Proportion Score): % cellule tumorali positive
- **CPS** (Combined Positive Score): cellule tumorali + immunitarie positive
- **TC/IC** (Tumor Cell/Immune Cell): Score separati per cellule tumorali e immunitarie
- Note su significato clinico e interpretazione

### 🧬 Integrazione Biomarker

**NSCLC:**
- Check automatico alterazioni molecolari (EGFR, ALK, ROS1, BRAF)
- Warning per mutazioni driver in prima linea
- Raccomandazioni per timing della terapia target vs immunoterapia

**Carcinomi Endometriali:**
- Status MSI-H/dMMR detection
- Indicazioni specifiche per dostarlimab (PDL-1 agnostico)

### 📄 Refertazione Strutturata

- Generazione referto stampabile professionale
- Interpretazione clinica contestualizzata
- Cutoff e metodi scoring documentati
- Considerazioni cliniche e warning
- Disclaimer regulatory per decisioni cliniche

### 🔧 UX Migliorata

- Debug console nascosta di default (toggle con contatore)
- UI responsive e intuitiva
- Calcolo automatico campi dipendenti
- Validazione input in tempo reale
- Stampa ottimizzata

---

## 🚀 Come Utilizzare

### Opzione 1: Online (Consigliato)
1. Apri il file `pdl1_evaluator_v2.html` nel browser (Chrome, Firefox, Safari, Edge)
2. Non è richiesta installazione o connessione internet

### Opzione 2: Download Locale
```bash
# Clone il repository
git clone https://github.com/[your-username]/pdl1-evaluator.git
cd pdl1-evaluator

# Apri nel browser
open pdl1_evaluator_v2.html  # macOS
xdg-open pdl1_evaluator_v2.html  # Linux
start pdl1_evaluator_v2.html  # Windows
```

### Opzione 3: Hosting
Carica il file su GitHub Pages, Netlify, o qualsiasi web server:
```
https://yourdomain.com/pdl1_evaluator_v2.html
```

---

## 📖 Guida all'Uso

### Step 1: Selezionare il Tumore
Scegli il tipo oncologico dalla lista:
- NSCLC (Non-Small Cell Lung Cancer)
- Melanoma
- HNSCC (Head and Neck Squamous Cell Carcinoma)
- Carcinoma uroteliale
- E altri...

### Step 2: Scegliere il Farmaco
La lista si aggiorna automaticamente con i farmaci disponibili per il tumore selezionato:
- Pembrolizumab
- Nivolumab
- Atezolizumab
- Durvalumab
- Avelumab
- Cemiplimab
- Dostarlimab

### Step 3: Indicare la Linea Terapeutica
- Prima linea (monoterapia o combinata)
- Seconda linea
- Consolidamento
- Adiuvante
- ecc.

### Step 4: Rivedere Clone e Metodo
Il tool mostra automaticamente:
- Clone anticorpale consigliato
- Metodo di scoring (TPS, CPS, TC/IC)
- Note su fattori pre-analitici

### Step 5: Inserire Score PDL-1
Inserisci il valore percentuale (0-100) ottenuto dalla microscopia ottica o analisi digitale.

### Step 6: Valutare
Clicca **"VALUTA INDICAZIONE"** per ottenere:
- ✅ POSITIVO: Score soddisfa cutoff per indicazione
- ❌ NEGATIVO: Score non raggiunge cutoff
- ℹ️ INFO: Richiesta valutazione TC/IC manuale

### Step 7: Generare Referto
Clicca **"GENERA REFERTO"** per:
- Creare documento strutturato
- Visualizzare anteprima stampa
- Stampare o salvare come PDF

---

## 🔬 Informazioni Tecniche

### Cloni Anticorpali: Dettagli e Concordanza

#### 22C3, 28-8, SP263
- **Concordanza**: >90% per cellule tumorali
- **Intercambiabilità**: Potenzialmente sì per NSCLC, HNSCC, uroteliale
- **Uso**: Companion diagnostic validati FDA/EMA
- **Nota**: SP263 e 28-8 hanno sensibilità sovrapponibile per IC

#### SP142
- **Concordanza**: 76% con altri cloni (NON intercambiabile)
- **Specificità**: Sensibilità ridotta per TC (-16% vs altri cloni)
- **Vantaggio**: Maggiore sensibilità per IC (+24% vs 22C3)
- **Uso**: Esclusivo per atezolizumab
- **⚠️ Critico**: Non usare per pembrolizumab o nivolumab

### Metodi di Scoring

#### TPS (Tumor Proportion Score)
- **Definizione**: Percentuale cellule tumorali PDL-1+ su totale cellule tumorali
- **Range**: 0-100%
- **Cutoff comuni**: 1%, 10%, 50%
- **Clone tipico**: 22C3, 28-8
- **Esempio**: TPS 65% = 65/100 cellule tumorali positive

#### CPS (Combined Positive Score)
- **Definizione**: (Cellule tumorali PDL-1+ + Cellule immunitarie PDL-1+) / Cellule tumorali totali × 100
- **Range**: 0-100%
- **Cutoff comuni**: 1%, 10%, 20%
- **Clone tipico**: 22C3
- **Nota**: Include sia TC che IC nel numeratore
- **Valore**: Più predittivo di TPS in alcuni tumori (gastrico, HNSCC)

#### TC/IC (Tumor Cell/Immune Cell)
- **TC Score**: % cellule tumorali PDL-1+
- **IC Score**: % area occupata da cellule immunitarie PDL-1+
- **Categorie**: TC0/IC0 (negativo), TC1/IC1, TC2/IC2, TC3/IC3 (alto)
- **Clone**: SP142 (atezolizumab)
- **Cutoff**: TC/IC ≥1%, TC/IC ≥5%, TC/IC ≥10%
- **Vantaggio**: Migliore per valutare microambiente tumorale

### Fattori Pre-analitici Critici

⚠️ **Questi fattori possono sottostimare PDL-1:**

| Fattore | Standard | Problema |
|---------|----------|---------|
| **Fissazione** | FFPE ≤48h | >48h → artefatti |
| **Conservazione sezioni** | ≤4 settimane a 4°C | >4 settimane → degradazione |
| **Età blocco** | ≤3 anni | >3 anni → possibile sottostima |
| **Spessore sezione** | 4-5 μm | <3 μm o >6 μm → errori scoring |
| **Scongelamento** | Evitare ripetuti cicli | Ripetuti cicli → denaturazione |

---

## 📚 Database Clinico: Tumori e Indicazioni

### 🫁 NSCLC (Non-Small Cell Lung Cancer)

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | 1ª mono | TPS | ≥50% | Senza EGFR/ALK mutato |
| Pembrolizumab | 1ª + chemo | TPS | ≥1% | Con/senza EGFR/ALK se post-TKI |
| Nivolumab | 2ª | TPS | ≥0% | Agnostico |
| Nivolumab | 1ª + IPI | TPS | ≥1% | Senza driver mutations |
| Atezolizumab | 1ª + chemo + bev | TC/IC | ≥0% | Agnostico, non-squamoso |
| Durvalumab | Consolidamento post-RT | TPS | ≥1% | Stadio III non-resecabile |

**Trial principali:** KEYNOTE-024, KEYNOTE-407, CheckMate-057, CheckMate-227, IMpower150, PACIFIC

---

### 🎨 Melanoma

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | Qualsiasi | Non richiesto | Agnostico | PDL-1 non predittivo |
| Nivolumab | Qualsiasi | Non richiesto | Agnostico | PDL-1 non predittivo |
| Nivolumab | Adiuvante | Non richiesto | Agnostico | Stadio III/IV resecato |

**Trial principali:** KEYNOTE-006, CheckMate-066, CheckMate-067

---

### 🗣️ HNSCC (Head and Neck)

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | 1ª mono | CPS | ≥20% | Monoterapia |
| Pembrolizumab | 1ª + chemo | CPS | ≥1% | Combinazione |
| Pembrolizumab | 2ª (R/M) | CPS | ≥1% | Post-platino |
| Nivolumab | 2ª (R/M) | TC | ≥1% | Dopo fallimento platino |

**Trial principali:** KEYNOTE-048, CheckMate-141

---

### 🩼 Carcinoma Uroteliale

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | 1ª (Cisplatin-unfit) | CPS | ≥10% | Non candidato a platino |
| Pembrolizumab | 2ª | CPS | ≥10% | Post-platino |
| Nivolumab | 2ª | TC | ≥1% | Post-platino |
| Atezolizumab | 1ª + chemo | IC | ≥0% | Agnostico |
| Atezolizumab | 2ª | IC | ≥5% | IC2/IC3 |
| Avelumab | Mantenimento | TC | ≥1% | Post-chemio |

**Trial principali:** KEYNOTE-052, CheckMate-275, IMvigor210, JAVELIN Bladder 100

---

### 🍽️ Carcinoma Gastrico/GEJ

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | 1ª + chemo | CPS | ≥10% | HER2-negativo |
| Pembrolizumab | 2ª | CPS | ≥1% | HER2-negativo |
| Nivolumab | 1ª + chemo | CPS | ≥5% | HER2-negativo |
| Nivolumab | 3ª+ | TPS | ≥0% | Agnostico |

**Trial principali:** KEYNOTE-062, CheckMate-649

---

### 🥄 Carcinoma Esofageo Squamoso

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | 1ª + chemo | CPS | ≥10% | - |
| Pembrolizumab | 2ª | CPS | ≥10% | - |
| Nivolumab | 1ª + chemo + IPI | CPS | ≥1-5% | Variabile per regione |
| Nivolumab | 2ª | CPS | ≥5% | Post-platino |

**Trial principali:** KEYNOTE-181, CheckMate-648

---

### 👩‍⚕️ Carcinoma Mammario Triplo Negativo (TNBC)

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | 1ª + chemo | CPS | ≥10% | Metastatico/localmente avanzato |
| Pembrolizumab | Neoadiuvante + chemo | CPS | ≥10% | Alto rischio |
| Atezolizumab | 1ª + nab-paclitaxel | IC | ≥1% | Su cellule immunitarie |

**Trial principali:** KEYNOTE-355, KEYNOTE-522, IMpassion031

---

### 🫖 Carcinoma Renale (RCC)

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | 1ª + axitinib | TPS | ≥0% | Agnostico |
| Nivolumab | 1ª + IPI | TPS | ≥0% | Agnostico, intermedio/alto rischio |

**Trial principali:** KEYNOTE-426, CheckMate-214

---

### 🩺 Carcinoma Endometriale (dMMR/MSI-H)

| Farmaco | Linea | Metodo | Cutoff | Note |
|---------|-------|--------|--------|------|
| Pembrolizumab | Avanzato/R dMMR | CPS | ≥1% | + dMMR/MSI-H confermato |
| Dostarlimab | Avanzato/R dMMR | Non richiesto | Agnostico | PDL-1 non richiesto |
| Dostarlimab | 1ª + chemo | Non richiesto | Agnostico | PDL-1 non richiesto |

**Trial principali:** KEYNOTE-158, GARNET trial

---

### 🔗 Altre Indicazioni

- **Carcinoma Cervicale**: Pembrolizumab 1ª + chemo (CPS ≥1%)
- **Hepatocarcinoma**: Atezolizumab + Bevacizumab 1ª (agnostico)
- **Mesotelioma**: Nivolumab ± IPI 1ª (agnostico)
- **cSCC/BCC**: Cemiplimab (agnostico)

---

## 🎓 Interpretazione Clinica

### Quando PDL-1 è Predittivo?

✅ **PDL-1 predittivo di risposta:**
- NSCLC (TPS ≥50% per pembrolizumab monoterapia)
- HNSCC (CPS ≥20% per pembrolizumab monoterapia)
- Uroteliale (CPS ≥10% per pembrolizumab)

⚠️ **PDL-1 non predittivo (agnostico):**
- Melanoma
- Mesotelioma
- HCC
- Carcinomi cutanei (cSCC, BCC)
- Nivolumab seconda linea NSCLC

### Ruolo del Microambiente Tumorale

Il PDL-1 non è predictor perfetto perché:

1. **TMB** (Tumor Mutational Burden): Alto TMB correla con risposta anche se PDL-1 basso
2. **MSI/dMMR**: Risposta eccellente indipendente da PDL-1 (dostarlimab endometriale)
3. **Clonalità immunitaria**: T-cell infiltrazione predice risposta meglio di PDL-1 solo
4. **Caratteristiche intrinseche tumore**: Istologia, stadio, sito primario
5. **Host factors**: Performance status, comorbidità, terapie pregresse

### Falsi Negativi e Positivi

| Scenario | Significato | Azione |
|----------|-------------|--------|
| PDL-1 basso + TIL alti | Microambiente "hot" | Considerare immunoterapia |
| PDL-1 alto + TIL bassi | "Warm" tumore | Risposta inferiore attesa |
| PDL-1 basso + MSI-H | Alto TMB | Risposta possibile (dostarlimab) |
| PDL-1 negativo + fattori clinici favorevoli | Valutare agnostico drugs | Considerare trial clinici |

---

## 🔧 Specifiche Tecniche

### Browser Supportati
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Requisiti
- JavaScript abilitato
- Niente dipendenze esterne (self-contained)
- Funziona offline

### Dimensione File
- HTML: ~60 KB
- Zero librerie CDN richieste
- Caricamento istantaneo

### Stampa
- Ottimizzata per A4/Letter
- Compatibile con browser print-to-PDF
- Nasconde UI non necessaria in stampa

---

## 📖 Riferimenti Bibliografici

### Trial Pivotali Principali

**NSCLC:**
- KEYNOTE-024, KEYNOTE-407, KEYNOTE-189, KEYNOTE-407
- CheckMate-057, CheckMate-227
- IMpower150, IMpower131
- PACIFIC

**Melanoma:**
- KEYNOTE-006, KEYNOTE-002
- CheckMate-066, CheckMate-067, CheckMate-069

**HNSCC:**
- KEYNOTE-048
- CheckMate-141

**Uroteliale:**
- KEYNOTE-052, KEYNOTE-045
- CheckMate-275
- IMvigor210, IMvigor211
- JAVELIN Bladder 100

**Gastrico:**
- KEYNOTE-062, KEYNOTE-063
- CheckMate-649

**Mammario:**
- KEYNOTE-355, KEYNOTE-522
- IMpassion031

### Linee Guida Ufficiali

- [NCCN Guidelines](https://www.nccn.org/guidelines) - National Comprehensive Cancer Network
- [ESMO Clinical Practice Guidelines](https://www.esmo.org/guidelines) - European Society for Medical Oncology
- [AIOM Linee Guida](https://www.aiom.it/) - Associazione Italiana di Oncologia Medica
- [FDA Approvals](https://www.fda.gov/drugs/immunotherapy/immunotherapy-and-cancer-treatment) - FDA Immunotherapy Approvals

### Review Scientifiche

- Reck M, et al. Pembrolizumab in NSCLC. Lancet. 2021
- Weber J, et al. CheckMate trials in melanoma. Nature Reviews. 2020
- Bellmunt J, et al. Atezolizumab in urothelial carcinoma. Nature Reviews. 2021
- Powles T, et al. Durvalumab in advanced urothelial carcinoma. ESMO 2021

---

## 🛠️ Troubleshooting

### Problema: Il tool non carica

**Soluzione:**
- Verificare che JavaScript sia abilitato nel browser
- Provare con browser diverso
- Cancellare cache browser (Ctrl+F5 o Cmd+Shift+R)

### Problema: Score non riconosce il valore

**Soluzione:**
- Inserire numero tra 0-100
- Usare punto (.) per decimali, non virgola
- Verificare che il campo sia vuoto prima di inserire

### Problema: Debug console non appare

**Soluzione:**
- Cliccare il bottone "🐛 Mostra debug" per visualizzare
- Console è nascosta di default per UI più pulita

### Problema: Referto non stampa correttamente

**Soluzione:**
- Usare "Stampa" dai menu browser (Ctrl+P)
- Impostare margini a 0 in opzioni stampa
- Provare "Stampa su PDF" per salvare

---

## 📝 Licenza

MIT License - Vedi LICENSE per dettagli completi

---

## 👤 Autore

Tool educativo sviluppato per scopi didattici e di ricerca.

**Disclaimer:** Questo tool non sostituisce il giudizio clinico professionale.

---

## 🤝 Contributi

Segnalazioni di bug, suggerimenti e miglioramenti sono benvenuti!

**Come segnalare:**
1. Apri una issue su GitHub
2. Fornisci dettagli: browser, tumore, farmaco, errore
3. Allega screenshot se possibile

---

## 📞 Contatti e Supporto

Per domande cliniche: consultare le linee guida ufficiali (NCCN, ESMO, AIOM)

Per problemi tecnici: segnalare via GitHub issues

---

## 🎯 Versione

- **v2.0** (Novembre 2025)
  - Debug console migliorata
  - Layout referto professionale
  - Migliorata UX generale
  - Database aggiornato 2025

- **v1.0** (2024)
  - Release iniziale

---

**Ultimo aggiornamento:** Novembre 2025

**Status:** Educational - For learning and research purposes only
