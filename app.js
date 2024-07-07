const express = require('express');
const dotenv = require('dotenv');
const app = express();
const port = 6000;

dotenv.config({ path: './config.env' });

app.get('/', function(req, res) {
  res.send("Hello, world!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});