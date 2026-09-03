/**
 * main.js — Lógica de la barra de progreso Snorlax
 * - Genera burbujas animadas dentro del relleno
 * - Anima el valor numérico del contador
 * - Permite configurar valor actual / máximo
 */

import { initRender } from "./render/render_main.js";
import { CONFIG } from "./config/config.js";

// ─── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initRender(CONFIG.currentValue, CONFIG.maxValue);
});
