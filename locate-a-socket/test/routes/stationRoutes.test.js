// test/routes/stationRoutes.test.js
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const { ObjectId } = require("mongodb");
const express = require("express");
const request = require("supertest");

// Import the router directly
const stationRoutes = require("../../routes/stationRoutes");

describe("Station Routes Tests", function () {
  let app, mockDb, mockCollection, findStub, findOneStub, toArrayStub;

  beforeEach(function () {
    // Create a minimal Express app for testing
    app = express();

    // Setup mock DB and collection
    toArrayStub = sinon.stub().resolves([]);
    findStub = sinon.stub().returns({ toArray: toArrayStub });
    findOneStub = sinon.stub().resolves(null);

    mockCollection = {
      find: findStub,
      findOne: findOneStub,
    };

    mockDb = {
      collection: sinon.stub().returns(mockCollection),
    };

    // Set the mock DB on app.locals
    app.locals.db = mockDb;

    // Use the router
    app.use("/api/stations", stationRoutes);
  });

  afterEach(function () {
    // Restore all stubs
    sinon.restore();
  });

  describe("GET /api/stations", function () {
    it("should return all stations", async function () {
      // Setup mock data
      const mockStations = [
        { _id: "1", name: "Station 1" },
        { _id: "2", name: "Station 2" },
      ];

      // Setup the mock to return our test data
      toArrayStub.resolves(mockStations);

      // Make the request
      const res = await request(app).get("/api/stations");

      // Assertions
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(mockStations);
      expect(mockDb.collection.calledWith("stations")).to.be.true;
      expect(findStub.calledOnce).to.be.true;
    });

    it("should return 503 when database is not available", async function () {
      // Remove the db from app.locals
      delete app.locals.db;

      // Make the request
      const res = await request(app).get("/api/stations");

      // Assertions
      expect(res.status).to.equal(503);
      expect(res.body).to.have.property(
        "message",
        "Database connection not available"
      );
    });
  });

  describe("GET /api/stations/nearby", function () {
    it("should return nearby stations within specified radius", async function () {
      // Setup mock data
      const mockNearbyStations = [
        {
          _id: "1",
          name: "Nearby Station 1",
          location: {
            type: "Point",
            coordinates: [-122.4194, 37.7749],
          },
        },
      ];

      // Setup the mock to return our test data
      toArrayStub.resolves(mockNearbyStations);

      // Make the request with query parameters
      const res = await request(app)
        .get("/api/stations/nearby")
        .query({ lat: "37.7749", lng: "-122.4194", radius: "5" });

      // Assertions
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal(mockNearbyStations);
      expect(mockDb.collection.calledWith("stations")).to.be.true;
      expect(findStub.calledOnce).to.be.true;

      // Verify that the query includes the correct geo parameters
      const findArgs = findStub.args[0][0];
      expect(findArgs).to.have.nested.property(
        "location.$nearSphere.$geometry.type",
        "Point"
      );
      expect(findArgs).to.have.nested.property(
        "location.$nearSphere.$geometry.coordinates[0]",
        -122.4194
      );
      expect(findArgs).to.have.nested.property(
        "location.$nearSphere.$geometry.coordinates[1]",
        37.7749
      );
      expect(findArgs).to.have.nested.property(
        "location.$nearSphere.$maxDistance",
        5000
      );
    });

    it("should return 400 when lat/lng are missing", async function () {
      // Make the request without lat/lng
      const res = await request(app)
        .get("/api/stations/nearby")
        .query({ radius: "5" });

      // Assertions
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property(
        "message",
        "Latitude and longitude are required"
      );
    });
  });

  describe("GET /api/stations/:id", function () {
    it("should return a specific station by ID", async function () {
      // Create a test ObjectId as a string
      const testId = new ObjectId().toString();

      // Setup mock data with string _id to match what Express will return
      const mockStation = {
        _id: testId,
        name: "Test Station",
        address: "123 Test St",
      };

      // Setup the mock to return our test data
      findOneStub.resolves(mockStation);

      // Make the request
      const res = await request(app).get(`/api/stations/${testId}`);

      // Assertions
      expect(res.status).to.equal(200);

      // Check specific properties instead of doing a deep equal
      expect(res.body.name).to.equal(mockStation.name);
      expect(res.body.address).to.equal(mockStation.address);
      expect(res.body._id).to.equal(testId);

      expect(mockDb.collection.calledWith("stations")).to.be.true;
      expect(findOneStub.calledOnce).to.be.true;

      // Verify that the findOne query included the correct ObjectId
      const findOneArg = findOneStub.args[0][0];
      expect(findOneArg._id.toString()).to.equal(testId);
    });

    it("should return 404 when station is not found", async function () {
      // Setup the mock to return null (not found)
      findOneStub.resolves(null);

      // Make the request with a valid ObjectId that doesn't exist
      const nonExistentId = new ObjectId();
      const res = await request(app).get(`/api/stations/${nonExistentId}`);

      // Assertions
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message", "Station not found");
    });
  });
});
