const request = require("request");
const fs = require("fs");
const path = require("path");
const xmlReader = require("read-xml");
const convert = require("xml-js");
const API_KEY = "8uUrCJBmMVXaQVi8riCeCX-QwcylA0TjgoBIEaaurJM";
const API_URL = "https://geocoder.ls.hereapi.com/6.2/geocode.json";

parserFunction = () => {
  const FILE = path.join(__dirname, "./FullStackTest_DeliveryAreas.kml");
  xmlReader.readXML(fs.readFileSync(FILE), function (err, data) {
    if (err) {
      console.error(err);
    }
    const xml = data.content;
    const result = JSON.parse(
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
    request(`${API_URL}?searchtext=${address}&apiKey=${API_KEY}`, function (
      error,
      response,
      body
    ) {
      if (!error && response.statusCode == 200) {
        resolve(
          JSON.parse(body).Response.View[0].Result[0].Location.DisplayPosition
        );
      } else {
        reject("Location Not Found");
      }
    });
  });
};

polygonCheck = (
  totalCoordinates,
  longArray,
  latArray,
  addressLat,
  addressLong
) => {
  let i = (j = c = 0);
  for (i = 0, j = totalCoordinates - 1; i < totalCoordinates; j = i++) {
    if (
      latArray[i] > addressLong != latArray[j] > addressLong &&
      addressLat <
        ((longArray[j] - longArray[i]) * (addressLong - latArray[i])) /
          (latArray[j] - latArray[i]) +
          longArray[i]
    ) {
      c = !c;
    }
  }
  return c;
};

module.exports = {
  async findCorrespondingOutlet(address) {
    let data = parsedResult();
    const latLongOfAddress = await getLatLong(address);
    const addressLat = latLongOfAddress.Latitude;
    const addressLong = latLongOfAddress.Longitude;
    let finalOutlet = "Not Found";
    for (location of data) {
      const longArray = location.coordinates.map((ele) =>
        parseFloat(ele.split(",")[0])
      );
      const latArray = location.coordinates.map((ele) =>
        parseFloat(ele.split(",")[1])
      );
      
      let polyCheck = polygonCheck(
        location.coordinates.length,
        longArray,
        latArray,
        addressLong,
        addressLat
      );

      if (polyCheck) {
        finalOutlet = location.name;
      }
    }
    return { name: finalOutlet };
  },
};
