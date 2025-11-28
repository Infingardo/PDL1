# PDL-1 Clinical Evaluator v2.1

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML-5-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](https://www.ecma-international.org/ecma-262/)
[![Status](https://img.shields.io/badge/Status-Educational-blue.svg)](#disclaimer)
[![Updated](https://img.shields.io/badge/Updated-November%202025-green.svg)](#changelog)

Tool interattivo educativo per la valutazione dell'espressione PDL-1 e la selezione delle indicazioni immunoterapiche in oncologia.

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

## 🆕 Changelog v2.1 (Novembre 2025)

### Nuove indicazioni aggiunte

| Tumore | Farmaco | Indicazione | Trial | Cutoff | Data FDA |
|--------|---------|-------------|-------|--------|----------|
| **BTC (vie biliari)** | Pembrolizumab + gem/cis | 1ª linea | KEYNOTE-966 | Agnostico | Oct 2023 |
| **BTC** | Durvalumab + gem/cis | 1ª linea | TOPAZ-1 | Agnostico | Sep 2022 |
| **NSCLC** | Pembrolizumab perioperatorio | Neo/adiuvante | KEYNOTE-671 | Agnostico | Oct 2023 |
| **HNSCC** | Pembrolizumab perioperatorio | Neo/adiuv + RT | KEYNOTE-689 | CPS ≥1 | Jun 2025 |
| **Gastrico HER2+** | Pembrolizumab + trastuzumab + chemo | 1ª linea | KEYNOTE-811 | CPS ≥1 | Mar 2025 |
| **MIBC** | Pembrolizumab + enfortumab vedotin | Perioperatorio | KEYNOTE-905 | Agnostico | Nov 2025 |

### Bug fix
- Corretta gestione cutoff TC/IC per atezolizumab (ora con tipi specifici)
- Aggiunto warning regolatorio per TNBC atezolizumab (ritirato FDA, attivo EMA)
- Aggiunto checkbox HER2 per tumori gastrici

### Miglioramenti
- Database trial pivotali espanso
- Badge regolatori (FDA/EMA) per tracciabilità
- Note regolatorie nel referto
- Sezione changelog visibile nell'interfaccia

---

## 📋 Database Clinico Completo v2.1

### Tumori supportati (16)
1. NSCLC (Non-Small Cell Lung Cancer)
2. Melanoma
3. HNSCC (Head and Neck Squamous Cell)
4. Carcinoma uroteliale
5. Carcinoma gastrico/GEJ
6. Carcinoma esofageo squamoso
7. Carcinoma mammario triplo negativo (TNBC)
8. Carcinoma renale (RCC)
9. Carcinoma cervicale
10. Carcinoma endometriale
11. Epatocarcinoma (HCC)
12. Mesotelioma pleurico
13. Carcinoma cutaneo squamoso (cSCC)
14. Carcinoma basocellulare (BCC)
15. **🆕 Carcinoma vie biliari (BTC)**
16. **🆕 MIBC (Muscle-Invasive Bladder Cancer)**

### Farmaci supportati (8)
- Pembrolizumab (Keytruda)
- Nivolumab (Opdivo)
- Atezolizumab (Tecentriq)
- Durvalumab (Imfinzi)
- Avelumab (Bavencio)
- Cemiplimab (Libtayo)
- Dostarlimab (Jemperli)
- Combinazioni (+ ipilimumab, + chemio, + TKI)

### Indicazioni totali: 50+

---

## 🔬 Cloni Anticorpali e Concordanza

### 22C3 (Dako) - Companion diagnostic pembrolizumab
- **Concordanza con 28-8/SP263**: >90%
- **Uso**: NSCLC, HNSCC, uroteliale, gastrico, TNBC, cervicale

### 28-8 (Dako) - Companion diagnostic nivolumab
- **Concordanza con 22C3/SP263**: >90%
- **Uso**: NSCLC, melanoma, HNSCC, uroteliale, gastrico

### SP263 (Ventana) - Companion diagnostic durvalumab
- **Concordanza con 22C3/28-8**: >90%
- **Uso**: NSCLC, uroteliale

### SP142 (Ventana) - Companion diagnostic atezolizumab
- **Concordanza con altri cloni**: 73-76% (kappa 0.39-0.55)
- **Sensibilità TC**: -16% vs altri cloni
- **Sensibilità IC**: +24% vs 22C3
- **⚠️ NON INTERCAMBIABILE**
- **Uso esclusivo**: Atezolizumab (NSCLC, uroteliale, TNBC, HCC)

---

## 📊 Metodi di Scoring

### TPS (Tumor Proportion Score)
```
TPS = (Cellule tumorali PDL-1+) / (Totale cellule tumorali) × 100
Range: 0-100%
Cutoff comuni: 1%, 10%, 50%
```

### CPS (Combined Positive Score)
```
CPS = (TC PDL-1+ + IC PDL-1+) / (Totale cellule tumorali) × 100
Range: 0-100+ (può superare 100)
Cutoff comuni: 1%, 5%, 10%, 20%
```

### TC/IC (Tumor Cell/Immune Cell) - SP142
```
TC Score: % cellule tumorali PDL-1+
IC Score: % area tumorale occupata da IC PDL-1+

TC0/IC0: <1%/<1% (negativo)
TC1/IC1: ≥1%/≥1%
TC2/IC2: ≥5%/≥5%
TC3/IC3: ≥50%/≥10% (high)
```

---

## 🚨 Note Regolatorie Critiche

### Discordanze FDA/EMA/AIFA

| Indicazione | FDA | EMA | Note |
|-------------|-----|-----|------|
| Atezolizumab + nab-paclitaxel TNBC | **RITIRATO** (Aug 2021) | Attivo | IMpassion131 fallito OS |
| Cutoff CPS gastrico pembrolizumab | ≥1 (alcuni setting) | Variabile | Verificare localmente |
| Pembrolizumab HNSCC perioperatorio | Approvato Jun 2025 | In valutazione | KEYNOTE-689 |

### Principio generale
> Le approvazioni FDA precedono tipicamente quelle EMA di 6-12 mesi. AIFA può avere criteri aggiuntivi per la rimborsabilità in Italia. **Verificare sempre la Gazzetta Ufficiale e il sito AIFA.**

---

## 📚 Trial Pivotali Principali (Aggiornamento 2025)

### NSCLC
- KEYNOTE-024, -042, -189, -407 (pembrolizumab)
- **KEYNOTE-671** (perioperatorio) 🆕
- **KEYNOTE-091** (adiuvante)
- CheckMate-057, -227, -816 (nivolumab)
- IMpower150, -010 (atezolizumab)
- PACIFIC, AEGEAN (durvalumab)

### Vie Biliari 🆕
- **KEYNOTE-966** (pembrolizumab + gem/cis)
- **TOPAZ-1** (durvalumab + gem/cis)

### HNSCC
- KEYNOTE-048, -040 (pembrolizumab)
- **KEYNOTE-689** (perioperatorio) 🆕
- CheckMate-141 (nivolumab)

### Gastrico
- **KEYNOTE-811** (HER2+) 🆕
- KEYNOTE-859 (HER2-)
- CheckMate-649 (nivolumab)

### Uroteliale
- KEYNOTE-052, -045, **-A39/EV-302** 🆕
- **KEYNOTE-905/EV-303** (MIBC perioperatorio) 🆕
- CheckMate-274, -275 (nivolumab)
- JAVELIN Bladder 100 (avelumab)

---

## 🎓 Interpretazione Clinica

### Quando PDL-1 è Predittivo?

✅ **Predittivo di risposta**:
- NSCLC TPS ≥50% (pembrolizumab mono 1L)
- HNSCC CPS ≥20 (pembrolizumab mono 1L)
- Uroteliale CPS ≥10 (pembrolizumab)
- Gastrico CPS ≥5-10

⚠️ **PDL-1 agnostico** (non predittivo):
- Melanoma (tutte le linee)
- Mesotelioma
- HCC
- cSCC/BCC
- BTC
- NSCLC in combinazione
- RCC in combinazione

### Fattori confondenti
1. **TMB alto**: Risposta possibile anche con PDL-1 basso
2. **MSI-H/dMMR**: Eccellente risposta indipendente da PDL-1
3. **TILs elevati**: Microambiente "hot" predice risposta
4. **Eterogeneità intratumorale**: Biopsia può non essere rappresentativa

---

## 🔧 Specifiche Tecniche

### Browser Supportati
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Requisiti
- JavaScript abilitato
- Niente dipendenze esterne (self-contained HTML)
- Funziona offline

### Dimensione File
- HTML: ~75 KB
- Zero librerie CDN

---

## 📖 Riferimenti Bibliografici Aggiornati

### Review e Meta-analisi 2024-2025
- Casak SJ, et al. FDA Approval Summary: Durvalumab and Pembrolizumab for BTC. Clin Cancer Res 2024
- Forde PM, et al. Perioperative Pembrolizumab for NSCLC. N Engl J Med 2023
- Janjigian YY, et al. Pembrolizumab plus trastuzumab for HER2+ gastric. Lancet 2023

### Linee Guida Ufficiali
- [NCCN Guidelines](https://www.nccn.org/guidelines)
- [ESMO Clinical Practice Guidelines](https://www.esmo.org/guidelines)
- [AIOM Linee Guida](https://www.aiom.it/)
- [AIFA Determine](https://www.aifa.gov.it/)

### Blueprint Studies (Concordanza cloni)
- Hirsch FR, et al. Blueprint PD-L1 IHC Assay Comparison. J Thorac Oncol 2017
- Tsao MS, et al. Blueprint 2 PD-L1 IHC Comparability. J Thorac Oncol 2018

---

## 📝 Licenza

MIT License - Uso educativo

---

## 🎯 Versioni

- **v2.1** (Novembre 2025)
  - Aggiunte indicazioni BTC, MIBC, perioperatorio NSCLC/HNSCC, gastrico HER2+
  - Fix gestione TC/IC
  - Warning regolatorio TNBC atezolizumab
  - Checkbox HER2 per gastrico
  - Badge regolatori e trial nel database

- **v2.0** (Novembre 2025)
  - Debug console migliorata
  - Layout referto professionale

- **v1.0** (2024)
  - Release iniziale

---

**Ultimo aggiornamento:** Novembre 2025

**Status:** Educational - For learning and research purposes only
