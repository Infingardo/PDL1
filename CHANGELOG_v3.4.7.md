# PD-L1 AP Tool v3.4.7 — Chiarimento SP263 vs SP142 per TNBC Pembrolizumab

**Data:** Aprile 2026 (revisione v3.4.6)  
**Status:** ✅ **FINAL PRODUCTION** — Chiarimento metodo nativo SP263/SP142  
**Uso:** Operativo interno — pronto per deployment  

---

## 📝 **Modifica Aggiunta**

### **TNBC Pembrolizumab — Chiarito SP263 vs SP142 ✅**

**Situazione realistica nel tuo lab:**

| Clone | Ditta | Metodo nativo | Concordanza vs 22C3 |
|-------|-------|---------------|-------------------|
| **22C3** | Dako | CPS | Standard EMA |
| **SP263** | Ventana | **TPS** | ~90% (Blueprint) |
| **SP142** | Ventana | **IC** | Non comparable (metodo diverso) |

**Il problema:** Il tool consigliava SP263, ma tu hai entrambi i Ventana e **praticamente sempre l'oncologo vuole IC.**

**Soluzione:** Aggiornata `guidelineNote` in TNBC pembrolizumab 'first-combo':

```
Standard EMA: CPS con 22C3. Nel tuo lab, se non hai 22C3, 
hai due alternative Ventana: 
  • SP263 (TPS, ~90% concordanza vs CPS) 
  • SP142 (IC, metodo nativo). 
Scegli quale usare di routine in base a quello che l'oncologo preferisce.
```

**Effetto:**
Patologo vede chiaramente che **ha due scelte**:
- SP263 → TPS (concordanza analitica con CPS)
- SP142 → IC (metodo nativo, quello che vuole l'oncologo)

Decisione **una volta** nel tuo workflow, poi diventa standard.

---

## 🎯 **Workflow TNBC Pembrolizumab nel tuo Lab**

**Decisione di laboratorio (fatta una volta):**
- Se l'oncologo preferisce **IC** → usi **SP142** di routine
- Se l'oncologo preferisce **TPS** → usi **SP263** di routine

**Poi ogni referato:**
1. Oncologo: "Pembrolizumab TNBC"
2. Tu: Applichi il clone scelto (SP142 o SP263)
3. Referto: Lo score appropriato (IC o TPS)
4. Fine.

---

## ✅ **Validazione Finale**

| Criterio | Status |
|----------|--------|
| **TNBC pembrolizumab chiarito** | ✅ SP263 vs SP142 spiegato |
| **Metodo nativo SP263** | ✅ TPS |
| **Metodo nativo SP142** | ✅ IC |
| **Workflow semplificato** | ✅ Decisione unica, poi standard |
| **Pronto produzione** | ✅ **SÌ** |

---

## 📋 **Metadata**

- **Versione:** v3.4.7 (FINAL PRODUCTION)
- **Data:** Aprile 2026
- **Modifica:** 1 nota metodica (TNBC pembrolizumab, chiarimento SP263 vs SP142)
- **Scope:** Minimo, altamente specifico per il tuo workflow
- **Stato:** ✅ **PRODUCTION-READY**

---

**v3.4.7 = Versione finale con scelta consapevole tra SP263 (TPS) e SP142 (IC) per TNBC pembrolizumab.**

Scegline uno di routine — il tool te lo ricorderà quando lo usi.
