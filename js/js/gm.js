'use strict';

let gm = (function(){
    let signals = {};
    /*
    Отслеживание зависимостей. Идея в следующем:
    1. Вызывается вычисляемое свойство (вызов get). Устанавливается контекст. 
    2. За вызовом вычисляемого свойства, следуют вызовы (get) наблюдаемых свойств, от которых зависит вычисляемое свойство.
    
    З.Ы. 
    computed - вычисляемое свойство.
    observable - наблюдаемое свойство.
    */
    let Dep = {
        target: null, // контекст вычисляемого значения
        subs: {},     // наблюдаемые свойства, от которых зависит вычисляемое значение
        depend: function(deps, dep) {
            // Если контекст еще не сохранен - сохранить его
            if (!deps.includes(this.target)) {
                deps.push(this.target);
            }

            // Добавить наблюдаемые свойства в контекст вычисляемого значения
            if (!Dep.subs[this.target].includes(dep)) {
                Dep.subs[this.target].push(dep);
            }
        },
        getValidDeps: function(deps, key) {
            // Поддержка зависимостей в актуальном состоянии
            return deps.filter(
                dep => this.subs[dep].includes(key)
            );
        },
        notifyDeps: function(deps) {
            // Уведомить всех об изменении
            deps.forEach(notify);
        }
    }

    Date.prototype.format = function (mask, utc) {
        return this.toISOString().split('T')[0];
    };

    // Внешний интерфейс библиотеки
    return {
        applyBindings: (model, view = document) => {
            buildModel(model);
            buildBindings(model, view);
        },
        subscribe: (property, fn) => {
            observe(property, fn);
        }
    }

    function buildModel(model) {
        for(let key in model) {
            if(typeof model[key] === 'function')
                computed(model, key, model[key]);
            else 
                observable(model, key);
        }
    }

    function buildBindings(model, view) {
        let elements = view.querySelectorAll('[data-bind]');
        elements.forEach(element => {
            let description = bindDescription(model, element, element.dataset.bind);
            if(description !== undefined) {
                element.addEventListener(description.event, (event) => {
                    let value = description.element[description.attribute];
                    if(description.element.type === 'date') {
                        value = new Date(value);
                    }
                    model[description.property] = value;
                });
            }
            updateUI(model, description);
        });
    }

    function bindDescription(object, element, b) {
        let description = {
            element: '',
            attribute: '',
            type: '',
            format: '',
            property: '',
            event: ''
        }

        if(b === undefined) 
            return undefined;

        let bvals = b.split(',');
        for(let i = 0; i < bvals.length; i++) {
            let propval = bvals[i].split(':')
              , prop    = propval[0].trim()
              , val     = propval[1].trim();
            if(description.hasOwnProperty(prop))
                description[prop] = val;
        }

        if(!object.hasOwnProperty(description.property))
            return undefined;

        description.element = element;
        description.type    = element.type;

        return description;
    }

    // Объявление и реализация наблюдаемого свойства
    function observable(object, key) {
        let deps = []            // массив зависимостей
          , value = object[key]; // текущее значение свойства

        Object.defineProperty(object, key, {
            get: function() {
                // Если находится в контексте вычисляемого значения, добавить себя в зависимости
                if (Dep.target) {
                    Dep.depend(deps, key)
                }

                return value;
            },
            set: function(newVal) {
                value = newVal;

                // При установке нового значения - обновить зависимости
                deps = Dep.getValidDeps(deps, key);
                Dep.notifyDeps(deps, key);

                // Уведомить всех наблюдателей
                notify(key);
            }
        });
    }

    // Объявление и реализация вычисляемого свойства
    function computed(object, key, fn) {
        let deps  = [];

        Object.defineProperty(object, key, {
            get: function() {
                // Добавить себя в зависимости, если нахожусь в контексте другого вычисляемого свойства
                if (Dep.target) {
                    Dep.depend(deps, key);
                }

                // Переключить контекст на себя
                Dep.target    = key;
                Dep.subs[key] = [];
                let value     = fn.call(object);
  
                // очистить контекст
                Dep.target = null;
                return value;
            },
            set: function() {} // Вычисляемому свойству set не нужен, поэтому пустая функция.
        });
    }

    // часть паттерна observer, сохраняет обработчики к наблюдаемым свойствам
    function observe (property, signalHandler) {
        if(!signals[property]) 
            signals[property] = [];
        signals[property].push(signalHandler);
    }

    // часть паттерна observer, уведомляет наблюдателей об изменениях
    function notify(signal) {
        if(!signals[signal] || signals[signal].length < 1) 
            return;
        signals[signal].forEach(signalHandler => signalHandler());
    }

    // обновляет пользовательские элементы управления
    function updateUI(model, description) {
        description.element[description.attribute] 
            = safeSet(model[description.property], description);
        observe(description.property, () => { 
            description.element[description.attribute] 
                = safeSet(model[description.property], description);
        });
    }

    function safeSet(value, description) {
        let result = value;
        if(value instanceof Date) {
            result = value.format(description.format, true);
        }

        return result;
    }
}());