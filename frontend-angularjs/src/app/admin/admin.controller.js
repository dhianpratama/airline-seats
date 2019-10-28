// home.controller.js
(() => {

    angular
        .module('app')
        .controller('AdminController', AdminController);

    function AdminController(adminService, $timeout, $window) {
        const vm = this;
        vm.$onInit = onInit;

        activate();

        ////////////

        const actions = {
            getMe: () => {
                let user = window.localStorage.getItem("user");
                user = JSON.parse(user);
                console.log("USER => ", user);
                if (!user) {
                    vm.data.isAuthenticated = false;
                    return;
                }

                adminService.getMe()
                    .then(data => {
                        vm.data.isAuthenticated = true;
                    })
                    .catch((err) => vm.data.isAuthenticated = false);

            },
            login: () => {
                adminService.login(vm.data.username, vm.data.password)
                    .then(data => {
                        vm.data.user = data;
                        const user = { ...vm.data.user };
                        window.localStorage.setItem("user", JSON.stringify(user));
                        vm.data.isAuthenticated = true;
                    })
                    .catch((err) => {
                        alert(err.data.message);
                        vm.data.isAuthenticated = false
                    });
            },
            createNewFlight: () => {
                if (!vm.data.flightNumber) {
                    return alert("Flight number is required");
                }

                let seatMap;
                try {
                    seatMap = JSON.parse(vm.data.seatMap);
                } catch (err) {
                    return alert("Invalid seat map")
                }

                const params = {
                    flight_number: vm.data.flightNumber,
                    seat_map: seatMap
                }
                adminService.createFlight(params)
                    .then(data => {
                        vm.data.selectedFlight = data.flight;
                        actions.getFlights();
                        actions.getFlightSeats();
                        vm.data.flightNumber = null;
                        vm.data.seatMap = null;
                    });
            },
            getFlights: () => {
                adminService.getFlights()
                    .then(data => {
                        vm.data.flights = data.flights;
                    });
            },
            getFlightSeats: () => {
                const flight = vm.data.selectedFlight;
                vm.data.displayFlightNumber = flight.flight_number;
                adminService.getFlightSeats(flight.id)
                    .then(data => {
                        vm.data.flightSeats = data.flightSeats;
                        vm.data.viewFlightMode = true;
                        actions.constructSeatsForDisplay();
                    });
            },
            constructSeatsForDisplay: () => {
                const seats = vm.data.flightSeats;
                const displaySeats = {};
                seats.forEach((seat) => {
                    displaySeats[`section${seat.section}`] = [];
                })
                const sections = Object.keys(displaySeats).map((section) => parseInt(section.replace("section", "")));
                const result = [];
                sections.forEach((section) => {
                    const sectionData = {
                        section,
                        rows: []
                    }
                    const rowsMap = [];
                    seats.filter((seat) => seat.section === section)
                        .forEach((seat) => {
                            if (rowsMap.indexOf(seat.position.row) === -1) {
                                rowsMap.push(seat.position.row);
                            }
                        })
                    rowsMap.forEach((row) => {
                        const rowData = {
                            row,
                            seats: seats.filter((seat) => seat.section === section && seat.position.row === row)
                        }
                        sectionData.rows.push(rowData)
                    });
                    result.push(sectionData);
                });
                console.log("DISPLAY => ", result);
                vm.data.seatsForDisplay = result;
            },
            bookSeat: () => {
                if (!vm.data.guestName) {
                    return alert("Guest name is required")
                }
                vm.data.isWaitingForSeat = true;
                adminService.bookSeat(vm.data.selectedFlight.id, vm.data.guestName)
                    .then(data => {
                        vm.data.requestId = data.request_id;
                        actions.poolingRequestDetail();
                    });
            },
            poolingRequestDetail: () => {
                adminService.getRequestDetail(vm.data.requestId)
                    .then(data => {
                        if (data.seatRequest.status === "waiting") {
                            $timeout(() => actions.poolingRequestDetail(), 3000)
                        } else {
                            vm.data.requestDetail = data.seatRequest;
                            vm.data.isWaitingForSeat = false;
                            actions.getFlightSeats();
                        }
                    });
            }
        }

        function activate() {
            // Resolve start-up logic
        }

        function onInit() {
            // Initialization logic that relies on bindings being present
            // should be put in this method, which is guarranteed to
            // always be called after the bindings have been assigned.
            actions.getMe();
            actions.getFlights();
        }

        vm.data = {
            isAuthenticated: false,
            flights: [],
            flightSeats: [],
            seatsForDisplay: [],
            selectedFlight: null,
            viewFlightMode: false,
            guestName: null,
            requestId: null,
            requestDetail: null,
            isWaitingForSeat: false
        }

        vm.actions = {
            getFlightSeats: actions.getFlightSeats,
            bookSeat: actions.bookSeat,
            login: actions.login,
            createNewFlight: actions.createNewFlight
        }


        
    }

})();