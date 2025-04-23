const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Basic route for the home page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// API endpoint to add two numbers (GET method)
app.get("/api/add", (req, res) => {
  // Get numbers from query parameters
  const num1 = parseFloat(req.query.num1);
  const num2 = parseFloat(req.query.num2);

  // Validate input
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).json({
      error: "Invalid input. Please provide valid numbers.",
    });
  }

  // Calculate sum
  const sum = num1 + num2;

  // Return result
  res.json({
    num1: num1,
    num2: num2,
    operation: "addition",
    result: sum,
  });
});

// POST method for addition
app.post("/api/calculate", (req, res) => {
  // Get numbers and operation from request body
  const { num1, num2, operation } = req.body;

  // Validate input
  if (isNaN(parseFloat(num1)) || isNaN(parseFloat(num2))) {
    return res.status(400).json({
      error: "Invalid input. Please provide valid numbers.",
    });
  }

  let result;

  // Perform calculation based on operation
  switch (operation) {
    case "add":
      result = parseFloat(num1) + parseFloat(num2);
      break;
    case "subtract":
      result = parseFloat(num1) - parseFloat(num2);
      break;
    case "multiply":
      result = parseFloat(num1) * parseFloat(num2);
      break;
    case "divide":
      if (parseFloat(num2) === 0) {
        return res
          .status(400)
          .json({ error: "Division by zero is not allowed" });
      }
      result = parseFloat(num1) / parseFloat(num2);
      break;
    default:
      return res
        .status(400)
        .json({
          error: "Invalid operation. Use add, subtract, multiply, or divide",
        });
  }

  // Return result
  res.json({
    num1: parseFloat(num1),
    num2: parseFloat(num2),
    operation: operation,
    result: result,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
