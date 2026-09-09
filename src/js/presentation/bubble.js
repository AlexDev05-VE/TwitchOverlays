export class Bubbles {
    /**
     * @param {Object} config - Configuración de las burbujas
     * @param {HTMLElement|string} config.container - Elemento del DOM o selector CSS donde se crearán las burbujas
     * @param {number} [config.count=10] - Cantidad de burbujas a generar
     */
    constructor({ container, count = 10 }) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;
        this.count = count;
        this.createdBubbles = [];
    }

    /**
     * Crea una única burbuja dentro del contenedor.
     * @private
     */
    _createBubble() {
        if (!this.container) return;

        const bubble = document.createElement('span');
        bubble.classList.add('bubble-particle');

        const size = Math.random() * 8 + 4; // 4px – 12px
        const leftPct = Math.random() * 85 + 5; // 5% – 90%
        const duration = Math.random() * 2 + 1.5; // 1.5s – 3.5s
        const delay = Math.random() * 3; // 0s – 3s

        bubble.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${leftPct}%;
            bottom: 6px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        this.container.appendChild(bubble);
        this.createdBubbles.push(bubble);
    }

    /**
     * Inicializa la cantidad de burbujas definidas en la propiedad count.
     */
    init() {
        this.clear(); // Limpia burbujas previas si existen
        for (let i = 0; i < this.count; i++) {
            this._createBubble();
        }
    }

    /**
     * Permite actualizar el número de burbujas y las regenera.
     * @param {number} newCount - Nueva cantidad de burbujas
     */
    setCount(newCount) {
        this.count = newCount;
        this.init();
    }

    /**
     * Elimina las burbujas creadas del DOM.
     */
    clear() {
        this.createdBubbles.forEach(bubble => bubble.remove());
        this.createdBubbles = [];
    }
}