// posts.service.js
(() => {

    angular
        .module('app')
        .factory('homeService', HomeService);

    function HomeService(apiService) {

        return {
            getFlights,
            getFlightSeats,
            bookSeat,
            getRequestDetail
        };

        ////////////

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