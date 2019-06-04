'use strict';

document.addEventListener('DOMContentLoaded', function() {
    let bindingForm = document.getElementById('bindingForm')
      , vm = {
        firstName: gm.observable(''),
        lastName: gm.observable(''),
        surName: gm.observable(''),
        fullName: gm.computed(function() {
            return this.lastName() + ' ' + this.firstName() + ' ' + this.surName();
        }, this)
    }

    gm.applyBindings(vm, bindingForm);

}, false);