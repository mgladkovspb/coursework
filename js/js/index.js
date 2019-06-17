'use strict';

let vm = {
    firstName: 'Максим',
    lastName: 'Гладков',
    birthday: new Date('1979-04-05')
}

vm.fullName = function() { 
    return this.firstName + ' ' + this.lastName + ', год рождения: ' + this.birthday.getUTCFullYear(); 
}.bind(vm);

document.addEventListener('DOMContentLoaded', function() {
    gm.applyBindings(vm);
    gm.subscribe('firstName', () => console.log(vm.firstName));
    gm.subscribe('lastName',  () => console.log(vm.lastName));
    gm.subscribe('birthday',  () => console.log(vm.birthday));
}, false);