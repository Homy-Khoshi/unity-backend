require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');


/**
 *  Routes 
 */
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// CORS – allow your WebGL site to call the API with cookies
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,   
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// MongoDB connection
const mongoUser = encodeURIComponent(process.env.MONGODB_USER);
const mongoPass = encodeURIComponent(process.env.MONGODB_PASSWORD);
const mongoHost = process.env.MONGODB_HOST;
const mongoDb   = process.env.MONGODB_DATABASE;

let mongoUri;

if (mongoUser && mongoPass) {

  mongoUri = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}/${mongoDb}?authSource=admin`;
} else {

  mongoUri = `mongodb://${mongoHost}/${mongoDb}`;
}
// Sessions stored in MongoDB
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use(session({
  secret: process.env.NODE_SESSION_SECRET,  
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);


// Serve static files in production

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
