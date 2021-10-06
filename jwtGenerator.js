const jwt = require("jsonwebtoken");

const jwtGenerator = (userID) => {
    const payload = {
        user: {
            id: userID
        }
    };
    return jwt.sign(payload, "hello", { expiresIn: "1hr"});
}

module.exports = jwtGenerator;