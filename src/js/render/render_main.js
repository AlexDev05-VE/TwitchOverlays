import { Bubbles } from "./bubble.js";
import { progressController } from "./scoreboard.js";

// 1. Instanciar e inicializar las burbujas UNA SOLA VEZ fuera de la función de renderizado
const bubbles = new Bubbles({
    container: '#progress-fill',
    count: 20
});

// Arrancar la animación continua de burbujas
bubbles.init();

/**
 * Función encargada únicamente de actualizar los valores de la barra.
 * Ya no reinicia las burbujas al ejecutarse.
 * @param {number} current - Valor actual
 * @param {number} max - Valor máximo
 */
function updateRender(current, max) {
    progressController.set(current, max);
}

export { updateRender, bubbles };