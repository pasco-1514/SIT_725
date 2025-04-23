// test/models/review.test.js
const chai = require("chai");
const expect = chai.expect;
const mongoose = require("mongoose");
const db = require("../config/database");
const User = require("../../models/user");
const Station = require("../../models/station");
const Review = require("../../models/review");

describe("Review Model Tests", function () {
  let userId, stationId;

  // Connect to the test database before tests
  before(async function () {
    await db.connect();

    // Create a test user
    const user = new User({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
    });
    const savedUser = await user.save();
    userId = savedUser._id;

    // Create a test station
    const station = new Station({
      name: "Test Station",
      address: "123 Test St",
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
    });
    const savedStation = await station.save();
    stationId = savedStation._id;
  });

  // Clear the database after each test
  afterEach(async function () {
    // Only clear the reviews collection
    await mongoose.connection.collections.reviews.deleteMany({});
  });

  // Disconnect from the database after all tests
  after(async function () {
    await db.closeDatabase();
  });

  it("should throw validation error for missing required fields", function () {
    const review = new Review({});

    // Validate the model
    const err = review.validateSync();

    // Check that validation errors exist for required fields
    expect(err.errors.user).to.exist;
    expect(err.errors.station).to.exist;
    expect(err.errors.rating).to.exist;
    expect(err.errors.comment).to.exist;
  });

  it("should validate rating range (1-5)", function () {
    // Test rating below minimum
    const lowReview = new Review({
      user: userId,
      station: stationId,
      rating: 0, // Below minimum
      comment: "Test comment",
    });

    const lowErr = lowReview.validateSync();
    expect(lowErr.errors.rating).to.exist;

    // Test rating above maximum
    const highReview = new Review({
      user: userId,
      station: stationId,
      rating: 6, // Above maximum
      comment: "Test comment",
    });

    const highErr = highReview.validateSync();
    expect(highErr.errors.rating).to.exist;
  });

  it("should create a review with valid data", async function () {
    const reviewData = {
      user: userId,
      station: stationId,
      rating: 4,
      comment: "Great charging station with good amenities.",
    };

    const review = new Review(reviewData);
    const savedReview = await review.save();

    // Verify that the review was saved correctly
    expect(savedReview.user.toString()).to.equal(userId.toString());
    expect(savedReview.station.toString()).to.equal(stationId.toString());
    expect(savedReview.rating).to.equal(reviewData.rating);
    expect(savedReview.comment).to.equal(reviewData.comment);
  });

  it("should have timestamps when created", async function () {
    const review = new Review({
      user: userId,
      station: stationId,
      rating: 5,
      comment: "Fast charging and friendly staff!",
    });

    const savedReview = await review.save();

    // Verify that createdAt and updatedAt timestamps exist
    expect(savedReview.createdAt).to.exist;
    expect(savedReview.updatedAt).to.exist;
  });
});
