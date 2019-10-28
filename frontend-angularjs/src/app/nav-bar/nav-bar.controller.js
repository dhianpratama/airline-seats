// home.controller.js
(() => {

    angular
        .module('app')
        .controller('NavBarController', NavBarController);

    function NavBarController($state) {
        const vm = this;
        vm.$onInit = onInit;

        activate();

        ////////////

        function activate() {
            // Resolve start-up logic
        }
        
        function onInit() {
            // Initialization logic that relies on bindings being present
            // should be put in this method, which is guarranteed to
            // always be called after the bindings have been assigned.
        }

        vm.actions = {
            goToPage: (page) => {
                $state.go(page);
            }
        }
    }

})();