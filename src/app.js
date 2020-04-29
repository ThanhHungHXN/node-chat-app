const path = require('path');
const express = require('express');

const publicDirectoryPath = path.resolve(__dirname, '../public'); 

const app = express();

app.use(express.static(publicDirectoryPath));

module.exports = app;



