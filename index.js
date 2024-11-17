require("dotenv").config();
const cors = require("cors");
const morgan = require('morgan');
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const connectDB = require("./src/db/connect.js");
const actions = require("./src/Routes/actions");

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "Up And Running" });
});

app.use("/api/v1", actions);

app.use((req, res) => {
  res.status(404).send('404 - Not Found');
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port);
    console.log(`Server started on port ${port}`);
  } catch (err) {
    console.log(err);
  }
};
start();