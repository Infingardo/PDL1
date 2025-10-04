# PDL-1 Clinical Evaluator v2.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML](https://img.shields.io/badge/HTML-5-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](https://www.ecma-international.org/ecma-262/)

Tool interattivo educativo per la valutazione dell'espressione PDL-1 e selezione delle indicazioni immunoterapiche in oncologia.

## ⚠️ DISCLAIMER IMPORTANTE

**QUESTO TOOL È ESCLUSIVAMENTE EDUCATIVO E NON SOSTITUISCE:**
- Le linee guida ufficiali (NCCN, ESMO, AIOM)
- Il giudizio clinico professionale
- Le determine AIFA per la rimborsabilità in Italia
- La valutazione multidisciplinare paziente-specifica

Le indicazioni terapeutiche e i cutoff PDL-1 variano tra FDA, EMA e AIFA. Le approvazioni regolatorie cambiano frequentemente. **Verificare sempre le fonti ufficiali aggiornate prima di qualsiasi decisione clinica.**

## 📋 Descrizione

PDL-1 Clinical Evaluator è uno strumento web-based che aiuta professionisti sanitari e studenti a comprendere le complesse relazioni tra:
- Espressione PDL-1 (cloni anticorpali, metodi di scoring)
- Farmaci immunoterapici (pembrolizumab, nivolumab, atezolizumab, durvalumab, avelumab)
- Indicazioni oncologiche approvate
- Cutoff clinicamente validati

### Caratteristiche principali

✅ **Database clinico completo**
- 12 tipi tumorali con indicazioni specifiche
- 25+ combinazioni farmaco-tumore-linea
- Cutoff validati da trial pivotali (KEYNOTE, CheckMate, IMpower, PACIFIC)

✅ **Cloni e metodi di scoring**
- 22C3, 28-8, SP263, SP142 con indicazioni companion diagnostic
- TPS (Tumor Proportion Score)
- CPS (Combined Positive Score)
- TC/IC (Tumor Cell / Immune Cell)
- Info su concordanza inter-clone

✅ **Integrazione biomarker**
- Check alterazioni molecolari (EGFR, ALK, ROS1, BRAF) per NSCLC
- Status MSI-H/dMMR
- Warning automatici per mutazioni driver

✅ **Refertazione**
- Generazione referto strutturato stampabile
- Interpretazione clinica contestualizzata
- Note pratiche e considerazioni

## 🚀 Utilizzo

### Opzione 1: Download locale
```bash
git clone https://github.com/[tuo-username]/pdl1-evaluator.git
cd pdl1-evaluator
# Apri index.html nel browser
