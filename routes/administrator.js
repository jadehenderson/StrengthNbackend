const router = require("express").Router();
const pool = require("../db");
const nodemailer = require('nodemailer');
require("dotenv").config();
const {google} = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

let indexToMonth = {
	0: "January",
	1: "February",
	2: "March",
	3: "April",
	4: "May",
	5: "June",
	6: "July",
	7: "August",
	8: "September",
	9: "October",
	10: "November",
	11: "December",
};

//registering
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
			days.push(startDate + "-" + endDate);
			continue;
		}
		let numDays = 6;
		while (numDays >= 0 && date.getMonth() === month) {
			endDate = date.toString();
			numDays--;
			date.setDate(date.getDate() + 1);
		}
		days.push(startDate + "-" + endDate);
	}
	return days;
};

router.post("/group", async (req, res) => {
	let { organization, groups, indexMonth, year } = req.body;
	try {
		// create org
		indexMonth = parseInt(indexMonth);
		year = parseInt(year);

		const month = indexToMonth[indexMonth] + " Meeting";
		const numWeeks = weeksInMonth(year, indexMonth).length;
		let weeks = [];
		for (let i = 0; i < numWeeks; i++) {
			weeks.push(0);
		}
		console.log(weeks);

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

		console.log(typeof groups);
		for (const prop in groups) {
			let group = groups[prop];
			console.log(group);
			const newGroup = await pool.query(
				"INSERT INTO groups(groupname, orgid) VALUES($1, $2) RETURNING *",
				[month, orgid]
			);
			let members = [];
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
					"UPDATE users SET orgID = $1 WHERE userID = $2 RETURNING *",
					[orgid, userid]
				);
				const memberName =
					updateUserOrg.rows[0].fname + " " + updateUserOrg.rows[0].lname;
				members.push(memberName);

				const insertUsertoGroup = await pool.query(
					"INSERT INTO usertogroups(userID, groupID) VALUES($1, $2) RETURNING *",
					[userid, groupid]
				);
			}
			const updateGroupCountAndWeeks = await pool.query(
				"UPDATE schedules SET nummembers = $1 , weeks = $2 , indexMonth = $3 , yer = $4 WHERE groupID = $5 RETURNING *",
				[numMembers, weeks, indexMonth, year, groupid]
			);
			console.log(updateGroupCountAndWeeks.rows);
			const updateGroupMembers = await pool.query(
				"UPDATE groups SET members = $1 , yer = $2 WHERE groupID = $3 RETURNING *",
				[members, year, groupid]
			);
			// auto-send email of group creation to members in groups
		async function sendMail() {
			try {
				const accessToken = await oAuth2Client.getAccessToken()
		
				const transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
						type: 'OAuth2',
						user: '',
						clientId: CLIENT_ID,
						clientSecret: CLIENT_SECRET,
						refreshToken: REFRESH_TOKEN,
						accessToken: accessToken
					}
				})
		
				const mailOptions = {
					from: '',
					to: group,
					subject: "Strength^N Groups Created!",
					text: 'Hello! You have recently been added to a new Strength^N group, log onto to the app to see your new connections.',
					// html: optional
				};
		
				const result = await transporter.sendMail(mailOptions)
				return result;
		
			} catch (error) {
				return error;
			}
		}
		sendMail().then(result=> console.log('Email sent!', result)).catch(error=> console.log(error.message));
		}
		res.status(201).json({ msg: "Successfully made groups" });
	} catch (err) {
		console.log(err);
		res.status(500).json(`Error: ${err.json}`);
	}
});

module.exports = router;
