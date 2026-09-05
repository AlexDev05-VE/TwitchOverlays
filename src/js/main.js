//Renderizado de la barra de progreso - ServiceRender
import { updateRender } from "./render/render_main.js";
//Almacenamiento de datos - ServiceStoreLocal
import { StoreLocal } from "./config/storelocal.js";
//Almacenamiento de datos - ServiceStreamElements
import { StreamElementAPI } from "./config/streamElements.js";
//Eventos de Colas - Queue



// Inicializador de StreamElements - OBS / Refresh Actualizador
window.addEventListener('onWidgetLoad', async function (obj) {

    //Validador que si sirve en la consola de StreaElements
    console.log("ESTOY VIVOOOOOOOOOOO");
    // ── 1. Obtener fieldData desde el evento de carga ─────────────────
    const fieldData = obj["detail"]["fieldData"];

    // ── Validación 1: fieldData.maxValue es requerido ─────────────────
    if (!fieldData.maxValue) {
        console.error('[Overlay] ❌ fieldData.maxValue no está definido. Verifica los campos del widget en StreamElements.');
        return;
    }

    // ── 2. Obtener variables del servidor SE_API (son Promises) ───────
    // SE_API.store.get() retorna una Promise, por eso usamos await
    const setapi_current = await StreamElementAPI.get('shyvadi_snorlax_overlay_current');
    const setapi_max = await StreamElementAPI.get('shyvadi_snorlax_overlay_max');

    // ── Validación 2: Primera ejecución — el servidor no tiene datos ──
    if (!setapi_current && !setapi_max) {
        console.log('[Overlay] 🆕 Primera ejecución detectada: no hay datos en el servidor SE_API. Inicializando valores por defecto...');

        // Inicializar los valores en el servidor de StreamElements
        StreamElementAPI.set('shyvadi_snorlax_overlay_current', { value: 0 });
        StreamElementAPI.set('shyvadi_snorlax_overlay_max', { value: fieldData.maxValue });

        // Guardar en StoreLocal como cache
        StoreLocal.currentValue = 0;
        StoreLocal.maxValue = fieldData.maxValue;

        console.log('[Overlay] ✅ Valores inicializados correctamente en SE_API y StoreLocal.');

        // Proceso de renderización inicial
        updateRender(StoreLocal.currentValue, StoreLocal.maxValue);
        return;
    }

    // ── Validación 3: El servidor ya tiene datos — actualizar StoreLocal ──
    if (setapi_current && setapi_max) {
        console.log('[Overlay] 🔄 Datos encontrados en SE_API. Actualizando StoreLocal (cache)...');

        // Actualizar StoreLocal con los valores persistidos en el servidor
        StoreLocal.currentValue = setapi_current.value;
        StoreLocal.maxValue = setapi_max.value;

        // Proceso de renderización con datos del servidor
        updateRender(StoreLocal.currentValue, StoreLocal.maxValue);
    }

});


