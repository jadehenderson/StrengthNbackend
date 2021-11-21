const router = require("express").Router();
const pool = require("../db");

const authorization = require("../middleware/authorization");

const weeksInMonth = (year, month) => {
	let date = new Date(year, month);

	let days = [];
	while (date.getMonth() === month) {
		const startDate = date.toString();
		let endDate;
		if (date.getDay() != 1) {
			while (date.getMonth() === month && date.getDay() != 1) {
				endDate = date.toString();
				date.setDate(date.getDate() + 1);
			}
			days.push(startDate + "--" + endDate);
			continue;
		}
		let numDays = 6;
		while (numDays >= 0 && date.getMonth() === month) {
			endDate = date.toString();
			numDays--;
			date.setDate(date.getDate() + 1);
		}
		days.push(startDate + "--" + endDate);
	}
	return days;
};

//registering
router.get("/home", authorization, async (req, res) => {
	try {
		const { id } = req.user;
		const schedules = await pool.query(
			"SELECT * FROM schedules WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1)",
			[id]
		);
		const messages = await pool.query(
			"SELECT DISTINCT ON (groupID) * FROM messages WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1) ORDER BY groupID, created_at DESC",
			[id]
		);
		const groups = await pool.query(
			"SELECT * FROM groups WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1)",
			[id]
		);
		const user = await pool.query("SELECT * FROM users WHERE userID = $1", [
			id,
		]);
		const org = await pool.query(
			"SELECT orgname FROM organizations WHERE organizationID IN (SELECT orgID FROM users WHERE userID = $1)",
			[id]
		);
		const userInfo = {
			user: user.rows,
			org: org.rows,
			groups: groups.rows,
			messages: messages.rows,
			schedules: schedules.rows,
		};
		res.status(200).json(JSON.stringify(userInfo));
	} catch (err) {
		console.log("schedule error");
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});

router.get("/schedules", authorization, async (req, res) => {
	try {
		const { id } = req.user;
		const schedules = await pool.query(
			"SELECT * FROM schedules WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1)",
			[id]
		);
		res.json(schedules.rows);
	} catch (err) {
		res.status(500).json({ msg: err.message });
	}
});
router.get("/schedules/:id", authorization, async (req, res) => {
	try {
		const { id } = req.user;
		const scheduleID = req.params.id;
		console.log(scheduleID);
		const userIsPartOfGroup = await pool.query(
			"SELECT groupid FROM userTOgroups where userID = $1",
			[id]
		);
		const usersGroups = userIsPartOfGroup.rows;
		let isInGroup = false;
		for (const group of usersGroups) {
			const { groupid } = group;
			if (groupid == scheduleID) {
				isInGroup = true;
				break;
			}
		}
		if (!isInGroup) {
			return res.json("User does not have access to this group");
		}
		const schedules = await pool.query(
			"SELECT * FROM schedules where groupID = $1",
			[scheduleID]
		);
		res.json(schedules.rows);
	} catch (err) {
		console.log("schedule error");
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});
router.post("/schedules/:id", authorization, async (req, res) => {
	try {
		const { id } = req.user;
		const scheduleID = req.params.id;
		console.log(scheduleID);
		const userIsPartOfGroup = await pool.query(
			"SELECT groupid FROM userTOgroups where userID = $1",
			[id]
		);
		const usersGroups = userIsPartOfGroup.rows;
		let isInGroup = false;
		for (const group of usersGroups) {
			const { groupid } = group;
			if (groupid == scheduleID) {
				isInGroup = true;
				break;
			}
		}
		if (!isInGroup) {
			return res.json("User does not have access to this group");
		}
		const schedule = await pool.query(
			"SELECT * FROM schedules where groupID = $1",
			[scheduleID]
		);
		let { nummembers, finished, weeks, currentstep } = schedule.rows[0];
		finished.push(id);
		if (weeks.length === 0) {
			for (let i = 0; i < weeksInMonth(2021, 11).length; i++) {
				weeks.push(0);
			}
		}
		if (finished.length == nummembers) {
			finished = [];
			if (currentstep === "pw") {
				let evenVote = true;
				for (let i = 0; i < weeks.length - 1; i++) {
					if (weeks[i] != weeks[i + 1]) {
						evenVote = false;
						break;
					}
				}
				if (evenVote) {
					currentstep = "vw";
				} else {
					currentstep = "pd";
				}
			} else if (currentstep === "vw") {
				currentstep = "pd";
			} else if (currentstep === "pd") {
				currentstep = "vd";
			} else {
				currentstep = "f";
			}
		}
		const updateSchedule = pool.query(
			"UPDATE schedules SET currentstep = $1 , weeks = $2 , finished = $3 WHERE groupID = $4 RETURNING *",
			[currentstep, weeks, finished, scheduleID]
		);
		// 'pw', 'vw', 'pd', 'vd'

		res.json(updateSchedule.rows);
	} catch (err) {
		console.log("schedule error");
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});

router.get("/messages", authorization, async (req, res) => {
	try {
		const { id } = req.user;
		//const messages = await pool.query("SELECT *  FROM messages WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1) GROUP BY groupID", [id]);
		const messages = await pool.query(
			"SELECT DISTINCT ON (groupID) * FROM messages WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1) ORDER BY groupID, created_at DESC",
			[id]
		);
		res.status(200).json(messages.rows);
	} catch (err) {
		res.status(500).json({ msg: err.message });
	}
});

router.get("/messages/:id", authorization, async (req, res) => {
	try {
		const { id } = req.user;
		const messageID = req.params.id;
		console.log(messageID);
		const userIsPartOfGroup = await pool.query(
			"SELECT groupid FROM userTOgroups where userID = $1",
			[id]
		);
		const usersGroups = userIsPartOfGroup.rows;
		let isInGroup = false;
		for (const group of usersGroups) {
			const { groupid } = group;
			if (groupid == messageID) {
				isInGroup = true;
				break;
			}
		}
		if (!isInGroup) {
			return res.json({ msg: "User does not have access to this group" });
		}
		const messages = await pool.query(
			"SELECT * FROM messages where groupID = $1 ORDER BY created_at DESC",
			[messageID]
		);
		res.json(messages.rows);
	} catch (err) {
		console.log("schedule error");
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});

router.post("/messages/:id", authorization, async (req, res) => {
	try {
		const { message } = req.body;
		if (message.length > 255) {
			return res.status(401).json("Message is too long.");
		}
		const { id, name } = req.user;
		const messageID = req.params.id;
		const userIsPartOfGroup = await pool.query(
			"SELECT groupid FROM userTOgroups where userID = $1",
			[id]
		);
		const usersGroups = userIsPartOfGroup.rows;
		let isInGroup = false;
		for (const group of usersGroups) {
			const { groupid } = group;
			if (groupid == messageID) {
				isInGroup = true;
				break;
			}
		}
		if (!isInGroup) {
			return res
				.status(401)
				.json({ msg: "User does not have access to this group" });
		}
		const newMessage = await pool.query(
			"INSERT INTO messages(groupID,message,userID, sentBy) VALUES($1, $2, $3, $4)",
			[messageID, message, id, name]
		);
		res.json(newMessage.rows);
	} catch (err) {
		console.log("schedule error");
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});
router.get("/groups", authorization, async (req, res) => {
	try {
		const { id } = req.user;

		const groups = await pool.query(
			"SELECT * FROM groups WHERE groupID IN (SELECT groupID FROM userTOgroups WHERE userID = $1)",
			[id]
		);

		res.status(200).json(groups.rows);
	} catch (err) {
		console.log("schedule error");
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});

router.get("/group/:id", authorization, async (req, res) => {
	try {
		const { id } = req.user;
		const groupID = req.params.id;
		const userIsPartOfGroup = await pool.query(
			"SELECT groupid FROM userTOgroups where userID = $1",
			[id]
		);
		const usersGroups = userIsPartOfGroup.rows;
		let isInGroup = false;
		for (const group of usersGroups) {
			const { groupid } = group;
			if (groupid == messageID) {
				isInGroup = true;
				break;
			}
		}
		if (!isInGroup) {
			return res
				.status(401)
				.json({ msg: "User does not have access to this group" });
		}
		const getGroup = await pool.query(
			"SELECT * FROM groups where groupid = $1",
			[groupID]
		);
		res.status(200).json(getGroup.rows[0]);
	} catch (err) {
		console.log("schedule error");
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});

router.post("/group/:id", authorization, async (req, res) => {
	try {
		const { loc, startTime, endTime, date, groupName } = req.body;
		const { id } = req.user;
		const groupID = req.params.id;
		const userIsPartOfGroup = await pool.query(
			"SELECT groupid FROM userTOgroups where userID = $1",
			[id]
		);
		const usersGroups = userIsPartOfGroup.rows;
		let isInGroup = false;
		for (const group of usersGroups) {
			const { groupid } = group;
			if (groupid == messageID) {
				isInGroup = true;
				break;
			}
		}
		if (!isInGroup) {
			return res
				.status(401)
				.json({ msg: "User does not have access to this group" });
		}
		const editGroup = await pool.query(
			"UPDATE groups SET loc = $1 , starttime = $2 , endtime = $3 , dati = $4 , groupname = $5 , WHERE groupID = $6  RETURNING *",
			[loc, startTime, endTime, date, groupName, groupID]
		);
		res.status(200).json(editGroup.rows);
	} catch (err) {
		console.log("schedule error");
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});

module.exports = router;
