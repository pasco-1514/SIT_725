// test/models/route.test.js
const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const db = require("../config/database");
const Route = require("../../models/route");
const User = require("../../models/user");
const Station = require("../../models/station");

describe("Route Model Tests", function () {
  let userId, stationId;

  // Connect to the test database before tests
  before(async function () {
    await db.connect();

    // Create a test user
    const user = new User({
      name: "Route User",
      email: "routeuser@example.com",
      password: "routepass123",
    });
    const savedUser = await user.save();
    userId = savedUser._id;

    // Create a test station
    const station = new Station({
      name: "Route Test Station",
      address: "789 Route St",
      location: {
        type: "Point",
        coordinates: [-121.8947, 37.3382],
      },
      connectors: [
        {
          type: "CCS",
          power: 150,
          count: 4,
        },
      ],
    });
    const savedStation = await station.save();
    stationId = savedStation._id;
  });

  // Clear the database after each test
  afterEach(async function () {
    // Only clear the routes collection
    await mongoose.connection.collections.routes.deleteMany({});
  });

  // Disconnect from the database after all tests
  after(async function () {
    await db.closeDatabase();
  });

  it("should throw validation error for missing required fields", function () {
    const route = new Route({});

    // Validate the model
    const err = route.validateSync();

    // Check that validation errors exist for required fields
    expect(err.errors.name).to.exist;
  });

  it("should create a route with valid data", async function () {
    const routeData = {
      user: userId,
      name: "San Francisco to Los Angeles",
      startPoint: {
        name: "San Francisco",
        coordinates: [-122.4194, 37.7749],
      },
      endPoint: {
        name: "Los Angeles",
        coordinates: [-118.2437, 34.0522],
      },
      totalDistance: 608,
      totalDuration: 360,
      chargingStops: [
        {
          station: stationId,
          arrivalBattery: 30,
          chargeDuration: 25,
          departBattery: 80,
        },
      ],
    };

    const route = new Route(routeData);
    const savedRoute = await route.save();

    // Verify that the route was saved correctly
    expect(savedRoute.name).to.equal(routeData.name);
    expect(savedRoute.startPoint.name).to.equal(routeData.startPoint.name);
    expect(savedRoute.endPoint.name).to.equal(routeData.endPoint.name);
    expect(savedRoute.totalDistance).to.equal(routeData.totalDistance);
    expect(savedRoute.totalDuration).to.equal(routeData.totalDuration);
    expect(savedRoute.chargingStops.length).to.equal(1);
    expect(savedRoute.chargingStops[0].station.toString()).to.equal(
      stationId.toString()
    );
    expect(savedRoute.chargingStops[0].arrivalBattery).to.equal(30);
  });

  it("should validate coordinates format for points", function () {
    // Test with invalid coordinates (string instead of number)
    const routeWithInvalidCoords = new Route({
      name: "Invalid Route",
      startPoint: {
        name: "Start Point",
        coordinates: ["invalid", "coordinates"], // Should be numbers
      },
      endPoint: {
        name: "End Point",
        coordinates: [-118.2437, 34.0522], // Valid coordinates
      },
    });

    const err = routeWithInvalidCoords.validateSync();
    expect(err.errors["startPoint.coordinates.0"]).to.exist;
  });

  it("should have timestamps when created", async function () {
    const route = new Route({
      user: userId,
      name: "Trip with Timestamps",
      startPoint: {
        name: "Origin",
        coordinates: [-120.1, 38.5],
      },
      endPoint: {
        name: "Destination",
        coordinates: [-119.2, 37.8],
      },
      totalDistance: 150,
      totalDuration: 120,
    });

    const savedRoute = await route.save();

    // Verify that createdAt and updatedAt timestamps exist
    expect(savedRoute.createdAt).to.exist;
    expect(savedRoute.updatedAt).to.exist;
  });
});
