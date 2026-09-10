import { StreamElementAPI } from "../db/streamElements.js";
import { StoreLocal } from "../db/storelocal.js";
import { updateRender } from "../presentation/render_main.js";

/**
 * Servicio encargado exclusivamente de validar, sincronizar 
 * y reaccionar a los cambios de estado entre fieldData y SE_API.
 */
export class OverlaySyncService {

    /**
     * Valida que el objeto de configuración contenga las propiedades mínimas requeridas.
     * @param {Object} fieldData 
     * @returns {boolean}
     */
    static validateConfiguration(fieldData) {
        if (!fieldData || !fieldData.maxValue || !fieldData.animationType) {
            console.error('[OverlaySync] Error de configuración: fieldData.maxValue y fieldData.animationType es requerido.');
            return false;
        }
        return true;
    }

    /**
     * Procesa la sincronización de datos y actualiza la renderización si corresponde.
     * @param {Object} fieldData 
     */
    static async syncAndRender(fieldData) {
        if (!this.validateConfiguration(fieldData)) return;

        // Obtener los datos de StreamElements API para el manejo de current y max
        const currentMaxInput = fieldData.maxValue;
        const setapi_current = await StreamElementAPI.get('shyvadi_snorlax_overlay_current');
        const setapi_max = await StreamElementAPI.get('shyvadi_snorlax_overlay_max');

        // Obtener los datos de animationType
        const animationTypeInput = fieldData.animationType;
        StoreLocal.animationType = animationTypeInput;

        // Escenario 1: Inicialización previa sin datos
        if (!setapi_current && !setapi_max) {
            await this.#initializeDefaultState(currentMaxInput);
            return;
        }

        // Escenario 2: Datos existentes en la API
        if (setapi_current && setapi_max) {
            await this.#handleExistingState(setapi_current.value, setapi_max.value, currentMaxInput);
        }
    }

    /**
     * Inicializa los valores persistentes por primera vez.
     * @private
     */
    static async #initializeDefaultState(initialMax) {
        console.log('[OverlaySync] Inicializando estado por defecto en SE_API...');

        await StreamElementAPI.set('shyvadi_snorlax_overlay_current', { value: 0 });
        await StreamElementAPI.set('shyvadi_snorlax_overlay_max', { value: initialMax });

        StoreLocal.currentValue = 0;
        StoreLocal.maxValue = initialMax;

        updateRender(StoreLocal.currentValue, StoreLocal.maxValue);
    }

    /**
     * Evalúa si existió una mutación en el valor máximo y actualiza la caché y la vista.
     * @private
     */
    static async #handleExistingState(apiCurrent, apiMax, newMaxInput) {
        const hasMaxChanged = apiMax !== newMaxInput;

        if (hasMaxChanged) {
            console.info(`[OverlaySync] Cambio detectado en maxValue. API: ${apiMax} -> Nuevo: ${newMaxInput}`);
            await StreamElementAPI.set('shyvadi_snorlax_overlay_max', { value: newMaxInput });

            StoreLocal.currentValue = apiCurrent;
            StoreLocal.maxValue = newMaxInput;
        } else {
            console.log('[OverlaySync] Estado sincronizado sin cambios.');
            StoreLocal.currentValue = apiCurrent;
            StoreLocal.maxValue = apiMax;
        }

        updateRender(StoreLocal.currentValue, StoreLocal.maxValue);
    }
}