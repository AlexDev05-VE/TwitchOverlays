class ProgressBar {
    // Variables privadas para el DOM y control de animación
    #progressFill;
    #progressText;
    #currentVisualPct;
    #animationFrameId;

    constructor() {
        this.current = 0;
        this.max = 0;

        // Estado visual actual de la barra (porcentaje)
        this.#currentVisualPct = 0;
        this.#animationFrameId = null;

        // Selectores
        this.#progressFill = document.querySelector('.progress-fill');
        this.#progressText = document.querySelector('.progress-text');
    }

    /**
     * Calcula el porcentaje de progreso (Método privado)
     * @param {number} current - Valor actual
     * @param {number} max - Valor máximo
     * @returns {number} Porcentaje de progreso
     */
    #getPercentage(current, max) {
        if (max === 0) return 0; // Prevenir división por cero
        return Math.min(Math.max((current / max) * 100, 0), 100);
    }

    /**
     * Anima la barra progresivamente hacia el nuevo porcentaje (Método privado)
     * @param {number} targetPct - Porcentaje objetivo
     */
    #animateBar(targetPct) {
        // Cancelar cualquier animación previa en curso para evitar conflictos
        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId);
        }

        const animate = () => {
            // Calcular la diferencia entre el porcentaje visual actual y el objetivo
            const diff = targetPct - this.#currentVisualPct;

            // Si la diferencia es minúscula, detenemos la animación y fijamos el valor final
            if (Math.abs(diff) < 0.1) {
                this.#currentVisualPct = targetPct;
                this.#progressFill.style.width = `${this.#currentVisualPct}%`;
                return;
            }

            // Interpolación: mueve un 10% de la distancia restante en cada frame (efecto suavizado)
            this.#currentVisualPct += diff * 0.1;
            this.#progressFill.style.width = `${this.#currentVisualPct}%`;

            // Llamar al siguiente frame
            this.#animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Actualiza el texto del contador
     * @param {number} target - Valor actual
     * @param {number} max - Valor máximo
     */
    animateCounter(target, max) {
        if (this.#progressText) {
            this.#progressText.textContent = `${target} / ${max}`;
        }
    }

    /**
     * Sincroniza la barra visual y el contador basándose en this.current y this.max
     */
    setProgress() {
        const targetPct = this.#getPercentage(this.current, this.max);
        this.#animateBar(targetPct);
        this.animateCounter(this.current, this.max);
    }

    /**
     * Actualiza los valores y dispara la animación
     * @param {number} current - Nuevo valor actual
     * @param {number} max - Nuevo valor máximo
     */
    set(current, max) {
        this.current = current;
        this.max = max;
        this.setProgress();
    }

    /**
     * Reinicia los valores de progreso a 0
     */
    reset() {
        this.current = 0;
        this.max = 0;
        this.setProgress();
    }
}

// ─── Exportar como Singleton ──────────────────────────────────
const progressController = new ProgressBar();
export { progressController };