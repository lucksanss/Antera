/* ============================================================
   UNION MECHANIC CALCULATOR — script.js
   Vanilla JS only · No dependencies
   ============================================================ */

'use strict';

/* ── Audio Context (click sounds) ─────────────────────────── */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { /* audio not supported */ }
  }
  return audioCtx;
}

function playClick(type = 'plus') {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode   = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  const freq = type === 'plus' ? 880 : 660;
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + 0.08);

  gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
}

function playReset() {
  const ctx = getAudioContext();
  if (!ctx) return;
  [440, 330, 220].forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.12);
    osc.start(ctx.currentTime + i * 0.06);
    osc.stop(ctx.currentTime + i * 0.06 + 0.12);
  });
}

/* ── State ─────────────────────────────────────────────────── */
const state = {};   // { "Service Name": { qty: 0, price: 0 } }

/* ── Utilities ─────────────────────────────────────────────── */
function formatCurrency(value) {
  if (value === 0) return '$0';
  return '$' + value.toLocaleString('en-US');
}

function animateValue(element, newText) {
  element.classList.remove('bump');
  void element.offsetWidth;             // reflow to restart animation
  element.textContent = newText;
  element.classList.add('bump');
  setTimeout(() => element.classList.remove('bump'), 300);
}

/* ── Initialize service rows ───────────────────────────────── */
function initServices() {
  const rows = document.querySelectorAll('.service-row');
  rows.forEach(row => {
    const name  = row.dataset.service;
    const price = parseInt(row.dataset.price, 10);
    state[name] = { qty: 0, price };

    const minusBtn  = row.querySelector('.minus-btn');
    const plusBtn   = row.querySelector('.plus-btn');
    const qtyEl     = row.querySelector('.qty-display');
    const subtotalEl= row.querySelector('.service-subtotal');

    plusBtn.addEventListener('click', () => {
      if (name === 'Performance' && state[name].qty >= 6) return;
      state[name].qty++;
      updateRow(row, name, qtyEl, subtotalEl);
      updateTotal();
      playClick('plus');
    });

    minusBtn.addEventListener('click', () => {
      if (state[name].qty > 0) {
        state[name].qty--;
        updateRow(row, name, qtyEl, subtotalEl);
        updateTotal();
        playClick('minus');
      }
    });
  });
}

/* ── Performance special pricing ──────────────────────────── */
// qty 1-4: $166,000 each  |  qty 5: $830,000 flat  |  qty 6: $930,000 flat
function getPerformanceSubtotal(qty) {
  if (qty === 0) return 0;
  if (qty === 5) return 830000;
  if (qty === 6) return 930000;
  return qty * 166000;   // 1-4 and 7+ use per-unit price
}

function updateRow(row, name, qtyEl, subtotalEl) {
  const { qty, price } = state[name];
  qtyEl.textContent = qty;

  let subtotal;
  if (name === 'Performance') {
    subtotal = getPerformanceSubtotal(qty);
    // Show a deal badge hint on the price label when special pricing kicks in
    const priceLabel = row.querySelector('.service-price');
    if (qty === 5) {
      priceLabel.textContent = '⚡ Bundle deal: x5 = $830,000';
    } else if (qty === 6) {
      priceLabel.textContent = '⚡ Bundle deal: x6 = $930,000';
    } else {
      priceLabel.textContent = '$166,000 each';
    }
  } else {
    subtotal = qty * price;
  }

  subtotalEl.textContent = formatCurrency(subtotal);
  row.classList.toggle('active', qty > 0);
}

/* ── Total calculation ─────────────────────────────────────── */
function updateTotal() {
  let total    = 0;
  let count    = 0;
  let lineCount= 0;

  Object.entries(state).forEach(([svcName, { qty, price }]) => {
    const subtotal = svcName === 'Performance' ? getPerformanceSubtotal(qty) : qty * price;
    total += subtotal;
    count += qty;
    if (qty > 0) lineCount++;
  });

  const totalEl   = document.getElementById('totalAmount');
  const subtextEl = document.getElementById('totalSubtext');
  const stickyEl  = document.getElementById('stickyTotal');

  animateValue(totalEl, formatCurrency(total));
  stickyEl.textContent = formatCurrency(total);

  if (count === 0) {
    subtextEl.textContent = 'No services selected';
  } else {
    const parts = [];
    if (lineCount === 1) {
      const active = Object.entries(state).find(([, v]) => v.qty > 0);
      parts.push(`${active[1].qty}x ${active[0]}`);
    } else {
      parts.push(`${count} item${count !== 1 ? 's' : ''} across ${lineCount} service${lineCount !== 1 ? 's' : ''}`);
    }
    subtextEl.textContent = parts.join(' · ');
  }
}

/* ── Reset ─────────────────────────────────────────────────── */
function resetAll() {
  Object.keys(state).forEach(name => { state[name].qty = 0; });

  document.querySelectorAll('.service-row').forEach(row => {
    row.querySelector('.qty-display').textContent      = '0';
    row.querySelector('.service-subtotal').textContent = '$0';
    row.classList.remove('active');
    if (row.dataset.service === 'Performance') {
      row.querySelector('.service-price').textContent = '$166,000 each';
    }
  });

  updateTotal();
  playReset();
}

/* ── Copy Summary ──────────────────────────────────────────── */
function copySummary() {
  const lines = [];
  let   total = 0;

  lines.push('═══════════════════════════════');
  lines.push('   🔧 UNION MECHANIC — QUOTE');
  lines.push('═══════════════════════════════');

  let hasServices = false;
  Object.entries(state).forEach(([name, { qty, price }]) => {
    if (qty > 0) {
      hasServices = true;
      const sub = name === 'Performance' ? getPerformanceSubtotal(qty) : qty * price;
      total += sub;
      const dealNote = name === 'Performance' && (qty === 5 || qty === 6) ? ' ⚡bundle' : '';
      lines.push(`  ${name.padEnd(18)} x${qty}  →  ${formatCurrency(sub)}${dealNote}`);
    }
  });

  if (!hasServices) {
    lines.push('  (no services selected)');
  }

  lines.push('───────────────────────────────');
  lines.push(`  TOTAL: ${formatCurrency(total)}`);
  lines.push('═══════════════════════════════');

  const text = lines.join('\n');

  navigator.clipboard.writeText(text)
    .then(() => showToast())
    .catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    });
}

/* ── Toast ─────────────────────────────────────────────────── */
let toastTimer = null;
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ── Loader & App init ─────────────────────────────────────── */
function initApp() {
  const loader = document.getElementById('loader');
  const app    = document.getElementById('app');

  initServices();
  updateTotal();

  document.getElementById('resetBtn').addEventListener('click', resetAll);
  document.getElementById('copyBtn').addEventListener('click', copySummary);

  // Dismiss loader after short delay
  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 650);
    app.classList.add('visible');
  }, 1400);
}

/* ── Boot ──────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
