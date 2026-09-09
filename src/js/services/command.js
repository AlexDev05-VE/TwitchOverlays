import { StreamElementAPI } from "../db/streamElements.js";
import { StoreLocal } from "../db/storelocal.js";
import { updateRender } from "../presentation/render_main.js";

/**
 * ─── Comands (Clase Abstracta) ───────────────────────────────────
 * Define el contrato base para la ejecución de comandos.
 * Posee métodos de validación de permisos y estructura general.
 */
export class Comands {

    constructor() {
        if (new.target === Comands) {
            throw new Error(
                '[Comands] No se puede instanciar una clase abstracta. ' +
                'Usa una clase concreta como ScoreboardCommand.'
            );
        }
    }

    /**
     * Evalúa si las insignias del usuario contienen permisos administrativos.
     * @protected
     * @param {Array<Object>} [badges=[]] - Arreglo de insignias proveniente del evento de chat.
     * @returns {boolean} True si es el streamer (broadcaster) o un moderador.
     */
    static hasAdminPermission(badges = []) {
        if (!Array.isArray(badges)) return false;
        return badges.some(badge => badge.type === 'broadcaster' || badge.type === 'moderator');
    }
}

/**
 * ─── ScoreboardCommand (Clase Concreta) ───────────────────────────
 * Implementa comandos para la manipulación del Scoreboard / Barra de Progreso
 * aplicando el patrón Template Method para reutilizar la extracción de datos,
 * control de permisos, parseo de parámetros y sincronización de estado.
 */
export class ScoreboardCommand extends Comands {

    // ── Métodos Privados Auxiliares (Componentes Reutilizables) ──────

    /**
     * Extrae los datos relevantes del evento de mensaje de chat.
     * @private
     * @param {Object} eventData
     * @returns {{ badges: Array, messageText: string, username: string, maxInput: string|undefined }}
     */
    static #extractEventData(eventData) {
        // -- Extracción de datos del evento --
        const badges = eventData?.data?.badges || [];
        const messageText = eventData?.data?.text || '';
        const username = eventData?.data?.displayName || 'Usuario';
        const commandParts = messageText.trim().split(/\s+/);
        const maxInput = commandParts[1];

        // -- Retorno de datos --
        return { badges, messageText, username, maxInput };
    }

    /**
     * Valida y parsea el argumento opcional de valor máximo.
     * @private
     * @param {string|undefined} maxInput - Texto del segundo argumento del comando.
     * @returns {number|null} El número parseado (> 0) o null si no fue provisto o es inválido.
     */
    static #parseMaxArgument(maxInput) {
        // -- Validación de argumento max --
        if (maxInput === undefined || maxInput === null || maxInput === '') {
            return null;
        }

        // -- Parseo de argumento max, condicional si es un numero y que sea mayor a 0 --
        const parsedMax = Number(maxInput);
        if (!isNaN(parsedMax) && parsedMax > 0) {
            return parsedMax;
        }
        // -- Si no es válido, se mantiene el valor actual --
        console.warn(`[ScoreboardCommand] Parámetro max no válido ("${maxInput}"). Se mantendrá el maxValue actual.`);
        return null;
    }

    /**
     * Guarda los nuevos valores en StreamElements API, en StoreLocal y actualiza la UI.
     * @private
     * @param {number} newCurrent - Nuevo valor actual.
     * @param {number} newMax - Nuevo valor máximo.
     */
    static async #saveAndSync(newCurrent, newMax) {
        // Persistir en StreamElements API
        await StreamElementAPI.set('shyvadi_snorlax_overlay_current', { value: newCurrent });
        await StreamElementAPI.set('shyvadi_snorlax_overlay_max', { value: newMax });

        // Actualizar caché de StoreLocal
        StoreLocal.currentValue = newCurrent;
        StoreLocal.maxValue = newMax;

        // Sincronizar vista UI
        updateRender(StoreLocal.currentValue, StoreLocal.maxValue);
    }

    /**
     * Template Method que orquesta el ciclo de vida de ejecución de cualquier comando del scoreboard.
     * 1. Extrae datos del evento.
     * 2. Valida permisos administrativos.
     * 3. Parsea el argumento max opcional.
     * 4. Ejecuta la función de cálculo específica del comando.
     * 5. Persiste y sincroniza los cambios en la UI.
     * 
     * @private
     * @param {Object} eventData - Objeto detail.event del listener 'message'.
     * @param {string} commandName - Nombre identificador del comando (ej: '!reset', '!addgoal').
     * @param {Function} stateCalculator - Función que define la lógica particular de (newCurrent, newMax).
     * @returns {Promise<boolean>} True si el comando se ejecutó satisfactoriamente.
     */
    static async #executeTemplate(eventData, commandName, stateCalculator) {
        // 1. Extraer datos del evento
        const { badges, username, maxInput } = this.#extractEventData(eventData);

        // 2. Validar permisos de administrador (Broadcaster / Mod)
        if (!this.hasAdminPermission(badges)) {
            console.warn(`[ScoreboardCommand] El usuario "${username}" intentó ejecutar ${commandName} sin privilegios.`);
            return false;
        }

        // 3. Parsear argumento opcional max
        const parsedMax = this.#parseMaxArgument(maxInput);

        // 4. Obtener estado actual de la barra
        const current = StoreLocal.currentValue || 0;
        const max = StoreLocal.maxValue || 0;

        // 5. Aplicar la lógica específica del comando para calcular nuevos valores
        const { newCurrent, newMax } = stateCalculator({ current, max, parsedMax, username });

        // 6. Guardar, sincronizar y renderizar
        await this.#saveAndSync(newCurrent, newMax);

        console.info(
            `[ScoreboardCommand] Comando ${commandName} ejecutado por "${username}". ` +
            `Nuevo estado -> current: ${newCurrent}, max: ${newMax}`
        );

        return true;
    }

    // ── Métodos Principales Públicos ─────────────────────────────────

    /**
     * Comando !reset [max]
     * Reinicia el valor actual a 0 y, si se indica un nuevo max, actualiza la meta.
     * 
     * @example
     * "!reset" -> current = 0, max = max actual
     * "!reset 200" -> current = 0, max = 200
     * 
     * @param {Object} eventData - Objeto del evento de chat de StreamElements.
     * @returns {Promise<boolean>}
     */
    static async reset(eventData) {
        return this.#executeTemplate(eventData, '!reset', ({ max, parsedMax }) => {
            const newCurrent = 0;
            const newMax = parsedMax !== null ? parsedMax : max;
            return { newCurrent, newMax };
        });
    }

    /**
     * Comando !addgoal [max]
     * Establece una nueva meta gestionando el excedente acumulado:
     * 1. Si current > max (hay excedente): el nuevo current toma el valor del excedente (current - max).
     * 2. Si current <= max (no hay excedente): el nuevo current se reinicia a 0.
     * 3. Si se proporciona [max], se actualiza la meta; de lo contrario, conserva la meta actual.
     * 
     * @example
     * // Caso 1: current=150, max=100 -> "!addgoal 200" => current=50, max=200
     * // Caso 2: current=80, max=100  -> "!addgoal 200" => current=0, max=200
     * // Caso 3: current=150, max=100 -> "!addgoal"     => current=50, max=100
     * 
     * @param {Object} eventData - Objeto del evento de chat de StreamElements.
     * @returns {Promise<boolean>}
     */
    static async addGoal(eventData) {
        return this.#executeTemplate(eventData, '!addgoal', ({ current, max, parsedMax }) => {
            // Calcular excedente: si current superó la meta actual, tomamos la diferencia; si no, es 0
            const surplus = current > max ? (current - max) : 0;
            const newCurrent = surplus;
            const newMax = parsedMax !== null ? parsedMax : max;

            return { newCurrent, newMax };
        });
    }

    /**
     * Enrutador centralizado de mensajes para procesar comandos de chat.
     * 
     * @param {Object} eventData - Objeto del evento 'message'.
     * @returns {Promise<boolean>}
     */
    static async handleMessage(eventData) {
        const messageText = eventData?.data?.text?.trim() || '';
        const command = messageText.split(/\s+/)[0]?.toLowerCase();

        switch (command) {
            case '!reset':
                return await this.reset(eventData);
            case '!addgoal':
                return await this.addGoal(eventData);
            default:
                return false;
        }
    }
}

// Alias exportado por convención de nombres
export { Comands as Commands };