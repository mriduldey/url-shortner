const express = require('express');
const { nanoid } = require('nanoid');
const createHttpError = require('http-errors');
const mongoose = require('mongoose');
const path = require('path');
const { env } = process;

// Local imports
const ShortUrl = require('./models/url.model');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const uri = `mongodb+srv://${env.username}:${env.password}@urlshortener.efmey.mongodb.net/${env.database}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(err.message));

app.set('view engine', 'ejs');

app.get('/', async (req, res, next) => {
  res.render('index');
});

app.post('/', async (req, res, next) => {
  try {
    const { url } = req.body;
    const { baseUrl } = req;
    if (!url) {
      console.log('no url');
      throw createHttpError.BadRequest('Provide a valid url');
    }
    const urlExists = await ShortUrl.findOne({ url });
    if (urlExists) {
      res.render('index', { shortUrl: `${baseUrl}/${urlExists.shortId}` });
      return;
    }

    const shortUrl = new ShortUrl({ url, shortId: nanoid(12) });
    const result = await shortUrl.save();
    res.render('index', { shortUrl: `${baseUrl}/${urlExists.shortId}` });
  } catch (err) {
    next(err);
  }
});

app.get('/:shortId', async (req, res, next) => {
  try {
    const { shortId } = req.params;
    const result = await ShortUrl.findOne({ shortId });
    if (!result) {
      throw createHttpError.NotFound('Short URL does not exist');
    }
    res.redirect(result.url);
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => next(createHttpError.NotFound()));

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('index', { error: err.message });
});

const PORT = env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
