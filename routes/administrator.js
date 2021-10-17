const router = require("express").Router();
const pool = require("../db");


//registering

router.post("/group" , async(req, res) => {
    const {organization, groups} = req.body;
    try {
        
        // create org
        let orgid;
        const org = await pool.query("SELECT * FROM organizations WHERE orgname = $1 ", [organization]);
        if (org.rows.length == 0) {
            const insertOrg = await pool.query("INSERT INTO organizations(orgname) VALUES($1) RETURNING *", [organization])
            console.log(insertOrg.rows[0])
            orgid = insertOrg.rows[0].organizationid;
        } else {
            orgid = org.rows[0].organizationid;
        }
        //console.log(insertOrg)
        console.log(groups)
        Object.entries(groups).forEach(async([group, emails]) => {
            // create group
            const newGroup = await pool.query("INSERT INTO groups(groupname, orgid) VALUES($1, $2) RETURNING *", ["meeting", orgid])
            const { groupid } = newGroup.rows[0];
            
            emails.forEach(async(email) => {
                // add users 
                // if user exists add to usertogroups table
                const user = await pool.query("SELECT * FROM users WHERE email = $1 ", [email]);
                //console.log(email)
                if (user.rows.length == 0) {
                    return;
                }
                
                const { userid, fname } = user.rows[0]

                //console.log(fname + "  " + groupid)
                const insertUsertoGroup = await pool.query("INSERT INTO usertogroups(userID, groupID) VALUES($1, $2) RETURNING *", [userid, groupid])
                //console.log(insertUsertoGroup)
            }) 

        })

        res.json("Successfully made groups");

    } catch (err) {
        console.log("administration error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})

module.exports = router;

