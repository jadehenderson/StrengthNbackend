const app = require("./app");

let port = process.env.PORT || 5000;

app.listen(port, async() => {
    console.log(`Server running on port:${port}`);
})