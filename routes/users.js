const router = require("express").Router();
const pool = require("../db");

const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");


//registering

router.get("/schedules" , authorization, async(req, res) => {
    
    try {

        const id = req.user.id;
        console.log(id);
        const schedules = await pool.query("SELECT * FROM schedules WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1)", [id]);
        res.json(schedules)

    } catch (err) {
        console.log("schedule error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})

module.exports = router;

