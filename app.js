if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const router = require("./routes/index");
const PORT = process.env.PORT;

app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3001",
      "https://localhost:3001",
      "https://rekapio.netlify.app",
      "https://deploy-preview-12--rekapio.netlify.app",
    ],
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);

app.listen(PORT, () => {
  console.log("listening to port", +PORT);
});

module.exports = app;
