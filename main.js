// OhmMaster Pro - Core Logic
// v2.0 - 1RM Engineering Labs

// State
const multipliers = {
    v: 1,
    i: 1,
    r: 1,
    p: 1
};

let activeField = null;

// DOM Elements
const inputs = {
    v: document.getElementById('input-v'),
    i: document.getElementById('input-i'),
    r: document.getElementById('input-r'),
    p: document.getElementById('input-p')
};

const tags = {
    v: document.getElementById('tag-v'),
    i: document.getElementById('tag-i'),
    r: document.getElementById('tag-r'),
    p: document.getElementById('tag-p')
};

const prefixKbd = document.getElementById('prefix-kbd-ohm');
const keys = document.querySelectorAll('#prefix-kbd-ohm .key');

// Initialize
function init() {
    setupInputListeners();
    setupCalculators();
}

function setupInputListeners() {
    // Show/Hide keyboard and update active field
    Object.keys(inputs).forEach(key => {
        const input = inputs[key];
        
        input.addEventListener('focus', () => {
            activeField = key;
            prefixKbd.style.display = 'block';
            updateActiveKey(multipliers[key]);
            // Show current prefix tag
            tags[key].style.display = 'block';
        });

        // We don't hide immediately on blur to allow clicking keys
        // Use a small delay or click listener on document
    });

    // Key selection
    keys.forEach(key => {
        key.addEventListener('click', () => {
            if (!activeField) return;

            const val = parseFloat(key.getAttribute('data-val'));
            multipliers[activeField] = val;
            
            updateActiveKey(val);
            updateTag(activeField, val, key.innerText);
        });
    });

    // Close keyboard when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (!prefixKbd.contains(e.target) && !isInput(e.target)) {
            prefixKbd.style.display = 'none';
            activeField = null;
        }
    });

    document.getElementById('btn-clear-ohm').addEventListener('click', clearOhm);
}

function isInput(el) {
    return Object.values(inputs).some(input => input === el);
}

function updateActiveKey(val) {
    keys.forEach(k => {
        const kVal = parseFloat(k.getAttribute('data-val'));
        if (kVal === val) k.classList.add('active');
        else k.classList.remove('active');
    });
}

function updateTag(field, val, label) {
    const tag = tags[field];
    if (val === 1) {
        tag.innerText = 'x1';
    } else {
        tag.innerText = label;
    }
}

function clearOhm() {
    Object.values(inputs).forEach(input => input.value = '');
    Object.keys(multipliers).forEach(k => multipliers[k] = 1);
    Object.values(tags).forEach(tag => {
        tag.innerText = 'x1';
        tag.style.display = 'none';
    });
    updateActiveKey(1);
}

// --- CALCULATION MOTORS ---

function setupCalculators() {
    document.getElementById('btn-calc-ohm').addEventListener('click', solveOhm);
    document.getElementById('btn-calc-vdiv').addEventListener('click', solveVDiv);
}

function solveOhm() {
    // Get raw values and multiply by their current prefix
    const v = inputs.v.value !== '' ? parseFloat(inputs.v.value) * multipliers.v : null;
    const i = inputs.i.value !== '' ? parseFloat(inputs.i.value) * multipliers.i : null;
    const r = inputs.r.value !== '' ? parseFloat(inputs.r.value) * multipliers.r : null;
    const p = inputs.p.value !== '' ? parseFloat(inputs.p.value) * multipliers.p : null;

    let resV = v, resI = i, resR = r, resP = p;

    // Solver logic (Needs at least 2 variables)
    const knownCount = [v, i, r, p].filter(x => x !== null).length;
    if (knownCount < 2) {
        alert("Ingrese al menos 2 valores para resolver.");
        return;
    }

    if (v !== null && i !== null) {
        resR = v / i;
        resP = v * i;
    } else if (v !== null && r !== null) {
        resI = v / r;
        resP = (v * v) / r;
    } else if (v !== null && p !== null) {
        resI = p / v;
        resR = (v * v) / p;
    } else if (i !== null && r !== null) {
        resV = i * r;
        resP = i * i * r;
    } else if (i !== null && p !== null) {
        resV = p / i;
        resR = p / (i * i);
    } else if (r !== null && p !== null) {
        resV = Math.sqrt(p * r);
        resI = Math.sqrt(p / r);
    }

    // Set results back to inputs (un-multiplying by current multipliers)
    updateFieldValue('v', resV);
    updateFieldValue('i', resI);
    updateFieldValue('r', resR);
    updateFieldValue('p', resP);
}

function updateFieldValue(field, val) {
    if (val === null || isNaN(val)) return;
    
    // Convert to engineering notation if too small/large
    // or just use high precision and keep the current multiplier
    const currentMult = multipliers[field];
    inputs[field].value = formatResult(val / currentMult);
}

function formatResult(val) {
    if (Math.abs(val) < 0.000001) return val.toExponential(4);
    if (val % 1 === 0) return val.toString();
    return parseFloat(val.toFixed(6)).toString();
}

// Voltage Divider
function solveVDiv() {
    const vin = parseFloat(document.getElementById('vdiv-vin').value);
    const r1 = parseFloat(document.getElementById('vdiv-r1').value);
    const r2 = parseFloat(document.getElementById('vdiv-r2').value);
    const outEl = document.getElementById('vdiv-vout');

    if (isNaN(vin) || isNaN(r1) || isNaN(r2)) {
        alert("Complete Vin, R1 y R2.");
        return;
    }

    const vout = vin * (r2 / (r1 + r2));
    outEl.value = formatResult(vout);
}

document.addEventListener('DOMContentLoaded', init);
