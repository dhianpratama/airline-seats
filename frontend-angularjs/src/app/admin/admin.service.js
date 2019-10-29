// posts.service.js
(() => {

    angular
        .module('app')
        .factory('adminService', AdminService);

    function AdminService(apiService) {

        return {
            getMe,
            login,
            createFlight,
            bookSeatsInBulk,
            getFlights,
            getFlightSeats,
            bookSeat,
            getRequestDetail
        };

        ////////////

        function getMe() {
            return apiService
                .get('/admin/me', true);
        }

        function login(username, password) {
            return apiService
                .post('/admin/login', { username, password });
        }

        function createFlight(data) {
            return apiService
                .post('/admin/flights', data, true);
        }

        function bookSeatsInBulk(flightId, listPassengers) {
            const data = {
                passengers: listPassengers
            };
            return apiService
                .post(`/admin/flights/${flightId}/seats/book/bulk`, data, true);
        }

        function getFlights() {
            return apiService
                .get('/flights');
        }

        function getFlightSeats(flightId) {
            return apiService
                .get(`/flights/${flightId}/seats`);
        }

        function bookSeat(flightId, guestName) {
            const data = {
                username: guestName
            };
            return apiService
                .post(`/flights/${flightId}/seats/book`, data);
        }

        function getRequestDetail(requestId) {
            return apiService
                .get(`/flights/seats/requests/${requestId}`);
        }

    }

})();