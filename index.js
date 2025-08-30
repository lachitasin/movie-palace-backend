const express = require('express');
const cors = require('cors');

const app = express();

// Allowed domains
const allowedOrigins = [
  "https://www.movieflims.com",
  "https://movieflims.com",
  "https://www.streaminhub.com",
  "https://streaminhub.com",
  "https://watch.movieflims.co",
  "https://watch.movieflims.com"
];

// ✅ CORS setup
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow curl / mobile apps

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Backend Access Key check (separate from TMDB API_KEY)
app.use((req, res, next) => {
  const accessKey = req.headers['x-access-key']; // custom header
  const validKey = process.env.ACCESS_KEY || "my-backend-secret"; // set in Railway ENV
  const origin = req.headers.origin;

  if (!accessKey || accessKey !== validKey) {
    return res.status(403).json({ error: "Forbidden: Invalid Access Key" });
  }

  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden: Origin not allowed" });
  }

  next();
});

// ✅ HTTPS redirect (for production)
let https_redirect = function (req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] != 'https') {
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
