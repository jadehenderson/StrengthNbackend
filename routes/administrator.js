const router = require("express").Router();
const pool = require("../db");


//registering

router.post("/group" , async(req, res) => {
    const {organization} = req.body;
    try {
        const org = await pool.query("SELECT * FROM organizations WHERE name = $1 ", [organization]);
        if (org.rows.length == 0) {
            console.log("here")
            const insertOrg = await pool.query("INSERT INTO organizations(name, userids, groupids) VALUES($1, $2, $3) RETURNING *", [organization, {}, {}])
        } 
    

        res.json(org);

    } catch (err) {
        console.log("this error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})

module.exports = router;