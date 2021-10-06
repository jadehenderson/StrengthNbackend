const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

//registering

router.post("/register" ,validInfo, async(req, res) => {
    const {fname, lname, email, password} = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1 ", [email]);
        
        if (user.rows.length > 0) {
            return res.status(401).json("User already exists.")
        }
        console.log("here")
        const saltRound = await bcrypt.genSalt(10);
        const bcryptPassowrd = await bcrypt.hash(password, saltRound);

        const query = "INSERT INTO users(fname, lname, email, pword) VALUES($1, $2, $3, $4) RETURNING *";
        const values = [fname, lname, email, bcryptPassowrd];

        const newUser = await pool.query(query, values);
        const token = jwtGenerator(newUser.rows[0].userid);
        res.json(token);
        console.log(newUser.rows[0]);

    } catch (err) {
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})

router.post("/login" ,validInfo, async(req, res) => {
    try {
        const {email, password} = req.body;
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).send("Email does not exist")
        }
        const validPassword = bcrypt.compare(password, user.rows[0].pword);
        if (!validPassword) {
            return res.status(401).send("Password is not correct")
        }
        const token = jwtGenerator(user.rows[0].userid);
        res.json(token);

    } catch (err) {
        console.log(err.message);
        return res.status(500).send("Server Error");
    }
})
router.post("/is-verify" ,authorization, async(req, res) => {
    try {
        res.json(true);

    } catch (err) {
        console.log(err.message);
        return res.status(500).send("Server Error");
    }
})


module.exports = router;