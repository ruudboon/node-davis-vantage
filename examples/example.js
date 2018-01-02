var DavisVantage = require('../main');

var config = {};

// Enable Debug Mode by uncommenting the line below
config.debug = true;

config.serialPort = '/dev/ttyUSB0';

var davisReader = new DavisVantage(config);

davisReader.on('reading-raw', function(data) {
  // If you are interested in viewing the unparsed data that was received at the serial port uncomment the line below
  // console.log(data);
});

davisReader.on('data', function(data) {
  console.log(data);
});

davisReader.on('error', function(error) {
  console.log(error);
});

davisReader.on('close', function() {
  console.log('Connection closed');
});

// Handle all uncaught errors without crashing
process.on('uncaughtException', function(error) {
  console.error(error);
});
