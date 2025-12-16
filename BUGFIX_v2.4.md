# PDL-1 Clinical Evaluator - Bug Fix v2.4

## Riepilogo Fix Applicate

### 🔴 FIX CRITICI

---

## FIX #1 - Logica TC/IC in evaluatePDL1()

**Problema:** Se l'utente inserisce solo TC e non IC (o viceversa), `scoreIC` è `NaN` → sempre negativo anche se non richiesto.

**Soluzione:** Cambiare la logica per gestire correttamente i valori null vs NaN.

### Codice da sostituire (in `evaluatePDL1()`):

```javascript
// VECCHIO (ERRATO):
if (indication.cutoffType === 'tc50_or_ic10') {
    cutoffText = 'TC ≥50% o IC ≥10%';
    const tcMet = !isNaN(scoreTC) && scoreTC >= 50;
    const icMet = !isNaN(scoreIC) && scoreIC >= 10;
    isEligible = tcMet || icMet;
}

// NUOVO (CORRETTO):
if (indication.cutoffType === 'tc50_or_ic10') {
    cutoffText = 'TC ≥50% o IC ≥10%';
    // FIX: Uso null check invece di isNaN
    const tcMet = scoreTC !== null && scoreTC >= 50;
    const icMet = scoreIC !== null && scoreIC >= 10;
    isEligible = tcMet || icMet;
}
```

### Applicare a TUTTI i cutoffType:
- `tc50_or_ic10`
- `tc1_or_ic1`
- `ic5`
- `ic1`

---

## FIX #2 - Atezolizumab uroteliale: input solo IC

**Problema:** Con `tcic: true` il tool genera due input (TC e IC), ma per uroteliale atezolizumab serve solo IC.

**Soluzione:** Aggiungere flag `icOnly: true` e gestirlo separatamente.

### Modifica nel database clinico:

```javascript
// In clinicalDatabase.uc.drugs.atezolizumab.indications.second:
'second': {
    name: 'Seconda linea',
    method: 'IC',
    cutoffIC: 5,
    cutoffType: 'ic_only',  // CAMBIATO da 'ic5'
    notes: 'IC ≥5% (IC2/3), dopo platino. Solo IC valutato, TC non richiesto.',
    combo: false,
    tcic: false,  // CAMBIATO da true
    icOnly: true, // NUOVO FLAG
    trial: 'IMvigor211'
}
```

### Stessa modifica per TNBC atezolizumab:

```javascript
// In clinicalDatabase.tnbc.drugs.atezolizumab.indications['first-combo']:
'first-combo': {
    name: 'Prima linea + nab-paclitaxel',
    method: 'IC',
    cutoffIC: 1,
    cutoffType: 'ic_only',  // CAMBIATO
    notes: 'IC ≥1%. ⚠️ RITIRATO FDA (Aug 2021) - Attivo EMA/AIFA. Solo IC valutato.',
    combo: true,
    tcic: false,  // CAMBIATO
    icOnly: true, // NUOVO
    trial: 'IMpassion130',
    regulatoryWarning: 'FDA withdrawn (Aug 2021), EMA/AIFA active'
}
```

### Aggiungere logica per icOnly in updateScoringInfo():

```javascript
// Dopo la sezione tcic inputs, aggiungere:
if (indication.icOnly) {
    // Solo input IC
    scoreInputs.innerHTML = `
        <div class="ic-only-input">
            <label>IC (Immune Cell) %:</label>
            <input type="number" id="score-ic" placeholder="0-100" min="0" max="100" step="0.1">
            <p style="font-size: 11px; color: #718096; margin-top: 5px;">
                ⚠️ Per questa indicazione viene valutato solo IC (immune cell), non TC.
            </p>
        </div>
    `;
} else if (indication.tcic && indication.cutoffType && indication.cutoffType !== 'agnostic') {
    // Input TC e IC separati (codice esistente)
    ...
}
```

### Aggiungere logica in evaluatePDL1():

```javascript
// Prima della gestione tcic, aggiungere:
if (indication.icOnly) {
    // Solo IC richiesto
    const scoreICInput = document.getElementById('score-ic');
    if (scoreICInput && scoreICInput.value !== '') {
        scoreIC = parseFloat(scoreICInput.value);
        if (isNaN(scoreIC) || scoreIC < 0 || scoreIC > 100) {
            log('❌ ERRORE: Score IC non valido (0-100)', 'error');
            alert('❌ Inserisci uno score IC valido (0-100)');
            return;
        }
    }
}
```

---

## FIX #3 - Validazione score 0-100

**Problema:** Il check con `||` tra le condizioni non blocca correttamente valori > 100.

**Soluzione:** Aggiungere funzione di validazione chiamata in `evaluatePDL1()`.

### Nuova funzione da aggiungere:

```javascript
function validateAllScoreInputs() {
    let isValid = true;
    
    const scoreInput = document.getElementById('score');
    const scoreTCInput = document.getElementById('score-tc');
    const scoreICInput = document.getElementById('score-ic');
    
    if (scoreInput && scoreInput.value !== '') {
        const val = parseFloat(scoreInput.value);
        if (isNaN(val) || val < 0 || val > 100) {
            scoreInput.classList.add('input-error');
            isValid = false;
        }
    }
    if (scoreTCInput && scoreTCInput.value !== '') {
        const val = parseFloat(scoreTCInput.value);
        if (isNaN(val) || val < 0 || val > 100) {
            scoreTCInput.classList.add('input-error');
            isValid = false;
        }
    }
    if (scoreICInput && scoreICInput.value !== '') {
        const val = parseFloat(scoreICInput.value);
        if (isNaN(val) || val < 0 || val > 100) {
            scoreICInput.classList.add('input-error');
            isValid = false;
        }
    }
    
    return isValid;
}
```

### Chiamare all'inizio di evaluatePDL1():

```javascript
function evaluatePDL1() {
    try {
        // ... validazione campi obbligatori ...
        
        // FIX #3: Validazione prima di procedere
        if (!validateAllScoreInputs()) {
            log('❌ ERRORE: Valori score non validi (devono essere 0-100)', 'error');
            alert('❌ I valori dello score devono essere compresi tra 0 e 100');
            return;
        }
        
        // ... resto del codice ...
```

---

## FIX #4 - Rimuovere entry SP142 da cloneInterchangeability

**Problema:** SP142 è in-house (Ventana), non ha bisogno di intercambiabilità.

**Soluzione:** Rimuovere la entry inutile.

```javascript
// RIMUOVERE questa sezione da cloneInterchangeability:
'SP142': {
    alternative: null,
    concordance: '73-76%',
    tumors: [],
    note: 'NON intercambiabile. Sensibilità per cellule tumorali -16%...',
    notInterchangeable: true
}
```

---

## 🟠 FIX CLINICI

---

## FIX #5 - KEYNOTE-811 gastrico HER2+ ora PDL-1 agnostico

**Problema:** Il cutoff CPS ≥1 era per la coorte iniziale, l'approvazione finale FDA (Mar 2025) è PDL-1 agnostica.

```javascript
// In clinicalDatabase.gastric.drugs.pembrolizumab.indications['first-combo-her2']:
'first-combo-her2': {
    name: 'Prima linea + trastuzumab + chemio (HER2+)',
    method: 'Non richiesto',  // CAMBIATO da 'CPS'
    cutoff: 0,                 // CAMBIATO da 1
    notes: 'PDL-1 AGNOSTICO (approvazione FDA Mar 2025), HER2-positivo (IHC 3+ o IHC 2+/FISH+). Il beneficio è indipendente dall\'espressione di PDL-1.',
    combo: true,
    trial: 'KEYNOTE-811',
    fdaDate: 'Mar 2025',
    her2Required: true
}
```

---

## FIX #8 - PACIFIC durvalumab: nota su cutoff contestato

```javascript
// In clinicalDatabase.nsclc.drugs.durvalumab.indications.consolidation:
'consolidation': {
    name: 'Consolidamento post-RT',
    method: 'TPS',
    cutoff: 1,
    // Nota aggiornata:
    notes: 'Stadio III non resecabile, TPS ≥1%, post radio-chemio. ⚠️ NOTA: il beneficio è stato osservato anche in TPS <1% (analisi post-hoc). ESMO suggerisce considerare durvalumab indipendentemente da PDL-1.',
    combo: false,
    trial: 'PACIFIC'
}
```

---

## 🟡 FIX MINORI

---

## FIX #9 - Recovery banner rendering

**Problema:** Creava div dentro div.

```javascript
// VECCHIO:
function showRecoveryBanner(sessionData, savedTime) {
    banner.innerHTML = `
        <div class="recovery-banner">
            ...
        </div>
    `;
}

// NUOVO:
function showRecoveryBanner(sessionData, savedTime) {
    banner.className = 'recovery-banner';  // Applica classe al container
    banner.innerHTML = `
        <p>💾 Sessione salvata il ${timeStr}...</p>
        <div>
            <button class="btn-restore" onclick="restoreSession()">Ripristina</button>
            <button class="btn-dismiss" onclick="dismissRecovery()">Ignora</button>
        </div>
    `;
}

function dismissRecovery() {
    const banner = document.getElementById('recovery-banner');
    banner.className = '';  // Reset classe
    banner.innerHTML = '';
}
```

---

## FIX #11 - Escape caratteri speciali

**Aggiungere funzione:**

```javascript
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
```

**Usare in:**
- `generateReport()` per tutti i campi testo
- `generateEmailRequest()` per la preview email
- `log()` per i messaggi debug

---

## FIX #12 - z-index autosave indicator

```css
.autosave-indicator {
    z-index: 9999;  /* CAMBIATO da 1000 */
}
```

---

## Changelog per header

```html
<div class="version">v2.4 - Database clinico aggiornato Dicembre 2025 (Bug fix)</div>
```

```html
<div class="changelog">
    <h4>🆕 Novità v2.4 (Bug Fix)</h4>
    <ul>
        <li><strong>FIX:</strong> Logica TC/IC corretta per indicazioni solo-IC (uroteliale)</li>
        <li><strong>FIX:</strong> Validazione score 0-100 ora blocca correttamente valori fuori range</li>
        <li><strong>FIX:</strong> KEYNOTE-811 gastrico HER2+ ora PDL-1 agnostico (come da approvazione FDA)</li>
        <li><strong>FIX:</strong> PACIFIC durvalumab - aggiunta nota su cutoff contestato</li>
        <li><strong>FIX:</strong> Escape caratteri speciali nell'email</li>
        <li><strong>FIX:</strong> Recovery banner rendering corretto</li>
    </ul>
</div>
```

---

## Nuovo caso demo per IC-only

```javascript
// Aggiungere in demoCases:
'uc-atezo-ic': {
    name: 'Uroteliale - Atezolizumab IC-only',
    tumor: 'uc',
    drug: 'atezolizumab',
    line: 'second',
    scoreIC: '8',
    ptSurname: 'Viola',
    ptFirstname: 'Pietro',
    ptHistory: 'Carcinoma uroteliale vescicale stadio IV. Progressione dopo cisplatino/gemcitabina.',
    docName: 'Dr. Demo',
    docUnit: 'Oncologia Medica'
}
```

E aggiungere bottone nella sezione demo:

```html
<button onclick="loadDemo('uc-atezo-ic')">Uroteliale - Atezolizumab IC-only</button>
```
