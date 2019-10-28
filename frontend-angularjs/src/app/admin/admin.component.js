// albums.component.js
(() => {

    angular
        .module('app')
        .component('admin', {
            controller: 'AdminController',
            controllerAs: 'vm',
            templateUrl: 'app/admin/admin.html'
        });

})();