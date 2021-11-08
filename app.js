const express = require("express");
const cors = require("cors");

const app = express();
const authRoute = require("./routes/jwtAuth");
const adminRoute = require("./routes/administrator");
const userRoute = require("./routes/users")

//middleware
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/user", userRoute);
app.get("/", (req, res) => {
    res.send("We are running");
});

module.exports = app;