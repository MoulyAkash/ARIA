import { BingChat } from "bing-chat";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
let app = express();
let jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false });

const PORT = 5959;

const bingAPI = new BingChat({
  cookie:
    "1CFacwxde5ynYvHfk37g6gORkAYIz3E2MMsUYj5xalbHAhkDF5BzvNKojnghd9SzYEtxYS8iIyE5W4Q0ARctOcmDVWllImjXIIXLpnab6ZrPzD5EKCUcjy4LEqLi1qtwsn7IY1tR5XqkPRBP1gt3WK8nCVr6hu-lkH9eDekWURmgTbyjjQgZn9XNqkEm_vf4_Z5xXMyQZTuGNbKVkkNirwKYbCJshocvsr54BMQhEQ2o",
});
app.use(cors());

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.send("Welcome Home");
});

app.post("/hello", function (req, res) {
  res.send({ response: "HI from server" });
});

app.post("/searchBing", jsonParser, async (req, res) => {
  console.log(req.body);
  await bingAPI.sendMessage(req.body.query).then((response) => {
    console.log(response);
    res.send({ response: response });
  });
});

// Handle 404 - Keep this as a last route
app.get(function (req, res, next) {
  res.status(404);
  res.send("404: Not found");
});

app.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}`);
});
