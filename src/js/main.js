// Servicio de Sincronización
import { OverlaySyncService } from "./services/overlaySyncServices.js";

// Inicializador de StreamElements - OBS / Refresh Actualizador
window.addEventListener('onWidgetLoad', async function (obj) {
    try {
        const fieldData = obj?.detail?.fieldData;
        await OverlaySyncService.syncAndRender(fieldData);
    } catch (error) {
        console.error('[Overlay Main] Error no controlado durante el ciclo onWidgetLoad:', error);
    }
});