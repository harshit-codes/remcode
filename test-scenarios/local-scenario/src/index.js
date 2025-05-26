/**
 * Sample application entry point for local testing
 * Used to validate remcode's local functionality
 */

const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from remcode local test scenario');
});

app.listen(port, () => {
  console.log(`Test application listening at http://localhost:${port}`);
});
