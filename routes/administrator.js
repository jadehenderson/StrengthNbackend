const router = require("express").Router();
const pool = require("../db");


//registering

router.post("/group" , async(req, res) => {
    const {organization} = req.body;
    try {
        const org = await pool.query("SELECT * FROM organization WHERE name = $1 ", [organization]);
        if (org.rows.length == 0) {
            const insertOrg = await pool.query("INSERT INTO organizations(name) VALUES($1) RETURNING *")
        }
    
        console.log(org);
        res.json(org);

    } catch (err) {
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})

module.exports = router;