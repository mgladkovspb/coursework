'use strict';

let vm = {
    firstName: 'Максим',
    lastName: 'Гладков',
    birthday: new Date('1979-05-04')
}

vm.fullName = function() { 
    return this.firstName + ' ' + this.lastName; 
}.bind(vm);

document.addEventListener('DOMContentLoaded', function() {
    gm.applyBindings(vm);
}, false);