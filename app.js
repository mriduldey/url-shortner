const express = require('express');
const { nanoid } = require('nanoid');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');
const path = require('path');

// Local imports

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.get('/', async (req, res, next) => {
  res.render('index');
});

app.post('/', async (req, res, next) => {
  res.send('url posted');
});

app.listen(3000, () => console.log('Server started on port 3000'));
