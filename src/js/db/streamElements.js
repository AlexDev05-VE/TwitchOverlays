const StreamElementAPI = {
    /**
     * Recupera el contenido almacenado bajo la clave especificada.
     * 
     * @param {string} key - Clave alfanumérica para buscar la información.
     * @returns {Promise<object>} Una promesa que se resuelve con el objeto almacenado.
     */
    get(key) {
        return SE_API.store.get(key);
    },

    /**
     * Almacena o sobrescribe un objeto en la base de datos bajo la clave especificada.
     * Nota: Sobrescribe por completo cualquier dato existente en esa clave. No envía actualizaciones parciales.
     * 
     * @param {string} key - Clave alfanumérica donde se guardará el objeto.
     * @param {object} value - El objeto completo que se desea guardar.
     */
    set(key, value) {
        // Validación básica recomendada para evitar errores en StreamElements
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
            console.error('StreamElementAPI: El valor a guardar debe ser un objeto válido de tipo { clave: "valor" }');
            return;
        }

        SE_API.store.set(key, value);
    }
};

export { StreamElementAPI };