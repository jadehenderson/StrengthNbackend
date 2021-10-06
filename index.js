const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");


const app = express();
const port = 5000;
const pool = require("./db");
const jwtGenerator = require("./jwtGenerator");



//middleware
app.use(cors());
app.use(express.json());

app.listen(port, async() => {
    console.log(`Server running on port:${port}`);
    
    
})

app.post("/api/register", async(req, res) => {
    

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
            return res.status(401).json("User already exists.")
        }
        const salt = await bcrypt.genSalt(10);
        const bcryptPassowrd = await bcrypt.hash(password, salt);

        const query = "INSERT INTO users VALUES($1, $2, $3, $4) RETURNING *";
        const {fname, lname, email, password} = req.body;
        const values = [fname, lname, email, password];
        const newUser = await pool.query(query, values);
        //res.json(newUser.rows[0]);
        console.log(newUser.rows[0]);
    } catch(err) {
        console.error(err.message);
        res.send(`Error: ${err.message}`);


    }
})



