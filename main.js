const { findCorrespondingOutlet } = require("./util");

const express = require("express");
const app = express();
const port = 5000;
var cors = require("cors");

app.get("/get-outlet", cors(), async (req, res) => {
  const address = req.query.address;
  let outlet;
  try {
    outlet = await findCorrespondingOutlet(address);
  } catch (error) {
    console.log("Error Fetching the details...");
  }
  res.send(outlet);
});

app.listen(port, () =>
  console.log(`Honest App Backend listening at http://localhost:${port}`)
);
