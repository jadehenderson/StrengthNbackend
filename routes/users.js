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
			days.push(startDate + "?" + endDate);
			continue;
		}
		let numDays = 6;
		while (numDays >= 0 && date.getMonth() === month) {
			endDate = date.toString();
			numDays--;
			date.setDate(date.getDate() + 1);
		}
		days.push(startDate + "?" + endDate);
	}
	return days;
};

const numDays = (weeks, index) => {
	const week = weeks[index];
	const arr = week.split("?");
	const start = new Date(arr[0]).getDate();
	const end = new Date(arr[1]).getDate();
	const diffTime = Math.abs(end - start);
	const diffDays = diffTime + 1;

	return diffDays;
};

const createArr = (days, min) => {
	let times = [];
	const totalDays = days;
	let totalMin = 1440;
	let day = [];
	while (totalMin > 0) {
		day.push(0);
		totalMin -= min;
	}
	while (days > 0) {
		times.push(day);
		days--;
	}
	return times;
};

Date.prototype.addDays = function (days) {
	const date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
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
		const connections = await pool.query(
			"SELECT userID, fname, lname FROM users WHERE orgID IN (SELECT orgID FROM users WHERE userID = $1)",
			[id]
		);
		/*
		const orgID = user.rows[0].orgID;
		let connections;
		if (orgID == undefined) {
			connections = "none";
		} else {
			connections = await pool.query(
				"SELECT userID, fname, lname FROM users WHERE orgID = $1",
				[orgID]
			);
		}
		*/

		const userInfo = {
			user: user.rows,
			org: org.rows,
			groups: groups.rows,
			messages: messages.rows,
			schedules: schedules.rows,
			connections: connections.rows,
		};
		console.log(userInfo);

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
			return res.status(401).json({msg: "User does not have access to this group"});
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
		let { weeks, dates } = req.body;
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
			return res.status(401).json({msg: "User does not have access to this group"});
		}
		const schedule = await pool.query(
			"SELECT * FROM schedules where groupID = $1",
			[scheduleID]
		);

		let { nummembers, finished, currentstep, indexmonth, yer, indexweek } =
			schedule.rows[0];
		nummembers = parseInt(nummembers);

		indexmonth = parseInt(indexmonth);
		yer = parseInt(yer);

		for (let i = 0; i < finished.length; i++) {
			let currID = finished[i];
			if (currID === id) {
				return res.json("User has already voted");
			}
		}

		finished.push(id);
		if (finished.length == nummembers) {
			finished = [];
			if (currentstep === "pw") {
				currentstep = "pd";
				let maxIndex = 0;
				let maxCount = weeks[0];
				for (let i = 1; i < weeks.length; i++) {
					const totalVotes = weeks[i];
					if (totalVotes > maxCount) {
						maxIndex = i;
						maxCount = totalVotes;
					}
				}
				indexweek = maxIndex;
				let weeksInterval = weeksInMonth(yer, indexmonth);
				console.log(weeksInterval);
				console.log(yer, indexmonth);
				let totalDays = numDays(weeksInterval, maxIndex);
				console.log(maxIndex);
				dates = createArr(totalDays, 60);
			} else if (currentstep === "pd") {
				indexweek = schedule.rows[0].indexweek;
				indexweek = parseInt(indexweek);
				let maxDate = 0;
				let maxTime = 0;
				let maxCount = 0;
				for (let i = 0; i < dates.length; i++) {
					for (let j = 0; j < dates[0].length; j++) {
						const count = dates[i][j];
						if (count > maxCount) {
							maxCount = count;
							maxDate = i;
							maxTime = j;
						}
					}
				}
				let times = {
					0: "12:00",
					1: "1:00",
					2: "2:00",
					3: "3:00",
					4: "4:00",
					5: "5:00",
					6: "6:00",
					7: "7:00",
					8: "8:00",
					9: "9:00",
					10: "10:00",
					11: "11:00",
					12: "12:00",
					13: "13:00",
					14: "14:00",
					15: "15:00",
					16: "16:00",
					17: "17:00",
					18: "18:00",
					19: "19:00",
					20: "20:00",
					21: "21:00",
					22: "22:00",
					23: "23:00",
				};
				// yyyy-mm-dd

				let startTime = times[maxTime];
				if (maxTime == 23) {
					maxTime = -1;
				}
				let endTime = times[maxTime + 1];
				const weeksArr = weeksInMonth(yer, indexmonth);
				const currWeek = weeksArr[indexweek];
				const weekInterval = currWeek.split("?");
				let startDate = new Date(weekInterval[0]);
				console.log(maxDate);
				console.log(startDate);
				startDate.setDate(startDate.getDate() + maxDate);
				console.log(startDate);
				const dati = startDate.toISOString();
				console.log(dati);
				const updateGroup = await pool.query(
					"UPDATE groups SET starttime = $1 , endtime = $2 , dati = $3  WHERE groupID = $4 RETURNING *",
					[startTime, endTime, dati, scheduleID]
				);

				currentstep = "f";
			} else {
				res.json({ msg: "Already scheduled meeting" });
			}
		}
		const updateSchedule = await pool.query(
			"UPDATE schedules SET currentstep = $1 , weeks = $2 , finished = $3 , dates = $4 , indexWeek = $5 WHERE groupID = $6 RETURNING *",
			[currentstep, weeks, finished, dates, indexweek, scheduleID]
		);
		res.status(200).json(updateSchedule.rows[0]);
	} catch (err) {
		console.log("schedule error");
		console.log(err);
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
		const userIsPartOfGroup = await pool.query(
			"SELECT groupid FROM userTOgroups where userID = $1",
			[id]
		);
		const usersGroups = userIsPartOfGroup.rows;
		let isInGroup = false;
		for (const group of usersGroups) {
			const { groupid } = group;
			if (groupid==messageID) {
				isInGroup = true;
				break;
			}
		}
		if (!isInGroup) {
			return res.status(401).json({msg: "User does not have access to this group"});
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
			if (groupid == groupID) {
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
			"SELECT groupid FROM userTOgroups WHERE userID = $1",
			[id]
		);
		const usersGroups = userIsPartOfGroup.rows;
		let isInGroup = false;
		for (const group of usersGroups) {
			const { groupid } = group;
			if (groupid == groupID) {
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
			"UPDATE groups SET loc = $1 , starttime = $2 , endtime = $3 , dati = $4 , groupname = $5 WHERE groupID = $6  RETURNING *",
			[loc, startTime, endTime, date, groupName, groupID]
		);
		res.status(200).json(editGroup.rows);
	} catch (err) {
		console.log(err.message);
		res.status(500).json("Server Error 2");
	}
});

module.exports = router;
