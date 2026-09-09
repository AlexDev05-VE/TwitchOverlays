// Servicio de Sincronización
import { OverlaySyncService } from "./services/overlaySyncServices.js";
// ServiceQueue
import { Queue } from "./services/queue.js";
// Service Comands
import { ScoreboardCommand } from "./services/command.js";

// Inicializador de StreamElements - OBS / Refresh Actualizador
window.addEventListener('onWidgetLoad', async function (obj) {
    try {
        const fieldData = obj?.detail?.fieldData;
        await OverlaySyncService.syncAndRender(fieldData);
    } catch (error) {
        console.error('[Overlay Main] Error no controlado durante el ciclo onWidgetLoad:', error);
    }
});

// Inicializador de Eventos de StreamElements
window.addEventListener('onEventReceived', async function (obj) {
    const listener = obj.detail.listener;
    const eventData = obj.detail.event;

    // Detectar si el evento es una actualización del almacén de datos
    if (listener === 'kvstore:update') {
        console.log(eventData)
        // eventData contiene la clave que cambió y el nuevo valor
        console.log('Clave modificada:', eventData.key);   // ej: "shyvadi_snorlax_overlay_current"
        console.log('Nuevo valor:', eventData.value);     // ej: { value: 50 }
    }

    // 1. Donación de dinero directo (Tips)
    if (listener === 'tip-latest') {
        const amount = eventData.amount; // Monto donado (ej. 5.00)
        console.log(`[Barra de Progreso] Nueva donación recibida: $${amount}`);
        Queue.add(eventData);
    }

    // 2. Comandos de chat (!reset, !addgoal)
    if (listener === 'message') {
        console.log('[Main Event Received] Mensaje de chat recibido:', eventData);
        await ScoreboardCommand.handleMessage(eventData);
    }
});