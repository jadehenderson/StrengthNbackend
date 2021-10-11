const express = require("express");
const cors = require("cors");



const app = express();
let port = process.env.PORT || 5000;
const authRoute = require("./routes/jwtAuth");
const adminRoute = require("./routes/admiistrator");





//middleware
app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.get("/", (req, res) => {
    res.send("We are running");
});
app.listen(port, async() => {
    console.log(`Server running on port:${port}`);
})