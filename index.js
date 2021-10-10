const express = require("express");
const cors = require("cors");



const app = express();
let port = process.env.port || 5000;





//middleware
app.use(cors());
app.use(express.json());
const authRoute = require("./routes/jwtAuth");
app.use("/auth", authRoute);
app.get("/", (req, res) => {
    res.send("We are running");
});
app.listen(port, async() => {
    console.log(`Server running on port:${port}`);
})