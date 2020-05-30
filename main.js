const { findCorrespondingOutlet } = require("./util");

const express = require("express");
const app = express();
const port = 5000;
var cors = require('cors')

app.get("/get-outlet", cors(), async (req, res) => {
    const address = req.query.address
    res.send(await findCorrespondingOutlet(address))
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
