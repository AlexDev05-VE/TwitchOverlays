
// ─── Selectores ──────────────────────────────────────────────
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');

/**
 * Calcula el porcentaje de progreso
 * @param {number} current - Valor actual
 * @param {number} max - Valor máximo
 * @returns {number} Porcentaje de progreso
 */
function getPercentage(current, max) {
    return Math.min(Math.max((current / max) * 100, 0), 100);
}

// ─── Animación del contador ───────────────────────────────────
/**
 * Anima el contador numérico con easeOutQuart
 * @param {number} target - Valor objetivo
 * @param {number} max - Valor máximo
 */
function animateCounter(target, max) {
    progressText.textContent = `${target} / ${max}`;
}


// ─── Setear barra ────────────────────────────────────────────
// Interfaz Principal para utilizar los progresos en el archivo main.js
/**
 * Establece el progreso de la barra
 * @param {number} current - Valor actual
 * @param {number} max - Valor máximo
 */
function setProgress(current, max) {
    const pct = getPercentage(current, max);
    progressFill.style.width = `${pct}%`;
    animateCounter(current, max);
}

export { setProgress };