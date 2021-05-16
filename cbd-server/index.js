let express = require("express");
let app = express();
let cors = require("cors");

app.use(cors());
app.use(function (req, res, next) {
  console.log(`${new Date()} - ${req.method} request for ${req.url}`);
  next();
});
app.use(express.static(__dirname + "/static"));
app.get("/", function (req, res) {
  res.sendfile(__dirname + "/static/predict.html");
});
app.listen(4000, function () {
  console.log("Server up on 5000");
});
