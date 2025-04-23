# SIT725 Task 2.2P - Express Web Server

This project demonstrates the implementation of a simple Express web server with a calculator API. The server provides both GET and POST endpoints for performing calculations.

## Features

- Simple web server using Express.js
- Static file serving from the 'public' directory
- GET endpoint for adding two numbers
- POST endpoint for performing various calculator operations (addition, subtraction, multiplication, division)
- User-friendly web interface

## Installation

1. Clone the repository:

```bash
git clone <your-repository-url>
```

2. Navigate to the project directory:

```bash
cd sit725-task-2.2p
```

3. Install dependencies:

```bash
npm install
```

## Usage

1. Start the server:

```bash
node server.js
```

2. Open your browser and go to:

```
http://localhost:3000
```

3. Use the web interface to perform calculations using either GET or POST methods.

## API Endpoints

### GET /api/add

Adds two numbers provided as query parameters.

Example:

```
GET /api/add?num1=5&num2=3
```

Response:

```json
{
  "num1": 5,
  "num2": 3,
  "operation": "addition",
  "result": 8
}
```

### POST /api/calculate

Performs a calculation based on the provided operation.

Request body:

```json
{
  "num1": 10,
  "num2": 5,
  "operation": "multiply"
}
```

Response:

```json
{
  "num1": 10,
  "num2": 5,
  "operation": "multiply",
  "result": 50
}
```

Available operations:

- `add`: Addition
- `subtract`: Subtraction
- `multiply`: Multiplication
- `divide`: Division

## Project Structure

```
.
├── server.js          # Main server file
├── package.json       # Node.js package configuration
├── public/            # Static files directory
│   └── index.html     # Web interface
└── README.md          # Project documentation
```

## Dependencies

- Express.js - Fast, unopinionated, minimalist web framework for Node.js

## License

This project is for educational purposes as part of SIT725 at Deakin University.
