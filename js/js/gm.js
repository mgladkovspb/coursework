'use strict';

Date.prototype.format = function (mask, utc) {
	return this.toISOString().split('T')[0];
};

Date.prototype.firstDayOfMonth = function() {
    let y = this.getFullYear()
      , m = this.getMonth()
      , d = new Date(y, m, 2);

    d.setUTCHours(0);
    return d;
}

Date.prototype.lastDayOfMonth = function() {
    let y = this.getFullYear()
      , m = this.getMonth()
      , d = new Date(y, m + 1, 1);

    d.setUTCHours(0);
    return d;
}

Date.prototype.startOfDay = function() {
    return new Date(new Date().setUTCHours(0, 0, 0, 1));
}

Date.prototype.endOfDay = function() {
    return new Date(new Date().setUTCHours(23, 59, 59, 999));
}

let gm = (function(){
    function Binding(object, property) {
        let self = this;

        this.elementBindings = [];
        this.value           = object[property];

        this._safeSet = function(value, description) {
            let result = value;
            if(value instanceof Date) {
                result = value.format(description.format, true);
            }

            return result;
        }

        this.getter = function(){
            return self.value;
        }

        this.setter = function(value){
            self.value = value;
            for (var i = 0; i < self.elementBindings.length; i++) {
                let binding = self.elementBindings[i];
                binding.element[binding.attribute] = self._safeSet(self.value, binding);
            }
        }

        this.addBinding = function(binding) {
            switch(binding.event) {
                case 'click': 
                    binding.element.addEventListener(binding.event, self.value); break;
                default: 
                    binding.element.addEventListener(binding.event, function(event){
                        let value = binding.element[binding.attribute];
                        if(binding.type === 'date') {
                            value = new Date(value);
                        }
                        self.setter(value);
                    });
            }

            self.elementBindings.push(binding);
            if(binding.attribute !== '')
                binding.element[binding.attribute] = self._safeSet(self.value, binding);
    
            return self;
        }

        if(typeof object[property] !== 'function') {
            Object.defineProperty(object, property, {
                get: self.getter,
                set: self.setter
            }); 
        }

        if(typeof self.value !== 'function')
            object[property] = self.value;
    }

    function addServiceProperty(object) {
        Object.defineProperty(object, '__bindings__', {
            value: [],
            enumerable: true
        });
    }

    function buildBindDescription(object, element, b) {
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

    function applyBindings(object, view = document) {
        let elements = view.querySelectorAll('[data-bind]');
        addServiceProperty(object);
        elements.forEach((element) => {
            let description = buildBindDescription(object, element, element.dataset.bind);
            if(description !== undefined) {
                object.__bindings__[description.property] = new Binding(object, description.property);
                object.__bindings__[description.property].addBinding(description);
            }
        });
    }

    return {
        applyBindings: applyBindings
    }
}());