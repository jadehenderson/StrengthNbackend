const router = require("express").Router();
const pool = require("../db");

//registering
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

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

		Object.entries(groups).forEach(async ([group, emails]) => {
			// create group
			const newGroup = await pool.query(
				"INSERT INTO groups(groupname, orgid) VALUES($1, $2) RETURNING *",
				["meeting", orgid]
			);
			let numMembers = 0;
			const { groupid } = newGroup.rows[0];

			emails.forEach(async (email) => {
				// add users
				// if user exists add to usertogroups table
				const user = await pool.query("SELECT * FROM users WHERE email = $1 ", [
					email,
				]);

				if (user.rows.length == 0) {
					return;
				}
				numMembers += 1;
				const { userid, fname } = user.rows[0];
				const updateUserOrg = await pool.query(
					"UPDATE users SET orgID = $1 WHERE userID = $2",
					[orgid, userid]
				);

				const insertUsertoGroup = await pool.query(
					"INSERT INTO usertogroups(userID, groupID) VALUES($1, $2) RETURNING *",
					[userid, groupid]
				);
			});
			await sleep(20000);
			const updateGroupCount = await pool.query(
				"UPDATE schedules SET nummembers = $1 WHERE groupID = $2 RETURNING *",
				[numMembers, groupid]
			);
			//console.log(groupid);
			console.log(updateGroupCount.rows[0]);

			console.log(numMembers, updateGroupCount.rows[0].nummembers);
		});
		res.status(201).json({ msg: "Successfully made groups" });
	} catch (err) {
		res.status(500).json("Server Error 2");
	}
});

module.exports = router;
