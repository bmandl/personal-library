'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var apiRoutes = require('./routes/api.js');
var fccTestingRoutes = require('./routes/fcctesting.js');
var runner = require('./test-runner');
var helmet = require('helmet');
var mongoose = require('mongoose');
require('dotenv').config();

var app = express();

app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));

const CONNECTION_STRING = process.env.DB;

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.on('ready', function () {
  app.listen(process.env.PORT || 3000, function () {
    console.log("Listening on port " + process.env.PORT);
    if (process.env.NODE_ENV === 'test') {
      console.log('Running Tests...');
      setTimeout(function () {
        try {
          runner.run();
        } catch (e) {
          var error = e;
          console.log('Tests are not valid:');
          console.log(error);
        }
      }, 3500);
    }
  })
});

mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on("error", function (err) {
  console.log(err);
})

mongoose.connection.once("open", function () {
  // All OK - fire (emit) a ready event.
  app.emit("ready");
});

// Close MongoDB connection
process.on('SIGINT', () => {
  db.close(() => {
    console.log(`Closing connection to ${dbName}`)
    process.exit(0)
  })
});

module.exports = app; //for unit/functional testing
