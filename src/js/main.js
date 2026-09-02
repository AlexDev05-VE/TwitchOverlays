/**
 * main.js — Lógica de la barra de progreso Snorlax
 * - Genera burbujas animadas dentro del relleno
 * - Anima el valor numérico del contador
 * - Permite configurar valor actual / máximo
 */

// ─── Configuración ───────────────────────────────────────────
const CONFIG = {
    currentValue: 90,   // Valor actual (editable)
    maxValue: 100,      // Valor máximo
    bubbleCount: 8,     // Cantidad de burbujas activas
    counterDuration: 1400, // ms que tarda el contador en llegar al valor
};

// ─── Selectores ──────────────────────────────────────────────
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');

// ─── Calcular porcentaje ──────────────────────────────────────
function getPercentage(current, max) {
    return Math.min(Math.max((current / max) * 100, 0), 100);
}

// ─── Setear barra ────────────────────────────────────────────
function setProgress(current, max) {
    const pct = getPercentage(current, max);
    progressFill.style.width = `${pct}%`;
    animateCounter(current, max);
}

// ─── Animación del contador ───────────────────────────────────
function animateCounter(target, max) {
    const start = 0;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / CONFIG.counterDuration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const value = Math.round(start + (target - start) * ease);
        progressText.textContent = `${value} / ${max}`;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// ─── Burbujas ─────────────────────────────────────────────────
function createBubble() {
    const bubble = document.createElement('span');
    bubble.classList.add('bubble-particle');

    const size = Math.random() * 8 + 4; // 4px – 12px
    const leftPct = Math.random() * 85 + 5; // 5% – 90%
    const duration = Math.random() * 2 + 1.5; // 1.5s – 3.5s
    const delay = Math.random() * 3; // 0s – 3s

    bubble.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${leftPct}%;
        bottom: 6px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
    `;

    progressFill.appendChild(bubble);

    // Eliminar burbuja al terminar la animación para no acumular DOM
    bubble.addEventListener('animationiteration', () => {
        // Re-randomize position on each loop (handled via CSS looping)
    });
}

function initBubbles() {
    for (let i = 0; i < CONFIG.bubbleCount; i++) {
        createBubble();
    }
}

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setProgress(CONFIG.currentValue, CONFIG.maxValue);
    initBubbles();
});
