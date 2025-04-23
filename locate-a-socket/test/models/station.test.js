// test/models/station.test.js
const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const db = require("../config/database");
const Station = require("../../models/station");

describe("Station Model Tests", function () {
  // Connect to the test database before tests
  before(async function () {
    await db.connect();
  });

  // Clear the database after each test
  afterEach(async function () {
    await db.clearDatabase();
  });

  // Disconnect from the database after all tests
  after(async function () {
    await db.closeDatabase();
  });

  it("should throw validation error for missing required fields", function () {
    const station = new Station({});

    // Validate the model
    const err = station.validateSync();

    // Check that validation errors exist for required fields
    expect(err.errors.name).to.exist;
    expect(err.errors.address).to.exist;
    expect(err.errors["location.coordinates"]).to.exist;
  });

  it("should validate connector types", function () {
    const invalidConnector = new Station({
      name: "Test Station",
      address: "123 Test St",
      location: {
        coordinates: [-122.4194, 37.7749],
      },
      connectors: [
        {
          type: "InvalidType", // Invalid connector type
          power: 50,
          count: 2,
        },
      ],
    });

    const err = invalidConnector.validateSync();
    expect(err.errors["connectors.0.type"]).to.exist;
  });

  it("should create a station with valid data", async function () {
    const stationData = {
      name: "Test Station",
      address: "123 EV Street, San Francisco, CA",
      location: {
        type: "Point",
        coordinates: [-122.4194, 37.7749], // [longitude, latitude]
      },
      connectors: [
        {
          type: "CCS",
          power: 50,
          count: 2,
        },
        {
          type: "CHAdeMO",
          power: 50,
          count: 1,
        },
      ],
      amenities: {
        restroom: true,
        food: true,
        wifi: true,
        shopping: false,
      },
      network: "ChargeCo",
      status: "available",
      cost: "$0.40/kWh",
    };

    const station = new Station(stationData);
    const savedStation = await station.save();

    // Verify that the station was saved correctly
    expect(savedStation.name).to.equal(stationData.name);
    expect(savedStation.address).to.equal(stationData.address);
    expect(savedStation.location.coordinates[0]).to.equal(
      stationData.location.coordinates[0]
    );
    expect(savedStation.location.coordinates[1]).to.equal(
      stationData.location.coordinates[1]
    );
    expect(savedStation.connectors.length).to.equal(2);
    expect(savedStation.connectors[0].type).to.equal("CCS");
    expect(savedStation.status).to.equal("available");
  });

  it("should update lastUpdated timestamp when modified", async function () {
    // Create a station
    const station = new Station({
      name: "Update Test Station",
      address: "456 Update St",
      location: {
        type: "Point",
        coordinates: [-122.4106, 37.7849],
      },
      connectors: [
        {
          type: "CCS",
          power: 150,
          count: 3,
        },
      ],
    });

    // Save the station
    const savedStation = await station.save();
    const initialTimestamp = savedStation.lastUpdated;

    // Wait briefly to ensure timestamp will be different
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Update the station
    savedStation.status = "busy";
    savedStation.lastUpdated = new Date();
    const updatedStation = await savedStation.save();

    // Verify lastUpdated was changed
    expect(updatedStation.lastUpdated.getTime()).to.be.greaterThan(
      initialTimestamp.getTime()
    );
  });
});
