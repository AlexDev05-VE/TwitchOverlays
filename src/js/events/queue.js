//Importacion de alertSerive
import { AlertScoreBoard } from "../services/alertservices.js";

// ─── Queue (Singleton) ───────────────────────────────────────────
// Almacena y procesa eventos de StreamElements de forma secuencial.
// Solo existe una instancia global para poder ser accedida desde
// cualquier scope del proyecto.

class Queue {
    // ── Instancia singleton ──────────────────────────────────────
    static #instance = null;

    static getInstance() {
        if (!Queue.#instance) {
            Queue.#instance = new Queue();
        }
        return Queue.#instance;
    }

    // ── Constructor ──────────────────────────────────────────────
    constructor() {
        if (Queue.#instance) {
            throw new Error('Queue es un Singleton. Usa Queue.getInstance()');
        }

        /** @type {Array} Lista de eventos pendientes de procesar */
        this.queue = [];

        /** @type {boolean} Indica si el método #progress() está en ejecución */
        this.#isRunning = false;
    }

    // ── Estado privado ───────────────────────────────────────────
    #isRunning = false;

    // ── Métodos públicos ─────────────────────────────────────────

    /**
     * Agrega un evento a la cola y dispara el procesamiento.
     * @param {Object} event - El evento de StreamElements a encolar.
     */
    add(event) {
        this.queue.push(event);
        this.#progress();
    }

    // ── Métodos privados ─────────────────────────────────────────

    /**
     * Procesa los eventos de la cola uno por uno.
     * Si ya está corriendo, no inicia un nuevo ciclo.
     */
    async #progress() {
        if (this.#isRunning) return;

        this.#isRunning = true;

        while (this.queue.length > 0) {
            const event = this.queue.shift();
            await this.#processEvent(event);
        }

        this.#isRunning = false;
    }

    /**
     * Ejecuta un evento individual.
     * Devuelve una Promise que resuelve cuando el evento termine.
     * El objeto event debe tener un método execute(resolve) para
     * señalizar cuándo terminó su animación/duración.
     * @param {Object} event
     * @returns {Promise<void>}
     */
    #processEvent(event) {
        // Obtener los datos de StreamElements API o LocalStore
        AlertScoreBoard.ExecuteAlert(event);
    }
}

// ── Instancia global exportada ────────────────────────────────────
const QueueInstance = Queue.getInstance();

export { QueueInstance as Queue };
