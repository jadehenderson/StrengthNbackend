const router = require("express").Router();
const pool = require("../db");

const authorization = require("../middleware/authorization");


//registering
router.get("/home" , authorization, async(req, res) => {
    
    try {
        const {id} = req.user;
        const schedules = await pool.query("SELECT * FROM schedules WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1)", [id]);
        const messages = await pool.query( "SELECT DISTINCT ON (groupID) * FROM messages WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1) ORDER BY groupID, created_at DESC", [id]);
        const groups = await pool.query("SELECT * FROM groups WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1)", [id]);
        const user = await pool.query("SELECT * FROM users WHERE userID = $1",[id]);
        const org = await pool.query("SELECT orgname FROM organizations WHERE organizationID IN (SELECT orgID FROM users WHERE userID = $1)", [id]);
        const userInfo = {
            "user": user.rows,
            "org": org.rows,
            "groups": groups.rows,
            "messages": messages.rows,
            "schedules": schedules.rows
        }
        res.json(JSON.stringify(userInfo));
        


    } catch (err) {
        console.log("schedule error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})


router.get("/schedules" , authorization, async(req, res) => {
    
    try {
        const {id} = req.user;
        const schedules = await pool.query("SELECT * FROM schedules WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1)", [id]);
        res.json(schedules.rows)

    } catch (err) {
        console.log("schedule error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})
router.get("/schedules/:id" , authorization, async(req, res) => {
    
    try {
        const {id} = req.user;
        const scheduleID = req.params.id;
        console.log(scheduleID)
        const userIsPartOfGroup = await pool.query("SELECT groupid FROM userTOgroups where userID = $1", [id]);
        const usersGroups = userIsPartOfGroup.rows;
        let isInGroup = false;
        for (const group of usersGroups) {
            const {groupid} = group;
            if (groupid == scheduleID) {
                isInGroup = true;
                break;
            }
        
        }
        if (!isInGroup) {
            return res.json("User does not have access to this group");
        }
        const schedules = await pool.query("SELECT * FROM schedules where groupID = $1", [scheduleID]);
        res.json(schedules.rows)

    } catch (err) {
        console.log("schedule error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})


router.get("/messages" , authorization, async(req, res) => {
    
    try {
        const {id} = req.user;
        //const messages = await pool.query("SELECT *  FROM messages WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1) GROUP BY groupID", [id]);
        const messages = await pool.query( "SELECT DISTINCT ON (groupID) * FROM messages WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1) ORDER BY groupID, created_at DESC", [id]);
        
        res.json(messages.rows)
    } catch (err) {
        console.log("messages error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})

router.get("/messages/:id" , authorization, async(req, res) => {
    
    try {
        const {id} = req.user;
        const messageID = req.params.id;
        console.log(messageID)
        const userIsPartOfGroup = await pool.query("SELECT groupid FROM userTOgroups where userID = $1", [id]);
        const usersGroups = userIsPartOfGroup.rows;
        let isInGroup = false;
        for (const group of usersGroups) {
            const {groupid} = group;
            if (groupid == messageID) {
                isInGroup = true;
                break;
            }
        
        }
        if (!isInGroup) {
            return res.json("User does not have access to this group");
        }
        const messages = await pool.query("SELECT * FROM messages where groupID = $1 ORDER BY created_at DESC", [messageID]);
        res.json(messages.rows)

    } catch (err) {
        console.log("schedule error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})

router.post("/messages/:id" , authorization, async(req, res) => {
    
    try {
        const { message } = req.body;
        if (message.length > 255) {
            return res.status(401).json("Message is too long.");
        }
        const {id} = req.user;
        const messageID = req.params.id;
        const userIsPartOfGroup = await pool.query("SELECT groupid FROM userTOgroups where userID = $1", [id]);
        const usersGroups = userIsPartOfGroup.rows;
        let isInGroup = false;
        for (const group of usersGroups) {
            const {groupid} = group;
            if (groupid == messageID) {
                isInGroup = true;
                break;
            }
        
        }
        if (!isInGroup) {
            return res.json("User does not have access to this group");
        }
        const newMessage = await pool.query("INSERT INTO messages(groupID,message,userID) VALUES($1, $2, $3)", [messageID, message ,id])
        res.json(newMessage.rows)

    } catch (err) {
        console.log("schedule error")
        console.log(err.message);
        res.status(500).json("Server Error 2");
    }
})



module.exports = router;

