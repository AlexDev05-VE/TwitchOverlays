// Servicio de Sincronización
import { OverlaySyncService } from "./services/overlaySyncServices.js";
// ServiceQueue
import { Queue } from "./services/queue.js";
// Service Comands
import { ScoreboardCommand } from "./services/command.js";
// Store Local
import { StoreLocal } from "./db/storelocal.js";
// StreamElementsAPI
import { StreamElementAPI } from "./db/streamElements.js";
import { updateRender } from "./presentation/render_main.js";

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

    //Obtenemos la informacion del evento
    const listener = obj.detail.listener;
    const eventData = obj.detail.event;

    // Detectar actualizaciones de datos en el servidor de StreamElements
    if (listener === 'kvstore:update') {
        const key = eventData.data.key;
        const value = eventData.data.value.value;

        console.log("Key: ", key)
        console.log("Value: ", value)

        if (key === 'shyvadi_snorlax_overlay_current') {
            StreamElementAPI.set('shyvadi_snorlax_overlay_current', { value: Number(value) });
            StoreLocal.currentValue = Number(value);
            updateRender(StoreLocal.currentValue, StoreLocal.maxValue)
        }

        if (key === 'shyvadi_snorlax_overlay_max') {
            StreamElementAPI.set('shyvadi_snorlax_overlay_max', { value: Number(value) });
            updateRender(StoreLocal.currentValue, StoreLocal.maxValue);
        }
    }

    //  ── 1. Donación de dinero directo (Tips) ────────────────────────────
    if (listener === 'tip-latest' && StoreLocal.animationType === 'tips') {
        const amount = eventData.amount; // Monto donado (ej. 5.00)
        console.log(`[Barra de Progreso] Nueva donación recibida: $${amount}`);
        Queue.add(eventData);
    }

    // ── 2. Manejo de Seguidores (Followers) ────────────────────────────
    if (listener === 'follower-latest' && StoreLocal.animationType === 'followers') {
        console.log('[Barra de Progreso] Nuevo seguidor detectado.');
        Queue.add(eventData);
    }

    // ── 3. Manejo de Suscriptores (Subscribers) ─────────────────────────
    if (listener === 'subscriber-latest' && StoreLocal.animationType === 'subscribers') {
        console.log('[Barra de Progreso] Nueva suscripción detectada.');
        Queue.add(eventData);
    }

    // 2. Comandos de chat (!reset, !addgoal)
    if (listener === 'message') {
        console.log('[Main Event Received] Mensaje de chat recibido:', eventData);
        await ScoreboardCommand.handleMessage(eventData);
    }
});