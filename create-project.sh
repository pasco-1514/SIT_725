#!/bin/bash

# Create main project directory
mkdir -p locate-a-socket

# Change to project directory
cd locate-a-socket

# Create directory structure
mkdir -p public/css
mkdir -p public/js
mkdir -p public/img/icons
mkdir -p views/partials

# Create empty files
touch public/css/materialize.min.css
touch public/css/style.css
touch public/js/materialize.min.js
touch public/js/main.js
touch public/img/logo.png
touch views/index.ejs
touch views/map.ejs
touch views/profile.ejs
touch views/partials/header.ejs
touch views/partials/footer.ejs
touch views/partials/navbar.ejs
touch app.js
touch package.json

# Create a basic package.json content
cat > package.json << 'EOF'
{
  "name": "locate-a-socket",
  "version": "1.0.0",
  "description": "An application to locate charging stations",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# Create a basic Express server setup
cat > app.js << 'EOF'
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/map', (req, res) => {
  res.render('map');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

echo "Directory structure for locate-a-socket has been created successfully!"
echo "Run 'npm install' to install dependencies."