import { StreamElementAPI } from "../db/streamElements.js";
import { StoreLocal } from "../db/storelocal.js";
import { updateRender } from "../presentation/render_main.js";

/**
 * ─── AlertServices (Clase Abstracta / AlertABC) ────────────────────
 * Define el contrato base para todos los servicios de alertas de Twitch.
 * Maneja la estructura pura de llamadas estáticas sin instanciación.
 */
export class AlertServices {

    constructor() {
        if (new.target === AlertServices) {
            throw new Error(
                '[AlertServices] No se puede instanciar una clase abstracta. ' +
                'Invoca directamente los métodos estáticos de la clase concreta.'
            );
        }
    }

    /**
     * Método estático abstracto que las clases concretas deben implementar.
     * Contiene la lógica principal de ejecución de la alerta.
     * 
     * @abstract
     * @param {Object} event - El evento de StreamElements a procesar.
     * @returns {Promise<number>}
     */
    static async execute(event) {
        throw new Error(
            '[AlertServices] El método estático execute(event) debe ser implementado por la clase concreta.'
        );
    }
}

/**
 * ─── AlertScoreBoard (Clase Concreta) ───────────────────────────────
 * Maneja toda la lógica de alertas de tipo Scoreboard de manera estática.
 * Expone exclusivamente la interfaz `execute` y encapsula la lógica interna en métodos privados.
 */
export class AlertScoreBoard extends AlertServices {

    /**
     * Método privado estático para actualizar el contador en StreamElementsAPI,
     * sincronizar la memoria local en StoreLocal y re-renderizar la UI.
     * 
     * @private
     * @param {number} amountToAdd - Cantidad incremental a sumar al total actual.
     * @returns {Promise<number>} Nuevo valor total acumulado.
     */
    static async #updateScoreboard(amountToAdd) {
        const apiData = await StreamElementAPI.get('shyvadi_snorlax_overlay_current');
        const currentValue = apiData?.value ? Number(apiData.value) : (StoreLocal.currentValue || 0);

        const updatedValue = currentValue + amountToAdd;

        await StreamElementAPI.set('shyvadi_snorlax_overlay_current', { value: updatedValue });
        StoreLocal.currentValue = updatedValue;

        updateRender(StoreLocal.currentValue, StoreLocal.maxValue);

        return updatedValue;
    }

    /**
     * Método privado estático para procesar eventos de suscriptores.
     * 
     * @private
     * @param {Object} event - Evento recibido.
     * @returns {Promise<number>} Nuevo valor acumulado.
     */
    static async #subscribersEvent(event) {
        const amount = Number(event?.amount || event?.count || 1);
        return await this.#updateScoreboard(amount);
    }

    /**
     * Método privado estático para procesar eventos de seguidores (+1 constante).
     * 
     * @private
     * @returns {Promise<number>} Nuevo valor acumulado.
     */
    static async #followerEvent() {
        return await this.#updateScoreboard(1);
    }

    /**
     * Método privado estático para procesar eventos de donaciones (Tips/Bits).
     * 
     * @private
     * @param {Object} event - Evento recibido desde Twitch / StreamElements.
     * @returns {Promise<number>} Nuevo valor acumulado.
     */
    static async #tipsEvent(event) {
        const donationAmount = Number(event?.amount || event?.count || 1);
        return await this.#updateScoreboard(donationAmount);
    }

    /**
     * Evaluador privado de tipos de eventos de animación/metas.
     * Redirige la ejecución según el tipo de alerta recibido.
     * 
     * @private
     * @param {Object} event - Evento recibido desde la cola.
     * @returns {Promise<number>}
     */
    static async #increaseScoreBoard(event) {
        const animationType = event?.type;

        switch (animationType) {
            case 'subscriber':
                return await this.#subscribersEvent(event);
            case 'follower':
                return await this.#followerEvent();
            case 'tip':
                return await this.#tipsEvent(event);
            default:
                console.warn(`[AlertScoreBoard] Tipo de evento no reconocido: '${animationType}'`);
                return 0;
        }
    }

    /**
     * Método Público Principal.
     * Punto de entrada de ejecución estático exigido por el contrato de la interfaz.
     * 
     * @override
     * @param {Object} event - Evento de la alerta a procesar.
     * @returns {Promise<number>}
     */
    static async execute(event) {
        return await this.#increaseScoreBoard(event);
    }

    /**
     * Alias público estático para mantener compatibilidad con invocaciones como ExecuteAlert.
     * 
     * @param {Object} event - Evento de la alerta.
     * @returns {Promise<number>}
     */
    static async ExecuteAlert(event) {
        return await this.execute(event);
    }
}