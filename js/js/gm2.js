'use strict';

let gm = (function(){
    function ViewModel(model, view) {
        let signals = {}
          , Dep     = {
            target: null,
            subs: {},
            depend: function(deps, dep) {
                if (!deps.includes(this.target)) {
                    deps.push(this.target)
                }

                if (!Dep.subs[this.target].includes(dep)) {
                    Dep.subs[this.target].push(dep)
                }
            },
            getValidDeps: function(deps, key) {
                return deps.filter(dep => this.subs[dep].includes(key))
            },
            notifyDeps: (deps) => {
                deps.forEach(notify);
            }
        };

        function notify(signal) {
            if(!signals[signal] || signals[signal].length < 1) return;

            signals[signal].forEach(signalHandler => signalHandler());
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

        function observable(object, key) {
            let deps = []
              , value = object[key];

            Object.defineProperty(object, key, {
                get: function() {
                    if (Dep.target) {
                        Dep.depend(deps, key)
                    }

                    return value;
                },
                set: function(newVal) {
                    value = newVal;
    
                    deps = Dep.getValidDeps(deps, key);
                    Dep.notifyDeps(deps, key);

                    //notify(key);
                }
            });
        }

        function computed(object, key, fn) {
            let deps = [];

            Object.defineProperty(object, key, {
                get: function() {
                    if(Dep.target) {
                        Dep.depend(deps, key);
                    }

                    Dep.target = key;
                    return fn.call(object);
                },
                set: function() {}
            });
        }

        function sync() {

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
                        model[description.property] = value;
                    });
                }
                //this.sync('textContent', element, model, node.attributes['s-text'].value)
            });
        }

        buildModel(model);
        buildBindings(model, view);
    }

    return {
        applyBindings: (model, view = document) => {
            Object.defineProperty(model, '__vm__', {
                value: new ViewModel(model, view),
                enumerable: true
            });
        }
    }
}());