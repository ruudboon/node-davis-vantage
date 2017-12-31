//https://www.davisnet.com/support/weather/download/VantageSerialProtocolDocs_v261.pdf
var Parser = require('binary-parser').Parser;
var Convert = require('convert-units');
var loopPacket = new Parser()
  .string('LOO', { length : 3 })
  .uint8('BarTrend')
  .uint8('PacketType')
  .uint16le('NextRec')
  .uint16le('Pressure')
  .uint16le('TempIn')
  .uint8('HumIn')
  .uint16le('TempOut')
  .uint8('WindSpeed')
  .uint8('WindSpeed10Min')
  .uint16le('WindDir')
  .uint8('ExtraTemps0')
  .uint8('ExtraTemps1')
  .uint8('ExtraTemps2')
  .uint8('ExtraTemps3')
  .uint8('ExtraTemps4')
  .uint8('ExtraTemps5')
  .uint8('ExtraTemps6')
  .uint8('SoilTemps0')
  .uint8('SoilTemps1')
  .uint8('SoilTemps2')
  .uint8('SoilTemps3')
  .uint8('LeafTemps0')
  .uint8('LeafTemps1')
  .uint8('LeafTemps2')
  .uint8('LeafTemps3')
  .uint8('HumOut')
  .uint8('HumExtra0')
  .uint8('HumExtra1')
  .uint8('HumExtra2')
  .uint8('HumExtra3')
  .uint8('HumExtra4')
  .uint8('HumExtra5')
  .uint8('HumExtra6')
  .uint16le('RainRate')
  .uint8('UV')
  .uint16le('SolarRad')
  .uint16le('RainStorm')
  .uint16le('StormStartDate')
  .uint16le('RainDay')
  .uint16le('RainMonth')
  .uint16le('RainYear')
  .uint16le('ETDay')
  .uint16le('ETMonth')
  .uint16le('ETYear')
  .uint8('SoilMoist0')
  .uint8('SoilMoist1')  
  .uint8('SoilMoist2')
  .uint8('SoilMoist3')  
  .uint8('LeafWetness0')
  .uint8('LeafWetness1')
  .uint8('LeafWetness2')
  .uint8('LeafWetness3')
  .uint8('AlarmIn')
  .uint8('AlarmRain')
  .string('AlarmOut', { length : 2 })
  .string('AlarmExTempHum', { length : 8 })
  .string('AlarmSoilLeaf', { length : 4 })
  .uint8('BatteryStatus')
  .uint16le('BatteryVolts')
  .uint8('ForecastIcon')
  .uint8('ForecastRuleNo')
  .uint16le('SunRise')
  .uint16le('SunSet')
  .string('EOL', { length : 2 })
  .uint16le('CRC');

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
* Voltage = ((Data * 300)/512)/100.0
*
*/
function _convertToVoltage(value){
   return ((value * 300)/512)/100;
}

function _getForecastString(value){
  var foreCastStrings = [
    "Mostly clear and cooler.",
    "Mostly clear with little temperature change.",
    "Mostly clear for 12 hrs. with little temperature change.",
    "Mostly clear for 12 to 24 hrs. and cooler.",
    "Mostly clear with little temperature change.",
    "Partly cloudy and cooler.",
    "Partly cloudy with little temperature change.",
    "Partly cloudy with little temperature change.",
    "Mostly clear and warmer.",
    "Partly cloudy with little temperature change.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 24 to 48 hrs.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds with little temperature change. Precipitation possible within 24 hrs.",
    "Mostly clear with little temperature change.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds with little temperature change. Precipitation possible within 12 hrs.",
    "Mostly clear with little temperature change.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 24 hrs.",
    "Mostly clear and warmer. Increasing winds.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 12 hrs. Increasing winds.",
    "Mostly clear and warmer. Increasing winds.",
    "Increasing clouds and warmer.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 12 hrs. Increasing winds.",
    "Mostly clear and warmer. Increasing winds.",
    "Increasing clouds and warmer.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 12 hrs. Increasing winds.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly clear and warmer. Precipitation possible within 48 hrs.",
    "Mostly clear and warmer.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds with little temperature change. Precipitation possible within 24 to 48 hrs.",
    "Increasing clouds with little temperature change.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 12 to 24 hrs.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 12 to 24 hrs. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 12 to 24 hrs. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 6 to 12 hrs.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 6 to 12 hrs. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 12 to 24 hrs. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation possible within 12 hrs.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and warmer. Precipitation likely.",
    "clearing and cooler. Precipitation ending within 6 hrs.",
    "Partly cloudy with little temperature change.",
    "clearing and cooler. Precipitation ending within 6 hrs.",
    "Mostly clear with little temperature change.",
    "Clearing and cooler. Precipitation ending within 6 hrs.",
    "Partly cloudy and cooler.",
    "Partly cloudy with little temperature change.",
    "Mostly clear and cooler.",
    "clearing and cooler. Precipitation ending within 6 hrs.",
    "Mostly clear with little temperature change.",
    "Clearing and cooler. Precipitation ending within 6 hrs.",
    "Mostly clear and cooler.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds with little temperature change. Precipitation possible within 24 hrs.",
    "Mostly cloudy and cooler. Precipitation continuing.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation likely.",
    "Mostly cloudy with little temperature change. Precipitation continuing.",
    "Mostly cloudy with little temperature change. Precipitation likely.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and cooler. Precipitation possible and windy within 6 hrs.",
    "Increasing clouds with little temperature change. Precipitation possible and windy within 6 hrs.",
    "Mostly cloudy and cooler. Precipitation continuing. Increasing winds.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation likely. Increasing winds.",
    "Mostly cloudy with little temperature change. Precipitation continuing. Increasing winds.",
    "Mostly cloudy with little temperature change. Precipitation likely. Increasing winds.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and cooler. Precipitation possible within 12 to 24 hrs. Possible wind shift to the W, NW, or N.",
    "Increasing clouds with little temperature change. Precipitation possible within 12 to 24 hrs. Possible wind shift to the W, NW, or N.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and cooler. Precipitation possible within 6 hrs. Possible wind shift to the W, NW, or N.",
    "Increasing clouds with little temperature change. Precipitation possible within 6 hrs. Possible wind shift to the W, NW, or N.",
    "Mostly cloudy and cooler. Precipitation ending within 12 hrs. Possible wind shift to the W, NW, or N.",
    "Mostly cloudy and cooler. Possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Precipitation ending within 12 hrs. Possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Possible wind shift to the W, NW, or N.",
    "Mostly cloudy and cooler. Precipitation ending within 12 hrs. Possible wind shift to the W, NW, or N.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation possible within 24 hrs. Possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Precipitation ending within 12 hrs. Possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Precipitation possible within 24 hrs. Possible wind shift to the W, NW, or N.",
    "clearing, cooler and windy. Precipitation ending within 6 hrs.",
    "clearing, cooler and windy.",
    "Mostly cloudy and cooler. Precipitation ending within 6 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Mostly cloudy and cooler. Windy with possible wind shift to the W, NW, or N.",
    "clearing, cooler and windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy with little temperature change. Precipitation possible within 12 hrs. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and cooler. Precipitation possible within 12 hrs., possibly heavy at times. Windy.",
    "Mostly cloudy and cooler. Precipitation ending within 6 hrs. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation possible within 12 hrs. Windy.",
    "Mostly cloudy and cooler. Precipitation ending in 12 to 24 hrs.",
    "Mostly cloudy and cooler.",
    "Mostly cloudy and cooler. Precipitation continuing, possible heavy at times. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation possible within 6 to 12 hrs. Windy.",
    "Mostly cloudy with little temperature change. Precipitation continuing, possibly heavy at times. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy with little temperature change. Precipitation possible within 6 to 12 hrs. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds with little temperature change. Precipitation possible within 12 hrs., possibly heavy at times. Windy.",
    "Mostly cloudy and cooler. Windy.",
    "Mostly cloudy and cooler. Precipitation continuing, possibly heavy at times. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation likely, possibly heavy at times. Windy.",
    "Mostly cloudy with little temperature change. Precipitation continuing, possibly heavy at times. Windy.",
    "Mostly cloudy with little temperature change. Precipitation likely, possibly heavy at times. Windy.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and cooler. Precipitation possible within 6 hrs. Windy.",
    "Increasing clouds with little temperature change. Precipitation possible within 6 hrs. windy",
    "Increasing clouds and cooler. Precipitation continuing. Windy with possible wind shift to the W, NW, or N.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation likely. Windy with possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Precipitation continuing. Windy with possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Precipitation likely. Windy with possible wind shift to the W, NW, or N.",
    "Increasing clouds and cooler. Precipitation possible within 6 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and cooler. Precipitation possible within 6 hrs. Possible wind shift to the W, NW, or N.",
    "Increasing clouds with little temperature change. Precipitation possible within 6 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Increasing clouds with little temperature change. Precipitation possible within 6 hrs. Possible wind shift to the W, NW, or N.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and cooler. Precipitation possible within 6 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Increasing clouds with little temperature change. Precipitation possible within 6 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Increasing clouds and cooler. Precipitation possible within 12 to 24 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Increasing clouds with little temperature change. Precipitation possible within 12 to 24 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Mostly cloudy and cooler. Precipitation possibly heavy at times and ending within 12 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation possible within 6 to 12 hrs., possibly heavy at times. Windy with possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Precipitation ending within 12 hrs. Windy with possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Precipitation possible within 6 to 12 hrs., possibly heavy at times. Windy with possible wind shift to the W, NW, or N.",
    "Mostly cloudy and cooler. Precipitation continuing.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation likely, windy with possible wind shift to the W, NW, or N.",
    "Mostly cloudy with little temperature change. Precipitation continuing.",
    "Mostly cloudy with little temperature change. Precipitation likely.",
    "Partly cloudy with little temperature change.",
    "Mostly clear with little temperature change.",
    "Mostly cloudy and cooler. Precipitation possible within 12 hours, possibly heavy at times. Windy.",
    "FORECAST REQUIRES 3 HRS. OF RECENT DATA",
    "Mostly clear and cooler.",
    "Mostly clear and cooler.",
    "Mostly clear and cooler.",
    "Unknown forecast rule."
];
  return foreCastStrings[value]; 
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
      case "TempIn":
      case "TempOut":
        value = Convert(value/10).from('F').to('C');
        break;
      case "BatteryVolts":
	value = _convertToVoltage(value);
	break;	
      case "ForecastRuleNo":
	value = _getForecastString(value);
    }
    convertedPacket[property] = value;

  }

  console.log(convertedPacket);

  return parsedPacket;
}

module.exports = parsePacket;
