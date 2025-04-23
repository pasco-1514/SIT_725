// test/run-tests.js

// This file can be used to run all tests or specific test groups
console.log("Running tests for Locate a Socket EV Charging Station Finder");

// Import model test files
console.log("Running model tests...");
require("./models/station.test.js");
require("./models/review.test.js");
require("./models/user.test.js");
require("./models/route.test.js");

// Import route test files
console.log("Running route tests...");
require("./routes/stationRoutes.test.js");
require("./routes/routeRoutes.test.js");
require("./routes/userRoutes.test.js");

// Import integration tests
console.log("Running integration tests...");
require("./integration/api.test.js");

console.log("All tests completed!");
