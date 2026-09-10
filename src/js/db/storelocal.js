// ─── StoreLocal (Singleton) ──────────────────────────────────────
// Guarda el estado de la barra de progreso en memoria local.
// Sirve como respaldo cuando la SET_API no está disponible.
// Solo existe una instancia global para poder ser accedida desde
// cualquier scope del proyecto.

class StoreLocal {
    // ── Instancia singleton ──────────────────────────────────────
    static #instance = null;

    static getInstance() {
        if (!StoreLocal.#instance) {
            StoreLocal.#instance = new StoreLocal();
        }
        return StoreLocal.#instance;
    }

    // ── Constructor ──────────────────────────────────────────────
    constructor() {
        if (StoreLocal.#instance) {
            throw new Error('StoreLocal es un Singleton. Usa StoreLocal.getInstance()');
        }

        /**
         * Estado interno del store.
         * @type {{ currentValue: number, maxValue: number}}
         */
        this.store = {
            currentValue: 0,
            maxValue: 0,
            animationType: "",
        };
    }

    // ── Setters ──────────────────────────────────────────────────

    /**
     * Suma el valor recibido al currentValue actual.
     * Solo acepta valores positivos; los negativos son ignorados.
     * @param {number} value
     */
    set currentValue(value) {
        if (value < 0) return;
        this.store.currentValue = value;
    }

    /**
     * Establece el maxValue actual.
     * Solo acepta valores positivos o cero; los negativos son ignorados.
     * @param {number} value
     */
    set maxValue(value) {
        if (value < 0) return;
        this.store.maxValue = value;
    }

    /**
     * Establece el tipo de animación actual.
     * @param {string} value
     */
    set animationType(value) {
        this.store.animationType = value;
    }

    // ── Getters ──────────────────────────────────────────────────

    /**
     * Devuelve el valor actual acumulado de la barra de progreso.
     * @returns {number}
     */
    get currentValue() {
        return this.store.currentValue;
    }

    /**
     * Devuelve el valor máximo acumulado de la barra de progreso.
     * @returns {number}
     */
    get maxValue() {
        return this.store.maxValue;
    }

    /**
     * Devuelve el tipo de animación actual.
     * @returns {string}
     */
    get animationType() {
        return this.store.animationType;
    }
}

// ── Instancia global exportada ────────────────────────────────────
const StoreLocalInstance = StoreLocal.getInstance();

export { StoreLocalInstance as StoreLocal };

