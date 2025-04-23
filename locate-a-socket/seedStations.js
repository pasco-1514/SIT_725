// Script to seed MongoDB with sample charging stations

const { MongoClient } = require("mongodb");

// Your MongoDB connection string (replace with your actual credential)
const uri =
  "mongodb+srv://kirokodev:Kiroko4732@evproject2.tfvdl.mongodb.net/locate-a-socket?retryWrites=true&w=majority&appName=EvProject2";
const client = new MongoClient(uri);

// Sample station data - Melbourne, Australia (coordinates in longitude, latitude format)
const sampleStations = [
  {
    name: "CBD Charging Hub",
    address: "123 Flinders St, Melbourne CBD",
    location: {
      type: "Point",
      coordinates: [144.9631, -37.8136], // [longitude, latitude] for Melbourne CBD
    },
    connectors: [
      { type: "CCS", power: 150, count: 4, available: 3 },
      { type: "CHAdeMO", power: 50, count: 2, available: 1 },
    ],
    amenities: {
      restroom: true,
      food: true,
      wifi: true,
      shopping: false,
    },
    network: "ChargeFox",
    status: "available",
    cost: "$0.40/kWh",
    averageRating: 4.5,
    lastUpdated: new Date(),
  },
  {
    name: "Southbank Charging Station",
    address: "45 Southbank Blvd, Southbank",
    location: {
      type: "Point",
      coordinates: [144.9659, -37.8223],
    },
    connectors: [
      { type: "CCS", power: 50, count: 4, available: 1 },
      { type: "Type2", power: 22, count: 3, available: 0 },
    ],
    amenities: {
      restroom: true,
      food: true,
      wifi: true,
      shopping: true,
    },
    network: "Evie Networks",
    status: "busy",
    cost: "$0.45/kWh",
    averageRating: 3.8,
    lastUpdated: new Date(),
  },
  {
    name: "St Kilda Beach Chargers",
    address: "10 Jacka Blvd, St Kilda",
    location: {
      type: "Point",
      coordinates: [144.9735, -37.8684],
    },
    connectors: [
      { type: "CCS", power: 50, count: 2, available: 0 },
      { type: "Type2", power: 22, count: 4, available: 0 },
    ],
    amenities: {
      restroom: false,
      food: false,
      wifi: false,
      shopping: false,
    },
    network: "ChargePoint",
    status: "offline",
    cost: "$0.38/kWh",
    averageRating: 3.2,
    lastUpdated: new Date(),
  },
  {
    name: "Richmond Superchargers",
    address: "42 Swan St, Richmond",
    location: {
      type: "Point",
      coordinates: [144.9898, -37.8245],
    },
    connectors: [{ type: "Tesla", power: 250, count: 10, available: 8 }],
    amenities: {
      restroom: true,
      food: false,
      wifi: true,
      shopping: false,
    },
    network: "Tesla",
    status: "available",
    cost: "$0.35/kWh",
    averageRating: 4.8,
    lastUpdated: new Date(),
  },
  {
    name: "Fitzroy Shopping Centre",
    address: "123 Brunswick St, Fitzroy",
    location: {
      type: "Point",
      coordinates: [144.9788, -37.8025],
    },
    connectors: [
      { type: "CCS", power: 150, count: 3, available: 2 },
      { type: "CHAdeMO", power: 100, count: 2, available: 1 },
    ],
    amenities: {
      restroom: true,
      food: true,
      wifi: true,
      shopping: true,
    },
    network: "AmpCharge",
    status: "available",
    cost: "$0.42/kWh",
    averageRating: 4.2,
    lastUpdated: new Date(),
  },
  {
    name: "Melbourne Airport EV Hub",
    address: "Terminal 2, Melbourne Airport",
    location: {
      type: "Point",
      coordinates: [144.8433, -37.6698],
    },
    connectors: [
      { type: "CCS", power: 350, count: 6, available: 4 },
      { type: "CHAdeMO", power: 100, count: 2, available: 2 },
      { type: "Type2", power: 22, count: 8, available: 3 },
    ],
    amenities: {
      restroom: true,
      food: true,
      wifi: true,
      shopping: true,
    },
    network: "Chargefox",
    status: "available",
    cost: "$0.39/kWh",
    averageRating: 4.6,
    lastUpdated: new Date(),
  },
  {
    name: "Carlton Gardens Chargers",
    address: "1 Rathdowne St, Carlton",
    location: {
      type: "Point",
      coordinates: [144.9717, -37.8077],
    },
    connectors: [{ type: "Type2", power: 22, count: 4, available: 2 }],
    amenities: {
      restroom: false,
      food: false,
      wifi: false,
      shopping: false,
    },
    network: "Jolt",
    status: "available",
    cost: "Free (First 7kWh)",
    averageRating: 4.0,
    lastUpdated: new Date(),
  },
];

async function seedDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("locate-a-socket");
    const stationsCollection = db.collection("stations");

    // Delete existing stations
    await stationsCollection.deleteMany({});
    console.log("Cleared existing stations");

    // Insert sample stations
    const result = await stationsCollection.insertMany(sampleStations);
    console.log(`${result.insertedCount} stations inserted`);

    // Create a geospatial index for location-based queries
    await stationsCollection.createIndex({ location: "2dsphere" });
    console.log("Created geospatial index");

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

seedDatabase();
