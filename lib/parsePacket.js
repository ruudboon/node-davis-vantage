//https://www.davisnet.com/support/weather/download/VantageSerialProtocolDocs_v261.pdf
var Parser = require('binary-parser').Parser;
var loopPacket = new Parser()
  .string('LOO', { length : 3 })
  .uint8('BarTrend')
  .uint8('PacketType')
  .uint16le('NextRec')
  .uint16le('Pressure')
  .uint16le('TempIn')
  .uint8('HumIn')
  .uint16('TempOut')
  .uint8('WindSpeed')
  .uint8('WindSpeed10Min')
  .uint16('WindDir')
  .string('ExtraTemps', { length : 7 })
  .string('SoilTemps', { length : 4 })
  .string('LeafTemps', { length : 4 })
  .uint8('HumOut')
  .string('HumExtra', { length : 7 })
  .uint16('RainRate')
  .uint8('UV')
  .uint16('SolarRad')
  .uint16('RainStorm')
  .uint16('StormStartDate')
  .uint16('RainDay')
  .uint16('RainMonth')
  .uint16('RainYear')
  .uint16('ETDay')
  .uint16('ETMonth')
  .uint16('ETYear')
  .string('SoilMoist', { length : 4 })
  .string('LeafWetness', { length : 4 })
  .uint8('AlarmIn')
  .uint8('AlarmRain')
  .string('AlarmOut', { length : 2 })
  .string('AlarmExTempHum', { length : 8 })
  .string('AlarmSoilLeaf', { length : 4 })
  .uint8('BatteryStatus')
  .uint16('BatteryVolts')
  .uint8('ForecastIcon')
  .uint8('ForecastRuleNo')
  .uint16('SunRise')
  .uint16('SunSet')
  .string('EOL', { length : 2 })
  .uint16('CRC');

function _convertPressure(value){
  return value / 1000;
}

function _convertFahrenheitToCelcius(value){
  console.log(value);
  return ((value/10) -32) / 1.8
}

/**
 * Signed byte that indicates the current 3-hour barometer trend. It
 * is one of these values:
 * -60 = Falling Rapidly = 196 (as an unsigned byte)
 * -20 = Falling Slowly = 236 (as an unsigned byte)
 * 0 = Steady
 * 20 = Rising Slowly
 * 60 = Rising Rapidly
 * 80 = ASCII "P" = Rev A firmware, no trend info is available
 * Any other value means that the Vantage does not have the 3
 * hours of bar data needed to determine the bar trend.
 * @param value
 */
function _convertBarTrend(value) {
  if (value == -60){
    return "Falling Rapidly";
  }
  if (value == -20){
    return "Falling Slowly";
  }
  if (value == 0){
    return "Steady";
  }
  if (value == 20){
    return "Rising Slowly";
  }
  if (value == 60){
    return "Rising Rapidly";
  }
  return "No trend info available";
}
/**
* Parse Davis Packet
*
* @param packet
*/
function parsePacket(packet) {
  var parsedPacket = loopPacket.parse(packet);
  var convertedPacket = {};
  for(var property in parsedPacket) {
    var value = parsedPacket[property];
    switch (property){
      case "BarTrend":
        value = _convertBarTrend(value);
        break;
      case "Pressure":
        value = _convertPressure(value);
        break;
      case "TempIn":
      case "TempOut":
        value = _convertFahrenheitToCelcius(value);
        break;
    }
    convertedPacket[property] = value;

  }

  console.log(convertedPacket);

  return parsedPacket;
}

module.exports = parsePacket;