## -- logica de Queue

Esta es una logica que sirve para almacenar las acciones que se deben ejecutar en un momento determinado, es decir, 
no se deben ejecutar todas al mismo tiempo, si no que se deben ejecutar una por una, en orden.

Ya que estos son eventos de StreamElements, lo que significa que tiene una duracion determinada, si no se ejecuta una por una, 
la barra de progreso se reiniciara antes de tiempo o podria solaparce con el siguiente evento.

Hablemos sobre la clase Queue.

- Debe ser singlenton, es decir, solo debe existir una instancia de la clase y sirve como instancia global para poder hacer modificaciones en cualquier scope del proyecto, debido a las limitaciones del ambito lexico

- Debe tener una propiedad llamada queue: arry es un arreglo que va almanecar la informacion de los eventos para ejecutar

- Debe tener un metodo llamado: add(event), este metodo recibe un objeto llamado "event" en los parametros, luego ejecuta un metodo privado llamado progress() sirve para procesar todo los eventos que esten en la cola, en caso de que el metodo progress() este ejecutandose.

## -- Stores Local
Queremos hacer una clase llamada StoreLocal que guarde el progreso de la barra de progreso y que guarde la informacion que ya tiene de config, esto sera fundamental cuando el SET_API se caiga por alguna casualidad podamos usar el store local para poder obtener la informacion necesaria, por lo que el StoreLocal debe tener los siguientes metodos:

- Debe ser singlenton, es decir, solo debe existir una instancia de la clase y sirve como instancia global para poder hacer modificaciones en cualquier scope del proyecto, debido a las limitaciones del ambito lexico

- Debe tener una propiedad llamada store: que es un diccionario con 3 propiedades:
  - currentValue: que guardara la informacion de la barra de progreso
  - maxValue: que guardara la informacion de los eventos para ejecutar
  - bubbleCount = 8: que guardara la cantidad de burbujas que se deben mostrar

- Debe tener 2 setters uno de currentValue, y otro de maxValue, estos setters deben tener un condicional que siempre debe ser positivo, es decir, 
  si el valor es negativo, se debe ignorar, y si el valor es positivo, se debe guardar pero como un sumador es decir si el valor es 5 y se le suma 5 el valor debe ser 10, no se debe reiniciar a 5, por lo que se debe sumar el valor nuevo al valor actual

- Debe tener 2 getters uno de currentValue, y otro de maxValue, que devuelvan la informacion del store

Todo esto debe ser modulador para que pueda ser utilizado en cualquier parte del proyecto.