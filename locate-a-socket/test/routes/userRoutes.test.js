// test/routes/userRoutes.test.js
const chai = require("chai");
const expect = chai.expect;
const express = require("express");
const request = require("supertest");

// Import the router directly
const userRoutes = require("../../routes/userRoutes");

describe("User Routes Tests", function () {
  let app;

  beforeEach(function () {
    // Create a minimal Express app for testing
    app = express();
    app.use(express.json());

    // Use the router
    app.use("/api/users", userRoutes);
  });

  describe("GET /api/users/profile", function () {
    it("should return a user profile message", async function () {
      // Make the request
      const res = await request(app).get("/api/users/profile");

      // Assertions
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property(
        "message",
        "This will return user profile"
      );
    });
  });

  describe("POST /api/users/register", function () {
    it("should return a registration message", async function () {
      // User data
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      // Make the request
      const res = await request(app).post("/api/users/register").send(userData);

      // Assertions
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property(
        "message",
        "This will register a new user"
      );
    });
  });

  describe("POST /api/users/login", function () {
    it("should return a login message", async function () {
      // Login data
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      // Make the request
      const res = await request(app).post("/api/users/login").send(loginData);

      // Assertions
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "This will login a user");
    });
  });
});
