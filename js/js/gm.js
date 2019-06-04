'use strict';
let ViewModel = {
    _listeners: []
}

let gm = {
    observable: function(value) {
        return function(value) {}
    },
    computed: function(fn) {
        return fn;
    },
    applyBindings: function(vm, view) {
        vm = Object.assign(vm, ViewModel);
    }
};
