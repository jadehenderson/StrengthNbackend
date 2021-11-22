const router = require("express").Router();
const pool = require("../db");

//registering

router.post("/group", async (req, res) => {
	const { organization, groups } = req.body;
	try {
		// create org
		let orgid;
		const org = await pool.query(
			"SELECT * FROM organizations WHERE orgname = $1 ",
			[organization]
		);
		if (org.rows.length == 0) {
			const insertOrg = await pool.query(
				"INSERT INTO organizations(orgname) VALUES($1) RETURNING *",
				[organization]
			);
			orgid = insertOrg.rows[0].organizationid;
		} else {
			orgid = org.rows[0].organizationid;
		}

		for (const group of groups) {
			console.log(group);
			const newGroup = await pool.query(
				"INSERT INTO groups(groupname, orgid) VALUES($1, $2) RETURNING *",
				["Meeting", orgid]
			);

			let numMembers = 0;
			const { groupid } = newGroup.rows[0];
			for (const email of group) {
				// add users
				// if user exists add to usertogroups table
				const user = await pool.query("SELECT * FROM users WHERE email = $1 ", [
					email,
				]);
				if (user.rows.length == 0) {
					continue;
				}
				numMembers += 1;
				const { userid } = user.rows[0];
				const updateUserOrg = await pool.query(
					"UPDATE users SET orgID = $1 WHERE userID = $2",
					[orgid, userid]
				);
				const insertUsertoGroup = await pool.query(
					"INSERT INTO usertogroups(userID, groupID) VALUES($1, $2) RETURNING *",
					[userid, groupid]
				);
			}
			const updateGroupCount = await pool.query(
				"UPDATE schedules SET nummembers = $1 WHERE groupID = $2 RETURNING *",
				[numMembers, groupid]
			);
		}
		res.status(201).json({ msg: "Successfully made groups" });
	} catch (err) {
		console.log(err);
		res.status(500).json(`Error: ${err.json}`);
	}
});

module.exports = router;
