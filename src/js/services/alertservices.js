import { StreamElementAPI } from "../config/streamElements.js";
import { StoreLocal } from "../config/storelocal.js";
import { updateRender } from "../render/render_main.js";

/**
 * ─── AlertServices (Clase Abstracta / AlertABC) ────────────────────
 * Define el contrato base para todos los servicios de alertas de Twitch.
 * Maneja la lógica de interacción con StreamElements API y StoreLocal.
 * 
 */
export class AlertServices {

    constructor() {
        if (new.target === AlertServices) {
            throw new Error(
                '[AlertServices] No se puede instanciar una clase abstracta. ' +
                'Usa una clase concreta como AlertScoreBoard.'
            );
        }
    }

    /**
     * Método abstracto que las clases concretas deben implementar.
     * Contiene la lógica principal de ejecución de la alerta.
     * 
     * @abstract
     * @param {Object} event - El evento de StreamElements a procesar.
     * @returns {Promise<void>}
     */
    execute(event) {
        throw new Error(
            '[AlertServices] El método execute(event) debe ser implementado por la clase concreta.'
        );
    }
}

/**
 * ─── AlertScoreBoard (Clase Concreta) ───────────────────────────────
 * Maneja toda la lógica de alertas de tipo Scoreboard.
 */
export class AlertScoreBoard extends AlertServices {

    /**
     * Aumenta o cambia el contador de StreamElementsAPI y StoreLocal
     * dependiendo de la cantidad de donaciones que viene en el evento.
     * 
     * @param {Object} event - Evento recibido desde Twitch / StreamElements.
     * @returns {Promise<number>} Nuevo valor total acumulado.
     */
    static async increseScoreBoard(event) {
        const donationAmount = Number(event?.amount || event?.count || 1);

        // 1. Obtener el valor actual de StreamElementAPI ('shyvadi_snorlax_overlay_current')
        const apiData = await StreamElementAPI.get('shyvadi_snorlax_overlay_current');
        const currentValue = apiData?.value ? Number(apiData.value) : (StoreLocal.currentValue || 0);

        // 2. Realizar la sumatoria con el valor recibido
        const updatedValue = currentValue + donationAmount;

        // 3. Modificar y guardar en StreamElementAPI
        await StreamElementAPI.set('shyvadi_snorlax_overlay_current', { value: updatedValue });

        // 4. Actualizar datos en cache de StoreLocal por resiliencia
        StoreLocal.currentValue = updatedValue;

        // 5. Renderizar los cambios en la UI
        updateRender(StoreLocal.currentValue, StoreLocal.maxValue);

        return updatedValue;
    }

    /**
     * Función principal que ejecuta la lógica completa de la alerta respetando SOLID.
     * 
     * @param {Object} event - Evento de la alerta.
     * @returns {Promise<void>}
     */
    static async ExecuteAlert(event) {
        await this.increseScoreBoard(event);
    }

}

