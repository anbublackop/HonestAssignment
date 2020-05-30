const request = require("request");
const API_KEY = "phBHGa8ywlGgB2G9E52IGjsHAwOLezz8";
const API_URL = "http://open.mapquestapi.com/geocoding/v1/address";

parserFunction = () => {
  var fs = require("fs"),
    path = require("path"),
    xmlReader = require("read-xml");

  var convert = require("xml-js");

  var FILE = path.join(__dirname, "./FullStackTest_DeliveryAreas.kml");
  xmlReader.readXML(fs.readFileSync(FILE), function (err, data) {
    if (err) {
      console.error(err);
    }

    var xml = data.content;
    var result = JSON.parse(
      convert.xml2json(xml, { compact: true, spaces: 4 })
    );

    parsedData = result.kml.Document.Placemark;
  });

  return parsedData;
};

parsedResult = () => {
  const result = parserFunction();
  let output = [];
  count = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i].hasOwnProperty("Polygon")) {
      output.push({
        name: result[i].name._text,
        coordinates: result[
          i
        ].Polygon.outerBoundaryIs.LinearRing.coordinates._text
          .trim()
          .split("              "),
      });
    } else if (result[i].hasOwnProperty("Point")) {
      output.push({
        name: result[i].name._text,
        coordinates: result[i].Point.coordinates._text
          .trim()
          .split("              "),
      });
    }
  }
  return output;
};

getLatLong = async (address) => {
  return new Promise(function (resolve, reject) {
    request(`${API_URL}?key=${API_KEY}&location=${address}`, function (
      error,
      response,
      body
    ) {
      if (!error && response.statusCode == 200) {
        resolve(JSON.parse(body).results[0].locations[0].latLng);
      } else {
        reject("Location Not Found");
      }
    });
  });
};

module.exports = {
  async findCorrespondingOutlet(address) {
    let data = parsedResult();
    const latLongOfAddress = await getLatLong(address);
    const addressLat = latLongOfAddress.lat;
    const addressLong = latLongOfAddress.lng;
    let diffArray = [];
    let nearestOutlet = {};
    let leastDistance = 100000;
    for (location of data) {
      let minDiff = 1000;
      for (let c of location.coordinates) {
        let long = parseFloat(c.split(",")[0]);
        let lat = parseFloat(c.split(",")[1]);
        const diff = Math.abs(addressLat - lat) + Math.abs(addressLong - long);
        if (diff < minDiff) {
          minDiff = diff;
        }
      }
      diffArray.push({
        name: location.name,
        diff: minDiff,
      });
      if (leastDistance > minDiff) {
        leastDistance = minDiff
        nearestOutlet = {
            name: location.name,
            leastDistance: minDiff
        }
      }
    }
//     if (nearestOutlet.leastDistance>1 && nearestOutlet.leastDistance<100){
//         return 'Not Found'
//     }
    return nearestOutlet;
  },
};
