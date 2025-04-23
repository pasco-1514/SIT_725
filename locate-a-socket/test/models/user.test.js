// test/models/user.test.js
const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const db = require("../config/database");
const User = require("../../models/user");

describe("User Model Tests", function () {
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
    const user = new User({});

    // Validate the model
    const err = user.validateSync();

    // Check that validation errors exist for required fields
    expect(err.errors.name).to.exist;
    expect(err.errors.email).to.exist;
    expect(err.errors.password).to.exist;
  });

  it("should enforce email uniqueness", async function () {
    // Create first user
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    const user1 = new User(userData);
    await user1.save();

    // Try to create second user with same email
    const user2 = new User({
      name: "Another Test User",
      email: "test@example.com", // Same email
      password: "password456",
    });

    try {
      await user2.save();
      // If we reach here, the validation didn't fail
      expect.fail("Should have thrown a duplicate key error");
    } catch (error) {
      // Verify it's a duplicate key error
      expect(error.name).to.equal("MongoServerError");
      expect(error.code).to.equal(11000); // Duplicate key error code
    }
  });

  it("should create a user with valid data including vehicles", async function () {
    const userData = {
      name: "EV Owner",
      email: "evowner@example.com",
      password: "evpassword123",
      vehicles: [
        {
          make: "Tesla",
          model: "Model 3",
          year: 2023,
          range: 358,
          connectorTypes: ["Tesla", "CCS"],
        },
        {
          make: "Nissan",
          model: "Leaf",
          year: 2022,
          range: 212,
          connectorTypes: ["CHAdeMO"],
        },
      ],
    };

    const user = new User(userData);
    const savedUser = await user.save();

    // Verify that the user was saved correctly
    expect(savedUser.name).to.equal(userData.name);
    expect(savedUser.email).to.equal(userData.email);
    expect(savedUser.password).to.equal(userData.password);
    expect(savedUser.vehicles.length).to.equal(2);
    expect(savedUser.vehicles[0].make).to.equal("Tesla");
    expect(savedUser.vehicles[1].make).to.equal("Nissan");
  });

  it("should store favorite stations and saved routes", async function () {
    // Create a user
    const user = new User({
      name: "Route Planner",
      email: "planner@example.com",
      password: "plannerpass123",
    });

    // Save the user
    const savedUser = await user.save();

    // Create fake ObjectIds
    const stationId1 = new mongoose.Types.ObjectId();
    const stationId2 = new mongoose.Types.ObjectId();
    const routeId = new mongoose.Types.ObjectId();

    // Add favorite stations and a saved route
    savedUser.favoriteStations.push(stationId1);
    savedUser.favoriteStations.push(stationId2);
    savedUser.savedRoutes.push(routeId);

    // Save the updated user
    const updatedUser = await savedUser.save();

    // Verify favoriteStations and savedRoutes
    expect(updatedUser.favoriteStations.length).to.equal(2);
    expect(updatedUser.favoriteStations[0].toString()).to.equal(
      stationId1.toString()
    );
    expect(updatedUser.favoriteStations[1].toString()).to.equal(
      stationId2.toString()
    );
    expect(updatedUser.savedRoutes.length).to.equal(1);
    expect(updatedUser.savedRoutes[0].toString()).to.equal(routeId.toString());
  });
});
