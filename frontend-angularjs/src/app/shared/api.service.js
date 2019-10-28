// api.service.js
(() => {

    angular
        .module('app')
        .factory('apiService', ApiService);

    function ApiService(apiBase, $http, $window) {

        return {
            get,
            post,
            put,
            del
        };

        ////////////

        function generateHttpOptions(method, endpoint, data, auth) {
            const options = {
                method,
                url: `${apiBase}${endpoint}`,
            }
            if (data) {
                options.data = data;
            }
            if (auth) {
                const user = JSON.parse($window.localStorage.getItem("user"))
                options.headers = {
                    "Authorization": `Bearer ${user.token}`
                }
            }
            return options;
        }

        function get(endpoint, auth) {
            const options = generateHttpOptions("GET", endpoint, null, auth);
            return $http(options)
                .then(response => response.data.data);
        }

        function post(endpoint, data, auth) {
            const options = generateHttpOptions("POST", endpoint, data, auth);
            return $http(options)
                .then(response => response.data.data);
        }

        function put(endpoint, data, auth) {
            const options = generateHttpOptions("PUT", endpoint, data, auth);
            return $http(options)
                .then(response => response.data.data);
        }

        function del(endpoint, auth) {
            const options = generateHttpOptions("DELETE", endpoint, null, auth);
            return $http(options)
                .then(response => response.data.data);
        }

    }

})();