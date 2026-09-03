import { CONFIG } from "../config/config.js";

// ─── Selectores ──────────────────────────────────────────────
const progressFill = document.querySelector('.progress-fill');


// ─── Burbujas ─────────────────────────────────────────────────
// Crea burbujas animadas dentro del relleno
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

// -- Interfaz para interactuar con la funcion de CreateBubble -- 
function initBubbles() {
    for (let i = 0; i < CONFIG.bubbleCount; i++) {
        createBubble();
    }
}

export { initBubbles };