const jwt = require("jsonwebtoken");

const jwtGenerator = (userID) => {
    const payload = {
        user: {
            id: userID
        }
    };
    return jwt.sign(payload, "hello", { expiresIn: "1h"});
}

module.exports = jwtGenerator;