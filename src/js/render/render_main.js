import { Bubbles } from "./bubble.js";
import { progressController } from "./scoreboard.js";

// --Funcion interfaz que nos ayuda a inicializar las funciones y mantenerla en constante actualizacion--
function initRender(current, max) {
    const bubbles = new Bubbles({
        container: '#progress-fill',
        count: 20
    });

    bubbles.init();
    progressController.set(current, max);
}

export { initRender };