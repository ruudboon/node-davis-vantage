var EventEmitter = require('events');
var util = require('util');
var serialPort = require('serialport');

var serialPortUsed = false;
var availablePorts = [];
var constructor;
var timer;
var deviceAwake = false;

var parsePacket = require('./lib/parsePacket');
var debug = require('./lib/debug');
var config = require('./config/config.json');

function DavisReader(options) {
  if (typeof options !== 'object') {
    options = {};
  }

  debug.setDebugMode(options.debug);

  constructor = this;

  EventEmitter.call(this);

  // Either force a specific port or automatically discover it
  if (options && options.serialPort) {
    availablePorts[0] = options.serialPort;
    _setupSerialConnection();
  } else {
    serialPort.list(function (err, ports) {
      if (err) {
        throw new Error('Serialports could not be listed: ' + err);
      }

      debug.logAvailablePorts(ports);

      for (var i = 0; i < ports.length; i++) {
        availablePorts[i] = ports[i].comName;
      }

      _setupSerialConnection();
    });
  }
}

util.inherits(DavisReader, EventEmitter);

/**
 * Retrieve the name of the serial port being used
 */
DavisReader.prototype.getSerialPort = function () {
  return serialPortUsed;
};

module.exports = DavisReader;


/**
 * Setup serial port connection
 */
function _setupSerialConnection() {
  var port = availablePorts[0];

  debug.log('Trying to connect to Davis VUE via port: ' + port);

  // Open serial port connection
  var sp = new serialPort(port, config.serialPort);

  var received = '';

  sp.on('open', function () {
    debug.log('Serial connection established, waking up device.');
    sp.write('\n', function(err) {
      if (err) {
        return constructor.emit('Error on write: ', err.message);
      }
    });


    sp.on('data', function (data) {
      if (!deviceAwake){
        if (data.toString() === '\n\r'){
          debug.log('Device is awake');
          serialPortUsed = port;
          constructor.emit('connected', port);

          sp.write('LOOP 1000\n');
          return;
        }
      }
      debug.log("Received data, length:" + data.length);
      if (data.length == 100){
        // remove ack
        data = data.slice(1);
      }
      parsePacket(data);
    });
  });

  sp.on('error', function (error) {
    constructor.emit('error', error);

    // Reject this port if we haven't found the correct port yet
    if (!serialPortUsed) {
      _tryNextSerialPort();
    }
  });

  sp.on('close', function () {
    deviceAwake = false;
    constructor.emit('close');
  });
}
