// test/routes/routeRoutes.test.js
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const { ObjectId } = require("mongodb");
const express = require("express");
const request = require("supertest");

// Import the router directly - note: this assumes the file is actually stationRoutes.js based on content
const stationRoutes = require("../../routes/routeRoutes");

describe("Station Routes (from routeRoutes.js) Tests", function () {
  let app, mockDb, mockCollection, insertOneStub, updateOneStub, deleteOneStub;

  beforeEach(function () {
    // Create a minimal Express app for testing
    app = express();
    app.use(express.json());

    // Setup mock DB and collection
    insertOneStub = sinon.stub().resolves({ insertedId: new ObjectId() });
    updateOneStub = sinon
      .stub()
      .resolves({ matchedCount: 1, modifiedCount: 1 });
    deleteOneStub = sinon.stub().resolves({ deletedCount: 1 });

    mockCollection = {
      insertOne: insertOneStub,
      updateOne: updateOneStub,
      deleteOne: deleteOneStub,
      // Add the stubs from previous test as they're still used in this router
      find: sinon.stub().returns({ toArray: sinon.stub().resolves([]) }),
      findOne: sinon.stub().resolves(null),
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

  describe("POST /api/stations", function () {
    it("should create a new station with valid data", async function () {
      // Valid station data
      const stationData = {
        name: "New Test Station",
        address: "123 New St",
        location: {
          type: "Point",
          coordinates: [-122.4194, 37.7749],
        },
        connectors: [
          {
            type: "CCS",
            power: 50,
            count: 2,
          },
        ],
      };

      // Make the request
      const res = await request(app).post("/api/stations").send(stationData);

      // Assertions
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property(
        "message",
        "Station created successfully"
      );
      expect(res.body).to.have.property("id");
      expect(mockDb.collection.calledWith("stations")).to.be.true;
      expect(insertOneStub.calledOnce).to.be.true;

      // Verify that we correctly passed the station data with lastUpdated timestamp
      const insertedData = insertOneStub.args[0][0];
      expect(insertedData.name).to.equal(stationData.name);
      expect(insertedData.address).to.equal(stationData.address);
      expect(insertedData.lastUpdated).to.exist;
    });

    it("should return 400 when required fields are missing", async function () {
      // Missing required fields
      const invalidData = {
        name: "Incomplete Station",
        // missing address, location, connectors
      };

      // Make the request
      const res = await request(app).post("/api/stations").send(invalidData);

      // Assertions
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message", "Missing required fields");
      expect(insertOneStub.called).to.be.false;
    });

    it("should return 400 when location format is invalid", async function () {
      // Invalid location format
      const invalidLocationData = {
        name: "Invalid Location Station",
        address: "123 Invalid St",
        location: {
          // missing type
          coordinates: [-122.4194], // incomplete coordinates
        },
        connectors: [
          {
            type: "CCS",
            power: 50,
            count: 2,
          },
        ],
      };

      // Make the request
      const res = await request(app)
        .post("/api/stations")
        .send(invalidLocationData);

      // Assertions
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property(
        "message",
        "Location must be a GeoJSON Point"
      );
      expect(insertOneStub.called).to.be.false;
    });
  });

  describe("PATCH /api/stations/:id", function () {
    it("should update a station successfully", async function () {
      // Test ID and update data
      const testId = new ObjectId();
      const updateData = {
        name: "Updated Station Name",
        status: "busy",
      };

      // Make the request
      const res = await request(app)
        .patch(`/api/stations/${testId}`)
        .send(updateData);

      // Assertions
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property(
        "message",
        "Station updated successfully"
      );
      expect(res.body).to.have.property("modifiedCount", 1);
      expect(mockDb.collection.calledWith("stations")).to.be.true;
      expect(updateOneStub.calledOnce).to.be.true;

      // Verify update operation
      const updateArgs = updateOneStub.args[0];
      expect(updateArgs[0]._id.toString()).to.equal(testId.toString());
      expect(updateArgs[1].$set.name).to.equal(updateData.name);
      expect(updateArgs[1].$set.status).to.equal(updateData.status);
      expect(updateArgs[1].$set.lastUpdated).to.exist;
    });

    it("should return 404 when station to update is not found", async function () {
      // Setup stub to return no matches
      updateOneStub.resolves({ matchedCount: 0, modifiedCount: 0 });

      // Test ID and update data
      const nonExistentId = new ObjectId();
      const updateData = {
        name: "Non-existent Station Update",
      };

      // Make the request
      const res = await request(app)
        .patch(`/api/stations/${nonExistentId}`)
        .send(updateData);

      // Assertions
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message", "Station not found");
    });
  });

  describe("DELETE /api/stations/:id", function () {
    it("should delete a station successfully", async function () {
      // Test ID
      const testId = new ObjectId();

      // Make the request
      const res = await request(app).delete(`/api/stations/${testId}`);

      // Assertions
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property(
        "message",
        "Station deleted successfully"
      );
      expect(mockDb.collection.calledWith("stations")).to.be.true;
      expect(deleteOneStub.calledOnce).to.be.true;

      // Verify delete operation
      const deleteArgs = deleteOneStub.args[0][0];
      expect(deleteArgs._id.toString()).to.equal(testId.toString());
    });

    it("should return 404 when station to delete is not found", async function () {
      // Setup stub to return no deletions
      deleteOneStub.resolves({ deletedCount: 0 });

      // Test ID
      const nonExistentId = new ObjectId();

      // Make the request
      const res = await request(app).delete(`/api/stations/${nonExistentId}`);

      // Assertions
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message", "Station not found");
    });
  });
});
