// npm node_modules
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');

const keys = require('./config/keys');
// const models = require('./models');
// const schema = require('./schema/schema');

//models
require('./models/User');
// require('./models/Survey');

//services
require('./services/passport');

// initial testing line
// const authRoutes = require("./routes/authRoutes");
mongoose.Promise = global.Promise;
mongoose.connect(keys.MONGO_URI, { useMongoClient: true });
const app = express();

// memorize this, any POST or PUT or PATCH goes to EXPRESS
// EXPRESS is too stupid, needs this to put this into the req.body
//  specificlaly:  REQ.BODY has it
app.use(bodyParser.json());
app.use(cors());
// this is the magic triggering language that causes the serialize and cookie things to work like rails
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.COOKIE_KEY]
  })
);
mongoose.connection
  .once('open', () => console.log('---Connected to MongoLab instance.---'))
  .on('error', error => console.log('---Error connecting to MongoLab:', error));

app.use(passport.initialize());
app.use(passport.session());
app.use(
  '/graphql',
  expressGraphQL({
    schema,
    graphiql: true
  })
);

// add routes to the app instance
require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);
require('./routes/marketRoutes')(app);
require('./routes/testRoutes')(app);
require('./routes/surveyRoutes')(app);

if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static('client/build'));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
// app.listen(5001);
