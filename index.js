// app.js
require('dotenv').config(); // load .env for local dev

const express = require('express');
const cors = require('cors');

const app = express();

// ✅ CORS (allow all since you're using API directly)
app.use(cors());

// ✅ Backend Access Key check
app.use((req, res, next) => {
  const accessKey = req.headers['x-access-key'] || req.query.ACCESS_KEY;
  const validKey = process.env.ACCESS_KEY; // only from env

  if (!accessKey || accessKey !== validKey) {
    return res.status(403).json({ error: "Forbidden: Invalid Access Key" });
  }

  next();
});

// ✅ HTTPS redirect (for production)
let https_redirect = function (req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
  }
  return next();
};
app.use(https_redirect);

// ✅ Routes
const indexRoute = require('./routes/home');
const searchRoute = require('./routes/search');
const singleMovieRoute = require('./routes/movie');
const singleTvShowRoute = require('./routes/tv');
const moviesRoute = require('./routes/movies');
const tvShowsRoute = require('./routes/tv-shows');
const suggestionsRoute = require('./routes/suggestions');

app.use('/search', searchRoute);
app.use('/movie', singleMovieRoute);
app.use('/movies', moviesRoute);
app.use('/tv', singleTvShowRoute);
app.use('/tv-shows', tvShowsRoute);
app.use('/suggestions', suggestionsRoute);
app.use('/', indexRoute);

// ✅ Server listen
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), () => {
  console.log(`✅ Server started on port ${app.get('port')}`);
});
