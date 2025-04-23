// server.js
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static("public"));

// Basic route for the home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Simple API endpoint that returns the current date and time
app.get("/api/time", (req, res) => {
  res.json({
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
  });
});

// Calculate API - demonstrates basic math operations
app.get("/api/calculate", (req, res) => {
  const { num1, num2, operation } = req.query;

  // Convert string inputs to numbers
  const a = parseFloat(num1);
  const b = parseFloat(num2);

  let result;

  switch (operation) {
    case "add":
      result = a + b;
      break;
    case "subtract":
      result = a - b;
      break;
    case "multiply":
      result = a * b;
      break;
    case "divide":
      result = b !== 0 ? a / b : "Cannot divide by zero";
      break;
    default:
      result = "Invalid operation";
  }

  res.json({ result });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
