const jwt = require("jsonwebtoken");

const jwtGenerator = (userID, fullName) => {
	const payload = {
		user: {
			id: userID,
			name: fullName,
		},
	};
	return jwt.sign(payload, "hello", { expiresIn: "1hr" });
};

module.exports = jwtGenerator;
