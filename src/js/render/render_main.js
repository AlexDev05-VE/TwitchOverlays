import { initBubbles } from "./bubble.js";
import { setProgress } from "./scoreboard.js";

// --Funcion interfaz que nos ayuda a inicializar las funciones y mantenerla en constante actualizacion--
function initRender(current, max) {
    initBubbles();
    setProgress(current, max);
}

export { initRender };